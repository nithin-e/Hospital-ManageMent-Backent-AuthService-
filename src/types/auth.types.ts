
export interface AuthRequest {
  token: string;
  required_role: string;
}

export interface GrpcError {
  code: number;
  message: string;
  details?: string;
}

export interface GrpcCallData {
  request: AuthRequest;
}

export interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Define the gRPC call structure
export interface TokenVerificationCall {
  request: {
    token: string;
  };
}

// Define the response structure
export interface TokenVerificationResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  role?: string;
}

export type TokenVerificationCallback = (
  error: Error | null,
  response: TokenVerificationResponse
) => void;

export type GrpcCallback = (error: GrpcError | null, response?: AuthResponse) => void;



export interface DecodedToken {
    userId: string;
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