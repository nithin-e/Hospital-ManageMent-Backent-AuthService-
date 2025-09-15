"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const AuthController_1 = __importDefault(require("./controller/implementation/AuthController"));
const Authservice_1 = __importDefault(require("./services/implementation/Authservice"));
const AuthRepo_1 = __importDefault(require("./repositories/implemetation/AuthRepo"));
const AuthRepo = new AuthRepo_1.default();
const Authservice = new Authservice_1.default(AuthRepo);
const AuthController = new AuthController_1.default(Authservice);
console.log('Loading proto file for gRPC...');
const protoPath = path_1.default.resolve(__dirname, './proto/auth.proto');
console.log('Proto file path:', protoPath);
const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
});
console.log('Proto file loaded successfully');
const grpcObject = grpc.loadPackageDefinition(packageDef);
const authProto = grpcObject.Auth;
const grpcServer = new grpc.Server({
    'grpc.max_send_message_length': 10 * 1024 * 1024,
    'grpc.max_receive_message_length': 10 * 1024 * 1024
});
console.log('gRPC server created');
console.log('Adding services to gRPC server...');
grpcServer.addService(authProto.AuthService.service, {
    ValidateToken: AuthController.isAuthenticated,
    RefreshToken: AuthController.verifyToken
});
console.log('Services added to gRPC server');
const startGrpcServer = () => {
    const port = process.env.Auth_GRPC_PORT || process.env.Auth_PORT;
    const domain = process.env.NODE_ENV === 'dev' ? (process.env.DEV_DOMAIN || 'localhost') : process.env.PRO_DOMAIN_USER;
    console.log(`Preparing to start gRPC server on ${domain}:${port}`);
    grpcServer.bindAsync(`${domain}:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
        if (err) {
            console.error("Error starting gRPC server:", err);
            return;
        }
        console.log("\x1b[42m\x1b[30m%s\x1b[0m", `🚀 [INFO] gRPC AUTH server started on port: ${bindPort} ✅`);
    });
};
console.log('Starting servers...');
startGrpcServer();
