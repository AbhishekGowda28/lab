import mongoose from "mongoose";

const mongoDB = async (connectingUri?: string) => {
    try {
        const uri = connectingUri || process.env.MONGO_URI as string;

        if (!uri) {
            throw new Error("MongoDB URI not found");
        }

        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log("MongoDB already connected");
            return;
        }
        await mongoose.connect(uri);
    } catch (error) {
        console.error("MonogoDB connection error", { error })
        process.exit(1);
    }
};

export const closeMongoDBConnection = async () => {
    try {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
    }
};

export default mongoDB;