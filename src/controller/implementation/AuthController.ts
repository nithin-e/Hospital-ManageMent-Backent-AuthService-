// controllers/implementation/AuthController.ts
import jwt, { Secret } from "jsonwebtoken";
import { IauthController } from "../interFace/AuthInterFace";
import AuthService from "../../services/implementation/Authservice";
import { DecodedToken } from "../../services/interFace/AuthInterFace";

export default class AuthController implements IauthController {
    private authService: AuthService;
    
    constructor(authService: AuthService) {
        this.authService = authService;
    }

    isAuthenticated = async (call: any, callback: any) => {
        try {
            console.log('Auth controller received request:', call.request);
            
            const { token, required_role } = call.request;  
            console.log('Token received:', !!token);
            console.log('Required role:', required_role);
            if (!token) {
                return callback(null, {
                    is_valid: false,
                    has_required_role: false,
                    message: "Token is mandatory",
                    user_id: "",
                    user_roles: []
                });
            }
    
            // Pass rolesArray to your service
            const response = await this.authService.authenticateUser(token, required_role);
            console.log('responce in controller',response);
            
            
            callback(null, response);
            
        } catch (error) {
            callback(null, {
                is_valid: false,
                has_required_role: false,
                message: "Internal server error",
                user_id: "",
                user_roles: []
            });
        }
    }

    verifyToken = async (call: any, callback: any) => {
        try {
            const refreshToken = call.request.token as string;
            
            console.log('Refresh token verification started');
            
            if (!refreshToken || refreshToken === undefined || refreshToken.trim() === '') {
                console.log('Invalid or missing refresh token');
                return callback(null, { 
                    success: false,
                    message: "Valid refresh token is required" 
                });
            }
    
            // Check if JWT_REFRESH_SECRET exists
            const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
            if (!refreshTokenSecret) {
                console.error('JWT_REFRESH_SECRET not configured');
                return callback(null, {
                    success: false,
                    message: "Server configuration error"
                });
            }
    
            // Check if ACCESS_TOKEN secret exists
            const accessTokenSecret = process.env.ACCESS_TOKEN;
            if (!accessTokenSecret) {
                console.error('ACCESS_TOKEN secret not configured');
                return callback(null, {
                    success: false,
                    message: "Server configuration error"
                });
            }
    console.log("enteredeee",refreshToken);
    
            // Verify the refresh token with the correct secret
            const decoded = jwt.verify(
                refreshToken,
                refreshTokenSecret  
            ) as DecodedToken;

            console.log("Refresh token decoded successfully:", {
                userId: decoded.userId,
                role: decoded.role,
                iat: decoded.iat,
                exp: decoded.exp
            });
            
            if (!decoded || !decoded.role || !decoded.userId) {
                console.log('Invalid refresh token structure');
                return callback(null, { 
                    success: false,
                    message: "Invalid refresh token structure" 
                });
            }
        
            // Generate new access token with longer expiry (15 minutes)
            const accessToken = jwt.sign(
                { 
                    userId: decoded.userId, 
                    role: decoded.role,
                   // Include email if available
                },
                accessTokenSecret,
                { expiresIn: '1m' } // Increased from 1m to 15m
            );
    
            // Generate new refresh token with longer expiry (7 days)
            const newRefreshToken = jwt.sign(
                { 
                    userId: decoded.userId, 
                    role: decoded.role,
                    
                },
                refreshTokenSecret,
                { expiresIn: '7d' } // Increased from 2m to 7 days
            );
    
            console.log('New tokens generated successfully');
            
            // Return the new tokens
            callback(null, {
                success: true,
                message: "Tokens refreshed successfully",
                accessToken: accessToken,
                refreshToken: newRefreshToken,
                userId: decoded.userId,
                role: decoded.role
            });
    
        } catch (error) {
            console.error("Error in verifyToken:", error);
            
            // Handle specific JWT errors
            return callback(null, {
                success: false,
                message: "expired token"
            });
            if (error instanceof jwt.JsonWebTokenError) {
            } else if (error instanceof jwt.TokenExpiredError) {
                console.log('ingoottt vaaaaaaaaaaaaaa');
                
                return callback(null, {
                    success: false,
                    message: "Refresh token has expired - please login again"
                });
            }
            
            // Handle other errors
            callback(null, {
                success: false,
                message: "Token verification failed"
            });
        }
    }


}