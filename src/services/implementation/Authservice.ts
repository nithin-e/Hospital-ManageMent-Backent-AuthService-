
import jwt from "jsonwebtoken";
import { IAuthService } from "../interFace/IAuthService";
import {  DecodedToken } from "../../types/auth.types";
import { IAuthRepository } from "../../repositories/interFace/IAuthRepository";
import { AuthCallbackResponse } from "../../types/authCallbackResponse";

export default class AuthService implements IAuthService {
  private _authRepo: IAuthRepository;

  constructor(authRepo: IAuthRepository) {
    this._authRepo = authRepo;
  }

  /**
   * Role-based authentication.
   * Validates the JWT token and checks if the user has the required role.
   *
   * @param token - JWT access token
   * @param requiredRole - Role required for access
   * @returns Promise<AuthResponse> - Authentication result
   */
  authenticateUser = async (
  token: string,
  requiredRole: string
): Promise<AuthCallbackResponse> => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN || "heal-nova"
    ) as DecodedToken;

    console.log("Decoded token:", decoded);

    const isValidStructure = await this._authRepo.validateTokenStructure(
      decoded,
      requiredRole
    );

    if (!isValidStructure) {
      return AuthCallbackResponse.error("Invalid token structure");
    }

    console.log("response in service", isValidStructure);

    return AuthCallbackResponse.success(
      decoded.userId,
      [decoded.role], // user_roles as array
      "Authentication successful"
    );
  } catch (error) {
    console.log("Error in authentication service:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return AuthCallbackResponse.error("Token expired");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return AuthCallbackResponse.error("Invalid token");
    }

    return AuthCallbackResponse.error("Authentication failed");
  }
};
}
