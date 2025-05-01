import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { User } from '../models';
import { validationResult } from 'express-validator';
import { AppRoutes } from '../types/AppRoutes';

interface LoginUser {
    email: string;
    password: string;
};

interface UserResponse {
    message: string;
    token: string;
    user: {
        _id: string;
        username: string;
        email: string;
    }
}


type LoginRequest = Request<{}, {}, AppRoutes["/api/users/login"]["POST"]["body"]>;
type LoginResponse = Response<AppRoutes["/api/users/login"]["POST"]["response"]>;


export const loginUser = async (req: LoginRequest, res: LoginResponse): Promise<void> => {
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
        if (process.env.JWT_SECRET && process.env.JWT_EXPIRY) {
            const token = jwt.sign({ email, userName: existingUser.username }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRY });
            res.status(200).json({
                message: "Login successful", token, user: {
                    _id: existingUser._id,
                    username: existingUser.username,
                    email: existingUser.email,
                }
            });
            return;
        }

    } catch (error) {
        console.error("Error during login", { error });
        res.status(500).json({ message: "Server error" });
        return;
    }
};