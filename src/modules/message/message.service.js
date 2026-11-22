import MessageParser from "nodemailer/lib/dkim/message-parser.js";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exeption/app.exception.js";
import {
  create,
  deleteDoc,
  findAndCount,
  findById,
  findOne,
} from "../../DB/repo/db.repo.js";
import messageModel from "../../models/messages.model.js";
import usersModel from "../../models/users.model.js";
import { MessageFilterTypeEnum } from "../../common/enum/message.enum.js";

export async function sendMessage(reqBody, filesData, user) {
  const { content, receiverId } = reqBody;

  const receiver = await findById({ model: usersModel, id: receiverId });

  if (!receiver) {
    throw BadRequestException({ errMsg: "No such Reciever" });
  }

  const attachmentsArr = filesData.map((ele) => {
    return ele.finalPath;
  });

  const newMessage = await create({
    model: messageModel,
    data: {
      content,
      attachments: attachmentsArr,
      receiverId,
      senderId: user?.id,
    },
  });

  return newMessage;
}

export async function deleteMessage(messageId, user) {
  const findMessage = await findById({
    model: messageModel,
    id: messageId,
  });

  if (!findMessage) {
    throw NotFoundException({ errMsg: "Message Not Found" });
  }


  const deleteMessage = await deleteDoc({
    model: messageModel,
    filter: { _id: messageId, receiverId: user.id },
  });

  if (!deleteMessage.deletedCount) {
    throw BadRequestException({ errMsg: "You can't delete this message" });
  }
}

export async function getAllMessages(reqQuery, user) {
  const { page, limit, filterType } = reqQuery;

  let findQueryFilter;

  switch (filterType) {
    case MessageFilterTypeEnum.RECEIVER:
      findQueryFilter = { receiverId: user.id };
      break;

    case MessageFilterTypeEnum.SENDER:
      findQueryFilter = { senderId: user.id };
      break;

    default:
      findQueryFilter = {
        $or: [{ receiverId: user.id }, { senderId: user.id }],
      };
      break;
  }
  const { docs, count } = await findAndCount({
    model: messageModel,
    filter: findQueryFilter,
    pagenation: { page, limit },
  });

  if (!docs.length) {
    throw NotFoundException({ errMsg: "No Message Found" });
  }

  return {
    AllMasseges: docs,
    TotalMessages: count,
    CurrentPage: page,
    TotalPages: Math.ceil(count / limit),
  };
}

export async function getMessage(messageId, user) {
  const findMessage = await findOne({
    model: messageModel,
    filter: {
      _id: messageId,
      $or: [{ receiverId: user.id }, { senderId: user.id }],
    },
  });

  if (!findMessage) {
    throw NotFoundException({ errMsg: "Message Not Found" });
  }

  return findMessage;
}
