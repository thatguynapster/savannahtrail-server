import { Request, Response, NextFunction } from "express";
import { getAllPackagesController } from "./packages";
import { aggregatePaginatePackages } from "../services/packages";

// Mock the service
jest.mock("../services/packages");

describe("getAllPackagesController", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            query: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should respect the limit parameter when provided", async () => {
        // Arrange
        mockRequest.query = { limit: "2" };

        const mockPackages = {
            docs: [
                { _id: "1", title: "Package 1" },
                { _id: "2", title: "Package 2" },
            ],
            total: 12,
            limit: 2,
            page: 1,
            pages: 6,
        };

        (aggregatePaginatePackages as jest.Mock).mockResolvedValue(mockPackages);

        // Act
        await getAllPackagesController(mockRequest as Request, mockResponse as Response, mockNext);

        // Assert
        expect(aggregatePaginatePackages).toHaveBeenCalledWith(
            [{ $match: {} }],
            expect.objectContaining({
                limit: 2,
                pagination: true,
            })
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith({
            success: true,
            code: 200,
            message: "Packages retrieved successfully",
            responses: mockPackages,
        });
    });

    it("should use default limit of 10 when not provided", async () => {
        // Arrange
        const mockPackages = {
            docs: Array(10)
                .fill(null)
                .map((_, i) => ({ _id: `${i}`, title: `Package ${i}` })),
            total: 12,
            limit: 10,
            page: 1,
            pages: 2,
        };

        (aggregatePaginatePackages as jest.Mock).mockResolvedValue(mockPackages);

        // Act
        await getAllPackagesController(mockRequest as Request, mockResponse as Response, mockNext);

        // Assert
        expect(aggregatePaginatePackages).toHaveBeenCalledWith(
            [{ $match: {} }],
            expect.objectContaining({
                limit: 10,
                pagination: true,
            })
        );
    });

    it("should filter by status when provided", async () => {
        // Arrange
        mockRequest.query = { status: "active", limit: "5" };

        const mockPackages = {
            docs: Array(5)
                .fill(null)
                .map((_, i) => ({
                    _id: `${i}`,
                    title: `Package ${i}`,
                    status: "active",
                })),
            total: 5,
            limit: 5,
            page: 1,
            pages: 1,
        };

        (aggregatePaginatePackages as jest.Mock).mockResolvedValue(mockPackages);

        // Act
        await getAllPackagesController(mockRequest as Request, mockResponse as Response, mockNext);

        // Assert
        expect(aggregatePaginatePackages).toHaveBeenCalledWith(
            [{ $match: { status: "active" } }],
            expect.objectContaining({
                limit: 5,
                pagination: true,
            })
        );
    });

    it("should handle errors and call next", async () => {
        // Arrange
        const error = new Error("Database error");
        (aggregatePaginatePackages as jest.Mock).mockRejectedValue(error);

        // Act
        await getAllPackagesController(mockRequest as Request, mockResponse as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(error);
    });
});
