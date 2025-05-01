import mongoose from "mongoose";
import mongoDB, { closeMongoDBConnection } from "./db";

describe("MongoDB", () => {

    // We override process.exit to simulate exiting the process and verify it gets called.
    let originalExit: NodeJS.Process["exit"];

    beforeAll(() => {
        originalExit = process.exit;
        process.exit = jest.fn() as unknown as NodeJS.Process["exit"]; // Mock process.exit
    });

    describe("mongoDB connection", () => {
        const MOCK_URI = "mongodb://localhost:27017/testdb";

        beforeEach(() => {
            // Mock logging so tests remain clean
            jest.spyOn(console, "log").mockImplementation(() => { });
            jest.spyOn(console, "error").mockImplementation(() => { });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("should connect successfully with a valid URI", async () => {
            // Simulate disconnected state
            (mongoose.connection as any).readyState = 0;
            const connectSpy = jest
                .spyOn(mongoose, "connect")
                .mockResolvedValueOnce(mongoose as any);

            await mongoDB(MOCK_URI);
            expect(connectSpy).toHaveBeenCalledWith(MOCK_URI);
        });

        test("should not reconnect if already connected", async () => {
            // Simulate already connected state
            (mongoose.connection as any).readyState = 1;
            const connectSpy = jest
                .spyOn(mongoose, "connect")
                .mockResolvedValueOnce(mongoose as any);

            await mongoDB(MOCK_URI);
            expect(connectSpy).not.toHaveBeenCalled();
        });

        test("should handle missing URI and exit process", async () => {
            // Simulate missing URI by providing an empty string.
            // We override process.exit to throw so we can catch it.
            const exitSpy = jest
                .spyOn(process, "exit")
                .mockImplementationOnce(() => {
                    throw new Error("process.exit");
                });
            await expect(mongoDB("")).rejects.toThrow("process.exit");
            exitSpy.mockRestore();
        });

        test("should handle connection failure and exit", async () => {
            (mongoose.connection as any).readyState = 0;
            const error = new Error("Connection failed");
            jest.spyOn(mongoose, "connect").mockRejectedValueOnce(error);
            const exitSpy = jest
                .spyOn(process, "exit")
                .mockImplementationOnce(() => {
                    throw new Error("process.exit");
                });
            await expect(mongoDB(MOCK_URI)).rejects.toThrow("process.exit");
            expect(console.error).toHaveBeenCalledWith(
                "MonogoDB connection error",
                expect.objectContaining({ error })
            );
            exitSpy.mockRestore();
        });
    });

    describe("closeMongoDBConnection", () => {
        beforeEach(() => {
            jest.spyOn(console, "log").mockImplementation(() => { });
            jest.spyOn(console, "error").mockImplementation(() => { });
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("should disconnect successfully", async () => {
            const disconnectSpy = jest
                .spyOn(mongoose, "disconnect")
                .mockResolvedValueOnce();
            await closeMongoDBConnection();
            expect(disconnectSpy).toHaveBeenCalled();
        });

        test("should handle error during disconnection", async () => {
            const error = new Error("Disconnect failed");
            jest.spyOn(mongoose, "disconnect").mockRejectedValueOnce(error);
            await closeMongoDBConnection();
            expect(console.error).toHaveBeenCalledWith(
                "Error disconnecting from MongoDB:",
                error
            );
        });
    });

    afterAll(() => {
        // Restore process.exit for other tests or processes
        process.exit = originalExit;
    });
});