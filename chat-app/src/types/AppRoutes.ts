import { ValidationError } from 'express-validator';

export interface AppRoutes {
    /* User Routes */
    "/api/users/register": {
        POST: {
            body: {
                username: string;
                email: string;
                password: string;
            };
            response: {
                _id: string;
                username: string;
                email: string;
                createdAt: Date;
            } | {
                errors: Array<ValidationError>;
            } | {
                message: string;
            };
        };
    };
    "/api/users/login": {
        POST: {
            body: {
                email: string;
                password: string;
            };
            response: {
                _id: string;
                username: string;
                email: string;
                createdAt: Date;
            } | {
                errors: Array<ValidationError>;
            } | {
                message: string;
            };
        };
    };
}