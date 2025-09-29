import { Container } from 'inversify';
import { TYPES } from '../types/inversify';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/implementations/auth.service';
import { IAuthService } from '../services/interfaces/IAuthService';
import { AuthRepository } from '../repositories/implemetations/auth.repository';
import { IAuthRepository } from '../repositories/interfaces/IAuthRepository';

export const container = new Container();

container.bind<IAuthRepository>(TYPES.AuthRepository).to(AuthRepository);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind(TYPES.AuthController).to(AuthController);
