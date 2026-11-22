import { Router } from "express";
import { handleFileMiddlware } from "../../middlewares/multer.middleware.js";
import localUpload from "../../common/utils/multer/multer.config.js";
import auth from "../../middlewares/auth.middleware.js";
import {
  deleteMessage,
  getAllMessages,
  getMessage,
  sendMessage,
} from "./message.service.js";
import { successResponse } from "../../common/response/success.response.js";
import validation from "../../middlewares/validation.middleware.js";
import { sendMessageSchema } from "./message.validation.js";

export const messageController = Router();

messageController.post(
  "/",
  (req, res, next) => {
    if (req.headers.authorization) {
      return auth()(req, res, next);
    }

    next();
  },

  handleFileMiddlware({
    multerMiddlware: localUpload({
      maxFileSize: 5,
      folderName: "Message",
    }).any(),
    folderName: "Message",
  }),

  validation(sendMessageSchema),

  async (req, res) => {
    const result = await sendMessage(req.body, req.files, req.user);
    successResponse({ res, data: result });
  },
);

messageController.delete("/:messageId", auth(), async (req, res) => {
  const result = await deleteMessage(req.params.messageId, req.user);
  successResponse({ res, data: result });
});

messageController.get("/", auth(), async (req, res) => {
  const result = await getAllMessages(req.query, req.user);
  successResponse({ res, data: result });
});

messageController.get("/:messageId", auth(), async (req, res) => {
  const result = await getMessage(req.params.messageId, req.user);
  successResponse({ res, data: result });
});
