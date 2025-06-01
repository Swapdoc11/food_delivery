import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '@/utils/api';

// Async thunks
export const fetchTables = createAsyncThunk(
    'table/fetchTables',
    async (_, { getState }) => {
        const state = getState().table;
        const now = Date.now();

        // Return cached data if it's still fresh
        if (state.lastFetch && (now - state.lastFetch < CACHE_DURATION)) {
            return null; // Signal to use cached data
        }

        const response = await fetch(`${API_BASE_URL}/tables`);
        if (!response.ok) {
            throw new Error('Failed to fetch tables');
        }
        const data = await response.json();
        // Convert tables array to an object indexed by table number
        const tablesObject = {};
        if (Array.isArray(data.tables)) {
            data.tables.forEach(table => {
                // Preserve existing order data if available
                const existingTable = state.tables[table.tableNumber];
                tablesObject[table.tableNumber] = {
                    ...table,
                    currentOrder: existingTable?.currentOrder || table.currentOrder
                };
            });
        }
        return { tables: tablesObject, timestamp: now };
    }
);

export const createOrder = createAsyncThunk(
    'table/createOrder',
    async ({ tableNumber, items, servedBy }) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tableNumber,
                items,
                servedBy
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to create order');
        }
        
        const data = await response.json();
        return data.order;
    }
);

export const completeOrder = createAsyncThunk(
    'table/completeOrder',
    async ({ orderId, paymentMethod }) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId,
                paymentMethod,
                status: 'completed',
                paymentStatus: 'completed'
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to complete order');
        }
        
        const data = await response.json();
        return data.order;
    }
);

export const updateTableStatus = createAsyncThunk(
    'table/updateTableStatus',
    async ({ tableNumber, status, currentOrder }) => {
        const response = await fetch(`${API_BASE_URL}/tables`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tableNumber,
                status,
                currentOrder
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to update table status');
        }
        
        const data = await response.json();
        return data.table;
    }
);

const initialState = {
    tables: {},  // Object mapping tableNumber to table data
    activeTable: null,
    isInitialized: false,
    loading: false,
    error: null,
    currentOrder: null,
    lastFetch: null,  // Timestamp of last API fetch
    ordersCache: {}   // Cache for orders by table number
};

// Memoized selectors
export const selectTables = state => state.table.tables;
export const selectActiveTable = state => state.table.activeTable;
export const selectIsInitialized = state => state.table.isInitialized;
export const selectTableLoading = state => state.table.loading;
export const selectTableError = state => state.table.error;
export const selectCurrentOrder = state => state.table.currentOrder;

export const selectTableItems = createSelector(
    [selectTables, (_, tableId) => tableId],
    (tables, tableId) => tables[tableId] || []
);

export const selectTableTotal = createSelector(
    [selectTableItems],
    (items) => items.reduce((total, item) => total + (item.price * item.qty), 0)
);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const saveState = (state) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('tableState', JSON.stringify({
            tables: state.tables,
            activeTable: state.activeTable,
            ordersCache: state.ordersCache,
            lastFetch: state.lastFetch
        }));
    } catch (err) {
        console.error('Error saving table state:', err);
    }
};

