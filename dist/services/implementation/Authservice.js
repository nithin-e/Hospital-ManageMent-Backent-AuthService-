"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor(authRepo) {
        this.authenticateUser = async (token, requiredRole) => {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN || "retro-routes");
                console.log("Decoded token:", decoded);
                const isValidStructure = await this._authRepo.validateTokenStructure(decoded, requiredRole);
                if (!isValidStructure) {
                    return {
                        message: "Invalid token structure",
                        success: false,
                    };
                }
                console.log("response in sevise", isValidStructure);
                return {
                    userId: decoded.userId,
                    role: decoded.role,
                    message: "Authentication successful",
                    success: true,
                };
            }
            catch (error) {
                console.log("Error in authentication service:", error);
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    return {
                        message: "Invalid token",
                        success: false,
                    };
                }
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    return {
                        message: "Token expired",
                        success: false,
                    };
                }
                return {
                    message: "Authentication failed",
                    success: false,
                };
            }
        };
        this._authRepo = authRepo;
    }
}
exports.default = AuthService;
