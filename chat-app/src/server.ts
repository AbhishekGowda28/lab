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

app.get(["/", "/status"], (req, res) => {
    res.status(200).send("API is running");
});

const PORT = process.env.PORT ?? 5000;

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

app.use("/api/users", userRoutes);

app.use((req, res, next) => {
    res.status(404).send("You are looking at wrong location");
});

export default app;