const tableSlice = createSlice({
    name: 'table',
    initialState,
    reducers: {
        initializeTableState: (state) => {
            if (!state.isInitialized && typeof window !== 'undefined') {
                try {
                    const tableState = localStorage.getItem('tableState');
                    if (tableState) {
                        const parsed = JSON.parse(tableState);
                        state.tables = parsed.tables;
                        state.activeTable = parsed.activeTable;
                        state.ordersCache = parsed.ordersCache || {};
                        state.lastFetch = parsed.lastFetch;
                        
                        // Initialize the current order if there's an active table
                        if (state.activeTable && state.tables[state.activeTable]) {
                            const activeTable = state.tables[state.activeTable];
                            if (activeTable.currentOrder) {
                                state.currentOrder = activeTable.currentOrder;
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error loading table state:', err);
                }
                state.isInitialized = true;
            }
        },        setActiveTable: (state, action) => {
            const tableNumber = action.payload;
            const previousTable = state.activeTable;
            state.activeTable = tableNumber;

            // Cache the previous table's order if it exists
            if (previousTable && state.tables[previousTable]?.currentOrder) {
                const order = state.tables[previousTable].currentOrder;
                if (order._id) {
                    state.ordersCache[order._id] = { ...order, timestamp: Date.now() };
                }
            }

            // Update current order to match the active table's order
            if (state.tables[tableNumber]) {
                const currentOrder = state.tables[tableNumber].currentOrder;
                
                // If currentOrder is just an ID string, try to get it from cache
                if (typeof currentOrder === 'string') {
                    const cachedOrder = state.ordersCache[currentOrder];
                    if (cachedOrder && Date.now() - cachedOrder.timestamp < CACHE_DURATION) {
                        state.tables[tableNumber].currentOrder = { ...cachedOrder };
                        delete cachedOrder.timestamp;
                    } else {
                        // Initialize a new order object if no cache or cache expired
                        state.tables[tableNumber].currentOrder = {
                            _id: currentOrder,
                            tableNumber,
                            items: [],
                            subtotal: 0,
                            gst: 0,
                            total: 0,
                            status: 'pending'
                        };
                    }
                } else if (currentOrder && !currentOrder.items) {
                    state.tables[tableNumber].currentOrder.items = [];
                }

                // Set the current order state
                state.currentOrder = state.tables[tableNumber].currentOrder || null;
            } else {
                state.currentOrder = null;
            }
            saveState(state);
        },
        addItemToTable: (state, action) => {
            const { tableId, item } = action.payload;
            if (!state.tables[tableId]) {
                state.tables[tableId] = [];
            }
            
            const existingItem = state.tables[tableId].find(i => i.id === item.id);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                state.tables[tableId].push({ ...item, qty: 1 });
            }
            saveState(state);
        },
        removeItemFromTable: (state, action) => {
            const { tableId, itemId } = action.payload;
            if (state.tables[tableId]) {
                state.tables[tableId] = state.tables[tableId].filter(item => item.id !== itemId);
                saveState(state);
            }
        },        updateItemQuantity: (state, action) => {
            const { tableId, itemId, quantity } = action.payload;
            const table = state.tables[tableId];
            
            if (table && table.currentOrder) {
                const items = table.currentOrder.items;
                const itemIndex = items.findIndex(i => i.product === itemId);
                
                if (itemIndex !== -1) {
                    if (quantity <= 0) {
                        // Remove item if quantity is 0
                        items.splice(itemIndex, 1);
                    } else {
                        // Update quantity
                        items[itemIndex].quantity = quantity;
                    }
                    
                    // Recalculate totals
                    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
                    const gst = subtotal * 0.18;
                    table.currentOrder.subtotal = subtotal;
                    table.currentOrder.gst = gst;
                    table.currentOrder.total = subtotal + gst;
                    // Keep global current order in sync
                    state.currentOrder = table.currentOrder;
                }
            }
            saveState(state);
        },        addItemToOrder: (state, action) => {
            const { tableId, item } = action.payload;
            const table = state.tables[tableId];
            
            if (table) {
                // Initialize currentOrder if it doesn't exist
                if (!table.currentOrder) {
                    const newOrder = {
                        tableNumber: tableId,
                        items: [],
                        subtotal: 0,
                        gst: 0,
                        total: 0,
                        status: 'pending'
                    };
                    table.currentOrder = newOrder;
                    state.currentOrder = newOrder; // Set current order at the state level too
                }

                const items = table.currentOrder.items;
                const existingItemIndex = items.findIndex(i => i.product === item.product);
                
                if (existingItemIndex >= 0) {
                    items[existingItemIndex].quantity += 1;
                } else {
                    items.push({ ...item, quantity: 1 });
                }
                
                // Recalculate totals
                const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
                const gst = subtotal * 0.18;
                table.currentOrder.subtotal = subtotal;
                table.currentOrder.gst = gst;
                table.currentOrder.total = subtotal + gst;
                // Keep global current order in sync
                state.currentOrder = table.currentOrder;
                saveState(state);
            }
        },        clearTable: (state, action) => {
            const { tableId } = action.payload;
            if (state.tables[tableId]) {
                // Only clear the current order, not the entire table
                state.tables[tableId].currentOrder = null;
                state.tables[tableId].status = 'available';
                if (state.activeTable === tableId) {
                    state.currentOrder = null;
                }
                saveState(state);
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Tables
        builder
            .addCase(fetchTables.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTables.fulfilled, (state, action) => {
                state.loading = false;
                state.isInitialized = true;

                // If we got null, it means use cached data
                if (!action.payload) {
                    return;
                }

                state.lastFetch = action.payload.timestamp;
                state.tables = action.payload.tables;

                // Ensure currentOrder is synced with active table
                if (state.activeTable && state.tables[state.activeTable]) {
                    const activeTable = state.tables[state.activeTable];
                    if (activeTable.currentOrder) {
                        if (typeof activeTable.currentOrder === 'string') {
                            // If we have cached order data, use it
                            const cachedOrder = state.ordersCache[activeTable.currentOrder];
                            if (cachedOrder) {
                                activeTable.currentOrder = cachedOrder;
                            }
                        }
                        state.currentOrder = activeTable.currentOrder;
                    } else {
                        state.currentOrder = null;
                    }
                }
            })
            .addCase(fetchTables.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })        // Create Order
        builder.addCase(createOrder.fulfilled, (state, action) => {
            const tableNumber = action.payload.tableNumber;
            if (state.tables[tableNumber]) {
                state.tables[tableNumber].status = 'engaged';
                const orderData = {
                    ...action.payload,
                    _id: action.payload._id || action.payload,
                    tableNumber: tableNumber,
                    items: action.payload.items || [],
                    subtotal: action.payload.subtotal || 0,
                    gst: action.payload.gst || 0,
                    total: action.payload.total || 0,
                    status: action.payload.status || 'pending'
                };
                
                // Update both the table's current order and the cache
                state.tables[tableNumber].currentOrder = orderData;
                if (orderData._id) {
                    state.ordersCache[orderData._id] = { ...orderData, timestamp: Date.now() };
                }
                state.currentOrder = orderData;
            }
        })

        // Complete Order
        builder.addCase(completeOrder.fulfilled, (state, action) => {
            const tableNumber = action.payload.tableNumber;
            if (state.tables[tableNumber]) {
                // Cache the completed order before clearing it
                if (state.tables[tableNumber].currentOrder?._id) {
                    const completedOrder = {
                        ...state.tables[tableNumber].currentOrder,
                        status: 'completed',
                        completedAt: Date.now()
                    };
                    state.ordersCache[completedOrder._id] = { ...completedOrder, timestamp: Date.now() };
                }
                
                state.tables[tableNumber].status = 'available';
                state.tables[tableNumber].currentOrder = null;
                state.currentOrder = null;
            }
        })        // Update Table Status
        builder            .addCase(updateTableStatus.fulfilled, (state, action) => {
                const tableNumber = action.payload.tableNumber;
                if (state.tables[tableNumber]) {
                    state.tables[tableNumber].status = action.payload.status;
                    // If the table is being made available, clear the current order
                    if (action.payload.status === 'available') {
                        state.tables[tableNumber].currentOrder = null;
                        // Also clear the current order in the global state if this is the active table
                        if (state.activeTable === tableNumber) {
                            state.currentOrder = null;
                        }
                    } else {
                        // If the table is engaged, ensure the currentOrder is set
                        state.tables[tableNumber].currentOrder = state.tables[tableNumber].currentOrder || null;
                    }
                }
            })
    }
});

export const {
    setActiveTable,
    addItemToTable,
    removeItemFromTable,
    updateItemQuantity,
    addItemToOrder,
    clearTable,
    initializeTableState
} = tableSlice.actions;

export default tableSlice.reducer;
