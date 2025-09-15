"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthRepo {
    constructor() {
        this.validateTokenStructure = async (decoded, requiredRole) => {
            try {
                console.log('chech out', requiredRole === decoded.role, decoded.role, requiredRole);
                console.log('....decodedrepo........', decoded.role);
                console.log('....requiredRole........', requiredRole);
                if (decoded.role !== requiredRole.toString()) {
                    console.log('ithilaan kerye');
                    return false;
                }
                return true;
            }
            catch (error) {
                console.log('Error validating token structure:', error);
                return false;
            }
        };
        this.checkRolePermissions = async (userRole, requiredRole) => {
            try {
                if (userRole === requiredRole) {
                    return true;
                }
                const roleHierarchy = {
                    'admin': ['admin', 'user', 'guest'],
                    'user': ['user', 'guest'],
                    'guest': ['guest']
                };
                const allowedRoles = roleHierarchy[userRole] || [];
                return allowedRoles.includes(requiredRole);
            }
            catch (error) {
                console.log('Error checking role permissions:', error);
                return false;
            }
        };
    }
}
exports.default = AuthRepo;
