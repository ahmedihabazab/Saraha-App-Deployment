import {
  BadRequestException,
  ConflictException,
} from "../../common/exeption/app.exception.js";
import { create, findOne } from "../../DB/repo/db.repo.js";
import usersModel from "../../models/users.model.js";
import { compareHash, hashValue } from "../../common/security/hash.js";
import { hashToolEnumObj } from "../../common/enum/security.enum.js";
import { decryptValue, encryptValue } from "../../common/security/encrypt.js";
import { create_Acc_REF_Tokens } from "../../common/security/token.js";
import {
  checkOtpCycle,
  sendOTP,
} from "../../common/utils/email/email.service.js";
import {
  delKey,
  getAllKeys,
  getEmailKey,
  getJwtIdPatternBase,
  getSendOtpBanKey,
  getSendOtpTRialsKey,
  getValueCashed,
  isExists,
  setValueCashed,
  ttl,
} from "../../common/cashe.service.js";
import { EmailSubjectEnum } from "../../common/enum/email.enum.js";
import { emailTemplate } from "../../common/utils/email/email.template.js";
import emailEvent from "../../common/utils/email/email.event.js";
import { promise } from "zod";

export async function signup(reqBody) {
  const emailMatched = await findOne({
    model: usersModel,
    filter: { email: reqBody.email },
  });
  if (emailMatched) {
    throw ConflictException({ errMsg: "Email Already Exist" });
  }
  reqBody.password = await hashValue({
    tool: hashToolEnumObj.ARGON,
    value: reqBody.password,
  });
  reqBody.phone = await encryptValue({ value: reqBody.phone });
  const createResult = await create({ model: usersModel, data: reqBody });

  emailEvent.emit("send-otp", {
    email: reqBody.email,
    subject: EmailSubjectEnum.CONFIRM_EMAIL,
  });
  return createResult;
}

export async function confirmEmail(reqBody) {
  const { email, otp } = reqBody;

  const user = await findOne({
    model: usersModel,
    filter: { email, confirmEmail: false },
  });

  if (!user) {
    throw BadRequestException({ errMsg: "Invalid Acount" });
  }

  const hashedOTP = await getValueCashed(
    getEmailKey(email, EmailSubjectEnum.CONFIRM_EMAIL),
  );

  if (!hashedOTP) {
    throw BadRequestException({ errMsg: "OTP Expired" });
  }

  const isOTPMatch = await compareHash({
    value: otp,
    hash: await getValueCashed(
      getEmailKey(email, EmailSubjectEnum.CONFIRM_EMAIL),
    ),
  });

  if (!isOTPMatch) {
    throw BadRequestException({ errMsg: "Invalid OTP" });
  }

  user.confirmEmail = true;
  await user.save();
  await delKey(getEmailKey(email, EmailSubjectEnum.CONFIRM_EMAIL));
}

export async function resendConfirmEmail(reqBody) {
  const { email } = reqBody;

  const user = await findOne({
    model: usersModel,
    filter: { email, confirmEmail: false },
  });

  if (!user) {
    throw BadRequestException({ errMsg: "Invalid Acount" });
  }

  await checkOtpCycle(email, EmailSubjectEnum.CONFIRM_EMAIL);

  emailEvent.emit("send-otp", {
    email,
    subject: EmailSubjectEnum.CONFIRM_EMAIL,
  });
}

export async function sendOtp(reqBody, sendOtpSubject) {
  const { email } = reqBody;

  const user = await findOne({
    model: usersModel,
    filter: { email, confirmEmail: true },
  });

  if (!user) {
    throw BadRequestException({ errMsg: "Invalid Acount" });
  }

  await checkOtpCycle(email, sendOtpSubject);

  emailEvent.emit("send-otp", {
    email,
    subject: sendOtpSubject,
  });
}

export async function verifyOtp(reqBody, sendOtpSubject) {
  const { email, otp } = reqBody;

  const user = await findOne({
    model: usersModel,
    filter: { email, confirmEmail: true },
  });

  if (!user) {
    throw BadRequestException({ errMsg: "Invalid Acount" });
  }

  const hashedOTP = await getValueCashed(getEmailKey(email, sendOtpSubject));

  if (!hashedOTP) {
    throw BadRequestException({ errMsg: "OTP Expired" });
  }

  const isOTPMatch = await compareHash({
    value: otp,
    hash: await getValueCashed(getEmailKey(email, sendOtpSubject)),
  });

  if (!isOTPMatch) {
    throw BadRequestException({ errMsg: "Invalid OTP" });
  }
  user.two_step_verification = true;
  await user.save();

  return user;
}

export async function resetPassword(reqBody) {
  const { email, otp, password } = reqBody;

  const user = await verifyOtp({ email, otp });

  user.password = await hashValue({ value: password });

  user.changeCredentialTime = Date.now();
  await user.save();
  const result = await Promise.all([
    getAllKeys(getJwtIdPatternBase(user.id)),
    getAllKeys(getEmailKey(email, EmailSubjectEnum.FORGET_PASSWORD)),
  ]);
  await delKey([...result[0], ...result[1]]);
}

export async function login(reqBody) {
  const userMatched = await findOne({
    model: usersModel,
    filter: { email: reqBody.email },
  });
  if (!userMatched) {
    throw ConflictException({ errMsg: "invalid email or password" });
  }
  if (!userMatched.confirmEmail) {
    throw BadRequestException({ errMsg: "email is not Confirmed" });
  }
  const compareResult = await compareHash({
    tool: hashToolEnumObj.ARGON,
    value: reqBody.password,
    hash: userMatched.password,
  });
  if (!compareResult) {
    throw ConflictException({ errMsg: "invalid email or password" });
  }
  userMatched.phone = await decryptValue({ ciphertext: userMatched.phone });

  if (userMatched.two_step_verification) {
    await sendOTP(reqBody.email, EmailSubjectEnum.TWO_STEP_VERIFICATION);
    return {msg : "a verification code is sent , login confirmation is required"}
  }

  return create_Acc_REF_Tokens({ user: userMatched });
}

export async function loginConfirmation(reqBody, sendOtpSubject) {
  const { email, otp } = reqBody;

  const user = await findOne({
    model: usersModel,
    filter: { email, confirmEmail: true , two_step_verification : true },
  });

  if (!user) {
    throw BadRequestException({ errMsg: "Invalid Acount" });
  }

  const hashedOTP = await getValueCashed(getEmailKey(email, sendOtpSubject));

  if (!hashedOTP) {
    throw BadRequestException({ errMsg: "OTP Expired" });
  }

  const isOTPMatch = await compareHash({
    value: otp,
    hash: await getValueCashed(getEmailKey(email, sendOtpSubject)),
  });

  if (!isOTPMatch) {
    throw BadRequestException({ errMsg: "Invalid OTP" });
  }
  return create_Acc_REF_Tokens({ user });
}