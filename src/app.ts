import authRepo from "./repositories/implemetation/AuthRepository"
import authService from "./services/implementation/Authservice";
import authController from "./controller/implementation/AuthController";

const AuthRepo = new authRepo();
const AuthService = new authService(AuthRepo);
export const AuthController = new authController(AuthService);
