import mongoose from "mongoose";


export const MONGODB_URI = "mongodb+srv://swapnilsendme:Swapdoc22@cluster0.4ccrbz4.mongodb.net/food-delivery?retryWrites=true&w=majority&appName=Cluster0"


// export async function connectDB() {
//     // if (mongoose.connection.readyState >= 1) return;
        
//     return mongoose.connect(MONGODB_URI,{useNewUrlParser: true, useUnifiedTopology: true})
//         .then(() => console.log("MongoDB connected"))
//         .catch((err) => console.error("MongoDB connection error:", err));

// }