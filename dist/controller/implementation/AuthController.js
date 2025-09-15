"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthController {
    constructor(authService) {
        this.isAuthenticated = async (call, callback) => {
            try {
                const { token, required_role } = call.request;
                if (!token) {
                    return callback(null, {
                        is_valid: false,
                        has_required_role: false,
                        message: "Token is mandatory",
                        user_id: "",
                        user_roles: [],
                        success: false,
                    });
                }
                const response = await this._authService.authenticateUser(token, required_role);
                console.log("response in controller", response);
                callback(null, response);
            }
            catch (error) {
                console.error("Authentication error:", error);
                callback(null, {
                    is_valid: false,
                    has_required_role: false,
                    message: "Internal server error",
                    user_id: "",
                    user_roles: [],
                    success: false,
                });
            }
        };
        this.verifyToken = async (call, callback) => {
            try {
                const refreshToken = call.request.token;
                console.log("Refresh token verification started");
                if (!refreshToken ||
                    refreshToken === undefined ||
                    refreshToken.trim() === "") {
                    console.log("Invalid or missing refresh token");
                    return callback(null, {
                        success: false,
                        message: "Valid refresh token is required",
                    });
                }
                const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
                if (!refreshTokenSecret) {
                    console.error("JWT_REFRESH_SECRET not configured");
                    return callback(null, {
                        success: false,
                        message: "Server configuration error",
                    });
                }
                const accessTokenSecret = process.env.ACCESS_TOKEN;
                if (!accessTokenSecret) {
                    console.error("ACCESS_TOKEN secret not configured");
                    return callback(null, {
                        success: false,
                        message: "Server configuration error",
                    });
                }
                console.log("enteredeee", refreshToken);
                const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshTokenSecret);
                console.log("Refresh token decoded successfully:", {
                    userId: decoded.userId,
                    role: decoded.role,
                    iat: decoded.iat,
                    exp: decoded.exp,
                });
                if (!decoded || !decoded.role || !decoded.userId) {
                    console.log("Invalid refresh token structure");
                    return callback(null, {
                        success: false,
                        message: "Invalid refresh token structure",
                    });
                }
                const accessToken = jsonwebtoken_1.default.sign({
                    userId: decoded.userId,
                    role: decoded.role,
                }, accessTokenSecret, { expiresIn: "1m" });
                const newRefreshToken = jsonwebtoken_1.default.sign({
                    userId: decoded.userId,
                    role: decoded.role,
                }, refreshTokenSecret, { expiresIn: "7d" });
                console.log("New tokens generated successfully");
                callback(null, {
                    success: true,
                    message: "Tokens refreshed successfully",
                    accessToken: accessToken,
                    refreshToken: newRefreshToken,
                    userId: decoded.userId,
                    role: decoded.role,
                });
            }
            catch (error) {
                console.error("Error in verifyToken:", error);
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    return callback(null, {
                        success: false,
                        message: error.name === "TokenExpiredError"
                            ? "expired token"
                            : "Invalid token",
                    });
                }
                return callback(null, {
                    success: false,
                    message: "Token verification failed",
                });
            }
        };
        this._authService = authService;
    }
}
exports.default = AuthController;
