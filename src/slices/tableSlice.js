import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
    tables: {},  // Will store table-wise cart items
    activeTable: null,
    isInitialized: false
};

// Memoized selectors
export const selectTables = state => state.table.tables;
export const selectActiveTable = state => state.table.activeTable;
export const selectIsInitialized = state => state.table.isInitialized;

export const selectTableItems = createSelector(
    [selectTables, (_, tableId) => tableId],
    (tables, tableId) => tables[tableId] || []
);

export const selectTableTotal = createSelector(
    [selectTableItems],
    (items) => items.reduce((total, item) => total + (item.price * item.qty), 0)
);

const saveState = (state) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('tableState', JSON.stringify({
            tables: state.tables,
            activeTable: state.activeTable
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
                    }
                } catch (err) {
                    console.error('Error loading table state:', err);
                }
                state.isInitialized = true;
            }
        },
        setActiveTable: (state, action) => {
            state.activeTable = action.payload;
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
        },
        updateItemQuantity: (state, action) => {
            const { tableId, itemId, quantity } = action.payload;
            if (state.tables[tableId]) {
                const item = state.tables[tableId].find(i => i.id === itemId);
                if (item) {
                    if (quantity <= 0) {
                        state.tables[tableId] = state.tables[tableId].filter(i => i.id !== itemId);
                    } else {
                        item.qty = quantity;
                    }
                    saveState(state);
                }
            }
        },
        clearTable: (state, action) => {
            const { tableId } = action.payload;
            if (state.tables[tableId]) {
                state.tables[tableId] = [];
                saveState(state);
            }
        },
    },
});

export const { 
    initializeTableState,
    setActiveTable, 
    addItemToTable, 
    removeItemFromTable, 
    updateItemQuantity,
    clearTable,
} = tableSlice.actions;

export default tableSlice.reducer;
