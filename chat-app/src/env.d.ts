declare namespace NodeJS {
    interface ProcessEnv {
        PORT: number;
        MONGO_URI: string;
        JWT_SECRET: string
        JWT_EXPIRY: number; // Follows - import type { StringValue } from "ms";
        MONGOMS_DISTRO: string;
        MONGOMS_VERSION: string;
        SALT_ROUNDS: string;
    }
}