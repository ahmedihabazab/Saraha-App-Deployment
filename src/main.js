import express from "express";
import { PORT } from "./config/config.js";
import { authController } from "./modules/auth/auth.controller.js";
import { userController } from "./modules/user/user.controller.js";
import { messageController } from "./modules/message/message.controller.js";
import { dbConnection } from "./DB/connection.db.js";
import mongoose from "mongoose";
import globalErrMiddleware from "./middlewares/error.middleware.js";
import helmet from "helmet";
import cors from "cors";
import reqLimiter from "./common/rate-limiter.js";

async function bootstrap() {
  const app = express();

  await dbConnection();
  
  app.set("trust proxy", true);
  
  app.use(
    helmet(),
    cors({
      origin: (reqOrigin, cb) => {
        // if (!reqOrigin) {
        //   cb(new Error("Testing tools not allowed"));
        //   return;
        // }
        cb(null, { origin: "http://localhost:4200" });
      },
    }),
    reqLimiter(15 * 60, 100),
    express.json(),
  );


  app.use("/render-pic", express.static("./assets"));

  await mongoose.syncIndexes();

  app.use("/auth", authController);
  app.use("/user", userController);
  app.use("/message", messageController);

  app.use(globalErrMiddleware);

  app.listen(PORT, () => {
    console.log(`on PORT ${PORT}`);
  });
}

bootstrap();
