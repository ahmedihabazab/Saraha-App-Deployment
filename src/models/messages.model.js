import { model, Schema, Types } from "mongoose";

const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: function () {
        return !this.attachments.length;
      },
    },
    attachments: [String],
    senderId: { type: Types.ObjectId, ref: "users" },
    receiverId: { required: true, type: Types.ObjectId, ref: "users" },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

const messageModel = model("Masseges", messageSchema);

export default messageModel;
