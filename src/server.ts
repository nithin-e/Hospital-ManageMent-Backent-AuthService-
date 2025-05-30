import express from 'express';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import "dotenv/config";
import path from 'path';



// import controllers
import authController from "../src/controller/implementation/AuthController";



// import services
import authservice from "../src/services/implementation/Authservice";


//import repo
import authRepo from "../src/repositories/implemetation/AuthRepo";





const AuthRepo=new authRepo()
const Authservice=new authservice(AuthRepo)
const AuthController =new authController(Authservice)
















const app = express();
// const httpServer = http.createServer(app);









// Load proto file for gRPC
console.log('Loading proto file for gRPC...');
const protoPath = path.resolve(__dirname, './proto/auth.proto');
console.log('Proto file path:', protoPath);

// Both in gateway and auth service
const packageDef = protoLoader.loadSync(protoPath, {
  keepCase: true,        
  longs: String,
  enums: String, 
  defaults: true,           
});
console.log('Proto file loaded successfully');

const grpcObject = grpc.loadPackageDefinition(packageDef) as unknown as any;
 const authProto = grpcObject.Auth;



//  console.log('Auth service found in proto file',authProto);


// Create gRPC server
// In notification service where you create the grpc server
const grpcServer = new grpc.Server({
  'grpc.max_send_message_length': 10 * 1024 * 1024, 
  'grpc.max_receive_message_length': 10 * 1024 * 1024 
});
console.log('gRPC server created');



// Add gRPC services
console.log('Adding services to gRPC server...');
grpcServer.addService(authProto.AuthService.service, {
  ValidateToken:AuthController.isAuthenticated,
   RefreshToken:AuthController.verifyToken

});




console.log('Services added to gRPC server');

// Start gRPC server
const startGrpcServer = () => {
  const port = process.env.Auth_GRPC_PORT || '2000';
  const domain = process.env.NODE_ENV === 'dev' ? (process.env.DEV_DOMAIN || 'localhost') : process.env.PRO_DOMAIN_USER;
  
  console.log(`Preparing to start gRPC server on ${domain}:${port}`);
  
  grpcServer.bindAsync(`${domain}:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
    if (err) {
      console.error("Error starting gRPC server:", err);
      return;
    }
    // Remove grpcServer.start() as it's deprecated
    console.log("\x1b[42m\x1b[30m%s\x1b[0m", `🚀 [INFO] gRPC AUTH server started on port: ${bindPort} ✅`);
  });
};


// Start both servers
console.log('Starting servers...');
startGrpcServer();
