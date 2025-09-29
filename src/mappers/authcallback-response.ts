
export class AuthCallbackResponse {
  is_valid: boolean;
  has_required_role: boolean;
  message: string;
  user_id: string;
  user_roles: string[];
  success: boolean;

  constructor(
    is_valid: boolean,
    has_required_role: boolean,
    message: string,
    user_id: string = "",
    user_roles: string[] = [],
    success: boolean = false
  ) {
    this.is_valid = is_valid;
    this.has_required_role = has_required_role;
    this.message = message;
    this.user_id = user_id;
    this.user_roles = user_roles;
    this.success = success;
  }


  static error(message: string): AuthCallbackResponse {
    return new AuthCallbackResponse(false, false, message);
  }

  static success(
    user_id: string,
    user_roles: string[],
    message: string = "Authentication successful"
  ): AuthCallbackResponse {
    return new AuthCallbackResponse(true, true, message, user_id, user_roles, true);
  }
}


export class TokenVerificationResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: string;

  constructor(
    success: boolean = false,
    message: string = "",
    accessToken: string = "",
    refreshToken: string = "",
    userId: string = "",
    role: string = ""
  ) {
    this.success = success;
    this.message = message;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
    this.role = role;
  }

  static error(message: string): TokenVerificationResponse {
    return new TokenVerificationResponse(false, message);
  }

  static success(
    userId: string,
    role: string,
    accessToken: string,
    refreshToken: string,
    message: string = "Tokens refreshed successfully"
  ): TokenVerificationResponse {
    return new TokenVerificationResponse(true, message, accessToken, refreshToken, userId, role);
  }
}
