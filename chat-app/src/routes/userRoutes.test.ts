import request from "supertest";
import app from "../server";
import mongoose, { mongo } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User";
import mongoDB, { closeMongoDBConnection } from "../config/db";

let mongoServer: MongoMemoryServer;

describe("User", () => {
    beforeAll(async () => {

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        console.log("MongoDB URI:", uri);
        if (uri) {
            await mongoDB(uri);
            console.log("MongoDB connected");
        }
    }, 3000000);
    afterAll(async () => {
        if (mongoose.connection.db) {
            await mongoose.connection.db.dropDatabase();
            await mongoose.connection.close();
        }
        await closeMongoDBConnection();
        if (mongoServer) {
            await mongoServer.stop();
        }
    }, 300000);

    describe("User routes", () => {
        beforeEach(async () => {
            await User.deleteMany({});
        });

        describe("POST /api/users/register", () => {

            it("should register a new user", async () => {
                const response = await request(app).post("/api/users/register").send({
                    username: "testuser",
                    email: "test@example.com",
                    password: "password123",
                });
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty("_id");
            });
            it("should return 400 if invalid fields are provided ", async () => {
                const response = await request(app).post("/api/users/register").send({
                    username: "",
                    email: "test.com",
                    password: "password123",
                });
                expect(response.status).toBe(400);
            });
            it("should return 400 if user already exists", async () => {
                await User.create({
                    username: "testuser",
                    email: "test@example.com",
                    password: "password123",
                });
                const response = await request(app).post("/api/users/register").send({
                    username: "testuser",
                    email: "test@example.com",
                    password: "password123",
                });
                expect(response.status).toBe(400);
            });
        });

        describe("POST /api/users/login", () => {
            it("should login an existing user", async () => {
                await request(app).post("/api/users/register").send({
                    username: "testuser",
                    email: "testUser@user.com",
                    password: "password123"
                });
                const response = await request(app).post("/api/users/login").send({
                    email: "testUser@user.com",
                    password: "password123",
                });
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("_id");
            });
            it("should return 400 if email or password is not provided", async () => {
                const response = await request(app).post("/api/users/login").send({
                    email: "",
                    password: "password123",
                });
                expect(response.status).toBe(400);
            });

            it("should return 400 if email or password is incorrect", async () => {
                await request(app).post("/api/users/register").send({
                    username: "testuser",
                    email: "test@user.com",
                    password: "password123",
                });
                const response = await request(app).post("/api/users/login").send({
                    email: "user@user.com",
                    password: "wrongpassword",
                });
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty("message", "Invalid email or password");
            });
        });
    });
});