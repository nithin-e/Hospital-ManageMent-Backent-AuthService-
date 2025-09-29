import jwt from 'jsonwebtoken';
import {
    DecodedToken,
    GrpcCallback,
    GrpcCallData,
    TokenVerificationCall,
    TokenVerificationCallback,
} from '../types/auth.types';
import { IAuthService } from '../services/interfaces/IAuthService';
import {
    AuthCallbackResponse,
    TokenVerificationResponse,
} from '../mappers/authcallback-response';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';

@injectable()
export class AuthController {
    constructor(
        @inject(TYPES.AuthService) private _authService: IAuthService
    ) {}

    /**
     * Role-based authentication.
     * Validates token and checks required role.
     *
     * @param call - gRPC call with token and role
     * @param callback - gRPC callback for response
     */
    isAuthenticated = async (call: GrpcCallData, callback: GrpcCallback) => {
        try {
            const { token, required_role } = call.request;

            if (!token) {
                return callback(
                    null,
                    AuthCallbackResponse.error('Token is mandatory')
                );
            }

            const response = await this._authService.authenticateUser(
                token,
                required_role
            );

            callback(null, response);
        } catch (error) {
            console.error('Authentication error:', error);
            callback(null, AuthCallbackResponse.error('Internal server error'));
        }
    };

    /**
     * Token verification & refresh.
     * Generates new access/refresh tokens if refresh token is valid.
     *
     * @param call - gRPC call with refresh token
     * @param callback - gRPC callback for response
     */
    verifyToken = async (
        call: TokenVerificationCall,
        callback: TokenVerificationCallback
    ): Promise<void> => {
        try {
            const refreshToken = call.request.token as string;

            if (!refreshToken || !refreshToken.trim()) {
                return callback(
                    null,
                    TokenVerificationResponse.error(
                        'Valid refresh token is required'
                    )
                );
            }

            const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
            const accessTokenSecret = process.env.ACCESS_TOKEN;

            if (!refreshTokenSecret || !accessTokenSecret) {
                return callback(
                    null,
                    TokenVerificationResponse.error(
                        'Server configuration error'
                    )
                );
            }

            const decoded = jwt.verify(
                refreshToken,
                refreshTokenSecret
            ) as DecodedToken;

            if (!decoded?.role || !decoded?.userId) {
                return callback(
                    null,
                    TokenVerificationResponse.error(
                        'Invalid refresh token structure'
                    )
                );
            }

            const accessToken = jwt.sign(
                { userId: decoded.userId, role: decoded.role },
                accessTokenSecret,
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign(
                { userId: decoded.userId, role: decoded.role },
                refreshTokenSecret,
                { expiresIn: '7d' }
            );

            callback(
                null,
                TokenVerificationResponse.success(
                    decoded.userId,
                    decoded.role,
                    accessToken,
                    newRefreshToken
                )
            );
        } catch (error) {
            console.error('Error in verifyToken:', error);

            if (error instanceof jwt.JsonWebTokenError) {
                return callback(
                    null,
                    TokenVerificationResponse.error(
                        error.name === 'TokenExpiredError'
                            ? 'Expired token'
                            : 'Invalid token'
                    )
                );
            }

            callback(
                null,
                TokenVerificationResponse.error('Token verification failed')
            );
        }
    };
}
