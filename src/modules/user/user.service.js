import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "../../config/config.js";
import { BadRequestException } from "../../common/exeption/app.exception.js";
import {
  create_Acc_REF_Tokens,
  revokeToken,
} from "../../common/security/token.js";
import { logoutActionEnum } from "../../common/enum/system.enum.js";
import {
  delKey,
  getAllKeys,
  getJwtIdPatternBase,
} from "../../common/cashe.service.js";
import usersModel from "../../models/users.model.js";
import { findById } from "../../DB/repo/db.repo.js";

export async function rotateToken(payload) {
  const currentData = Math.ceil(Date.now() / 1000);
  const expirtionDate = payload.iat + ACCESS_TOKEN_EXPIRES;
  if (currentData < expirtionDate) {
    throw BadRequestException({errMsg: "access token not expired"});
  }

  const userMatched = await findById({model : usersModel , id : payload.sub})

  const tokens = create_Acc_REF_Tokens({
    user: userMatched,
    refresh_token_expiresIn:
      REFRESH_TOKEN_EXPIRES - (Math.ceil(Date.now() / 1000) - payload.iat),
  });

  await revokeToken(payload);

  return tokens;
}

export async function logout(payload, user, action) {
  switch (action) {
    case logoutActionEnum.ONE_DEVICE:
      await revokeToken(payload);

      break;

    case logoutActionEnum.ALL_DEVICES:
      user.changeCredentialTime = Date.now();
      await user.save();

      const keys = await getAllKeys(getJwtIdPatternBase(payload.sub));
      await delKey(keys);

      break;

    default:
      break;
  }
}

export async function saveProfilePic(user, filePath){
  user.profilePicPath = filePath 
  user.save()
}