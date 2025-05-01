import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
    email: string;
    iat: number,
    exp: number,
    userName: string;
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        req.user = { email: decoded.email, name: decoded.userName };
        next();
        return;
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
        return;
    }
};
