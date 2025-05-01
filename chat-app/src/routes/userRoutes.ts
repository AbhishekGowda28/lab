import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models"
import { body, validationResult, } from "express-validator";
import { AppRoutes } from "../types/AppRoutes";

type RegisterRequest = Request<{}, {}, AppRoutes["/api/users/register"]["POST"]["body"]>;
type RegisterResponse = Response<AppRoutes["/api/users/register"]["POST"]["response"]>;

type LoginRequest = Request<{}, {}, AppRoutes["/api/users/login"]["POST"]["body"]>;
type LoginResponse = Response<AppRoutes["/api/users/login"]["POST"]["response"]>;

const router = Router();

router.post("/register", [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
], async (req: RegisterRequest, res: RegisterResponse): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt,
        });
        return;
    } catch (error) {
        console.error("Error registering user", { error });
        res.status(500).json({ message: "Server error" });
        return;
    }
});

router.post("/login", [
    body("email").isEmail().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required")
], async (req: LoginRequest, res: LoginResponse): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        res.status(200).json({
            _id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            createdAt: existingUser.createdAt,
        });
        return;

    } catch (error) {
        console.error("Error during login", { error });
        res.status(500).json({ message: "Server error" });
        return;
    }
});

export default router;