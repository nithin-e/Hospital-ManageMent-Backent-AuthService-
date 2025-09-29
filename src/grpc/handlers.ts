import { container } from '../config/inversify.congic';
import { AuthController } from '../controllers/auth.controller';
import { TYPES } from '../types/inversify';

const authController = container.get<AuthController>(TYPES.AuthController);

export const authGrpcHandlers = {
    ValidateToken: authController.isAuthenticated,
    RefreshToken: authController.verifyToken,
};
