import { Router } from "express";
import { confirmEmail, login, loginConfirmation, resendConfirmEmail, resetPassword, sendOtp, signup, verifyOtp } from "./auth.service.js";
import { successResponse } from "../../common/response/success.response.js";
import validation from "../../middlewares/validation.middleware.js";
import { confirmEmailSchema, loginConfirmationSchema, loginSchema, resendOtpSchema, resetPasswordSchema, sendForgetPasswordOtpSchema, sendTwo_Step_Verification_OtpSchema, signupSchema, verifyForgetPasswordOtpSchema, verifyTwo_Step_Verification_OtpSchema } from "./auth.validation.js";
import reqLimiter from "../../common/rate-limiter.js";
import auth from "../../middlewares/auth.middleware.js";
import { EmailSubjectEnum } from "../../common/enum/email.enum.js";
export const authController = Router();

authController.post("/signup", validation(signupSchema) , async (req, res) => {
  try {
    const result = await signup(req.body);
    successResponse({ res, statusCode: 201, msg: "created", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});

authController.patch("/confirm-email", validation(confirmEmailSchema) , async (req, res) => {
  try {
    const result = await confirmEmail(req.body);
    successResponse({ res, statusCode: 201, msg: "done", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});

authController.post("/resend-confirm-email-otp", validation(resendOtpSchema) , async (req, res) => {
  try {
    const result = await resendConfirmEmail(req.body);
    successResponse({ res, statusCode: 201, msg: "created", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});

authController.post("/send-forget-password-otp", validation(sendForgetPasswordOtpSchema) , async (req, res) => {
  try {
    const result = await sendOtp(req.body , EmailSubjectEnum.FORGET_PASSWORD);
    successResponse({ res, statusCode: 201, msg: "done", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});

authController.post("/verify-Forget-Password-Otp", validation(verifyForgetPasswordOtpSchema) , async (req, res) => {
  try {
    const result = await verifyOtp(req.body, EmailSubjectEnum.FORGET_PASSWORD);
    successResponse({ res, statusCode: 201, msg: "done", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});


authController.post("/reset-password", validation(resetPasswordSchema) , async (req, res) => {
  try {
    const result = await resetPassword(req.body);
    successResponse({ res, statusCode: 201, msg: "done", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});


const limiter = reqLimiter(5*60 , 5)
authController.post("/login", limiter, validation(loginSchema) ,  async (req, res) => {
  

  const result = await login(req.validationDataBody);
  successResponse({ res, statusCode: 201, msg: "created", data: result });
});


authController.patch("/send-2-step-verification", auth() ,  validation(sendTwo_Step_Verification_OtpSchema) , async (req, res) => {
  try {
    const result = await sendOtp(req.body , EmailSubjectEnum.TWO_STEP_VERIFICATION);
    successResponse({ res, statusCode: 201, msg: "done", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});

authController.patch("/verify-2-step-verification", auth() ,  validation(verifyTwo_Step_Verification_OtpSchema) , async (req, res) => {
  try {
    const result = await verifyOtp(req.body , EmailSubjectEnum.TWO_STEP_VERIFICATION);
    successResponse({ res, statusCode: 201, msg: "done", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});

authController.post("/login-confirmation", validation(loginConfirmationSchema) , async (req, res) => {
  try {
    const result = await loginConfirmation(req.body , EmailSubjectEnum.TWO_STEP_VERIFICATION);
    successResponse({ res, statusCode: 201, msg: "done", data: result });
  } catch (error) {
    res.status(400).json(error.stack);
  }
});
