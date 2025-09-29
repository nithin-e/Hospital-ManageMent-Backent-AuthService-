import * as grpc from "@grpc/grpc-js";
import { loadProto, createGrpcServer } from "../config/grpc.config";
import { authGrpcHandlers } from "./handlers";

export const startGrpcServer = () => {
  const grpcObject = loadProto();
  const authProto = grpcObject.Auth;

  if (!authProto || !authProto.AuthService) {
    console.error("❌ Failed to load Auth service from proto file");
    process.exit(1);
  }

  const grpcServer = createGrpcServer();
  grpcServer.addService(authProto.AuthService.service, authGrpcHandlers);

  const port = Number(process.env.AUTH_GRPC_PORT) || 8000;
  const host = process.env.GRPC_HOST || "0.0.0.0";
  const serverAddress = `${host}:${port}`;

  console.log(`Preparing to start gRPC Auth server on ${serverAddress}`);

  grpcServer.bindAsync(
    serverAddress,
    grpc.ServerCredentials.createInsecure(),
    (err, bindPort) => {
      if (err) {
        console.error("❌ Error starting gRPC Auth server:", err);
        return;
      }
      grpcServer.start();
      console.log(
        "\x1b[42m\x1b[30m%s\x1b[0m",
        `🚀 [INFO] gRPC AUTH server started on port: ${bindPort} ✅`
      );
    }
  );
};
