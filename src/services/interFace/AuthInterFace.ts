
export  interface IauthService{
    authenticateUser(token: string, requiredRole: string):Promise<AuthResponse>
}


export interface DecodedToken {
    userId?: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface AuthResponse {
    userId?: string;
    role?: string;
    message: string;
    success: boolean;
    is_valid?:boolean;
    has_required_role?:boolean;
    user_roles?:string[];
    user_id?:string;
}