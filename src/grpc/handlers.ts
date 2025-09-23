import { AuthController } from "../app";

export const authGrpcHandlers = {
  ValidateToken: AuthController.isAuthenticated,
  RefreshToken: AuthController.verifyToken,
};
