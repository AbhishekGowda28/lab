import express from "express";
import cors from "cors";
import detenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";

detenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running");
});

const PORT = process.env.PORT ?? 5000;

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

app.use("/api/users", userRoutes);

export default app;