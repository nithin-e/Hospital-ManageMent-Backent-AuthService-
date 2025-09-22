import { DecodedToken } from "../../types/auth.types";

export  interface IAuthRepository{
    validateTokenStructure(decoded: DecodedToken,requiredRole?:string):Promise<boolean>
}


