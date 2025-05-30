// repositories/implementation/AuthRepo.ts

import { IauthRepo, DecodedToken } from "../interFace/AuthInterFace";

export default class AuthRepo implements IauthRepo {
    
    validateTokenStructure = async (decoded: DecodedToken,requiredRole:any): Promise<boolean> => {
        try {
          
            
            console.log('chech out',requiredRole===decoded.role,decoded.role,requiredRole);
            console.log('....decodedrepo........',decoded.role);
            console.log('....requiredRole........',requiredRole);
            
            
            if (decoded.role !== requiredRole.toString()) {
                console.log('ithilaan kerye');
                
                return false;
            }
            
            return true;
        } catch (error) {
            console.log('Error validating token structure:', error);
            return false;
        }
    }

    checkRolePermissions = async (userRole: string, requiredRole: string): Promise<boolean> => {
        try {
          
            if (userRole === requiredRole) {
                return true;
            }
           
            const roleHierarchy: { [key: string]: string[] } = {
                'admin': ['admin', 'user', 'guest'],
                'user': ['user', 'guest'],
                'guest': ['guest']
            };
            
            const allowedRoles = roleHierarchy[userRole] || [];
            return allowedRoles.includes(requiredRole);
            
        } catch (error) {
            console.log('Error checking role permissions:', error);
            return false;
        }
    }
}