import jwt, { Secret } from "jsonwebtoken";
import AuthService from "../../services/implementation/Authservice";
import { AuthResponse } from "../../repositories/interFace/AuthInterFace";

interface AuthRequest {
  token: string;
  required_role: string;
}

interface GrpcError {
  code: number;
  message: string;
  details?: string;
}

interface GrpcCallData {
  request: AuthRequest;
}

interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Define the gRPC call structure
interface TokenVerificationCall {
  request: {
    token: string;
  };
}

// Define the response structure
interface TokenVerificationResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  role?: string;
}

type TokenVerificationCallback = (
  error: Error | null,
  response: TokenVerificationResponse
) => void;

type GrpcCallback = (error: GrpcError | null, response?: AuthResponse) => void;



export default class AuthController {
  private _authService: AuthService;

  constructor(authService: AuthService) {
    this._authService = authService;
  }

  isAuthenticated = async (call: GrpcCallData, callback: GrpcCallback) => {
    try {
      const { token, required_role } = call.request;


      console.log('check this call.request',call.request);
      

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

      // Pass rolesArray to your service
      const response = await this._authService.authenticateUser(
        token,
        required_role
      );
      console.log("response in controller", response);

      callback(null, response);
    } catch (error) {
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

  verifyToken = async (
    call: TokenVerificationCall,
    callback: TokenVerificationCallback
  ): Promise<void> => {
    try {
      const refreshToken = call.request.token as string;

      console.log("Refresh token verification started");

      if (
        !refreshToken ||
        refreshToken === undefined ||
        refreshToken.trim() === ""
      ) {
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

    
      const decoded = jwt.verify(
        refreshToken,
        refreshTokenSecret
      ) as DecodedToken;

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

      
      const accessToken = jwt.sign(
        {
          userId: decoded.userId,
          role: decoded.role,
         
        },
        accessTokenSecret,
        { expiresIn: "1m" } 
      );

      const newRefreshToken = jwt.sign(
        {
          userId: decoded.userId,
          role: decoded.role,
        },
        refreshTokenSecret,
        { expiresIn: "7d" } 
      );

      console.log("New tokens generated successfully");

    
      callback(null, {
        success: true,
        message: "Tokens refreshed successfully",
        accessToken: accessToken,
        refreshToken: newRefreshToken,
        userId: decoded.userId,
        role: decoded.role,
      });
    } catch (error) {
      console.error("Error in verifyToken:", error);

      
      if (error instanceof jwt.JsonWebTokenError) {
        return callback(null, {
          success: false,
          message:
            error.name === "TokenExpiredError"
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
}
