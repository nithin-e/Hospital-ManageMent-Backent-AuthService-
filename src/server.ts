import "dotenv/config";
import { startGrpcServer } from "./grpc/server";

(async () => {
  startGrpcServer();
})();
