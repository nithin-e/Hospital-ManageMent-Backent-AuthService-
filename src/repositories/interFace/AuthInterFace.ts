
export  interface IauthRepo{
    validateTokenStructure(call:any,callback:any):Promise<any>
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
}