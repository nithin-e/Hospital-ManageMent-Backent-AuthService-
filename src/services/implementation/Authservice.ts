// services/implementation/AuthService.ts

import {
  IauthService,
  AuthResponse,
  DecodedToken,
} from "../interFace/AuthInterFace";
import AuthRepo from "../../repositories/implemetation/AuthRepo";
import jwt, { Secret } from "jsonwebtoken";

export default class AuthService implements IauthService {
  private _authRepo: AuthRepo;

  constructor(authRepo: AuthRepo) {
    this._authRepo = authRepo;
  }
  authenticateUser = async (
    token: string,
    requiredRole: string
  ): Promise<AuthResponse> => {
    try {
      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN || "retro-routes"
      ) as DecodedToken;

      console.log("Decoded token:", decoded);

      const isValidStructure = await this._authRepo.validateTokenStructure(
        decoded,
        requiredRole
      );
      if (!isValidStructure) {
        return {
          message: "Invalid token structure",
          success: false,
        };
      }

    
      console.log("response in sevise", isValidStructure);

      // Authentication successful
      return {
        userId: decoded.userId,
        role: decoded.role,
        message: "Authentication successful",
        success: true,
      };
    } catch (error) {
      console.log("Error in authentication service:", error);

      if (error instanceof jwt.JsonWebTokenError) {
        return {
          message: "Invalid token",
          success: false,
        };
      }

      if (error instanceof jwt.TokenExpiredError) {
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
}
