import { DecodedToken } from "../../types/auth.types";
import { IAuthRepository } from "../interFace/IAuthRepository";

export default class AuthRepository implements IAuthRepository {
  /**
   * Validates token structure.
   * Ensures the decoded token contains the required role.
   *
   * @param decoded - Decoded JWT payload
   * @param requiredRole - Role required for access
   * @returns Promise<boolean> - True if valid, otherwise false
   */
  validateTokenStructure = async (
    decoded: DecodedToken,
    requiredRole: string
  ): Promise<boolean> => {
    try {
      return decoded.role === requiredRole;
    } catch (error) {
      console.log("Error validating token structure:", error);
      return false;
    }
  };
}
