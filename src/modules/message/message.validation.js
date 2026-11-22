import * as z from "zod";
import { commonValidationFields } from "../../common/validation.js";

export const sendMessageSchema = (lang) =>
  z
    .object({
      body: z.object({
        content: z.string().min(1).max(1000).optional(),
        receiverId: commonValidationFields(lang).id,
      }),
      files: z.any().optional(),
    })
    .refine((value) => {
      
      return value.body.content || value.body.files?.length;
    }, {error : "Send at Least Content or an Attachment"});
