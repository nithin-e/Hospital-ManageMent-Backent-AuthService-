import { AuthResponse } from "../../types/auth.types";

export  interface IAuthService{
    authenticateUser(token: string, requiredRole: string):Promise<AuthResponse>
}

