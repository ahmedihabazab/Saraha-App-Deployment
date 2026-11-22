import * as z from "zod";
import { commonValidationFields } from "../../common/validation.js";
import { SystemLangEnum } from "../../common/enum/system.enum.js";

const commonEmailPasswordValidation = (lang) =>
  z.object({
    email: commonValidationFields(lang).email,
    password: commonValidationFields().password,
  });

export const loginSchema = (lang) =>
  z.object({
    body: commonEmailPasswordValidation(lang),
    // query: z.object({
    //   id: z.number().optional(),
    // }),
  });

export const signupSchema = (lang) => {
  return z.object({
    body: commonEmailPasswordValidation(lang)
      .extend({
        username: commonValidationFields().username,
        confirmPassword: commonValidationFields().confirmPassword,
        phone: commonValidationFields().phone.optional(),
        DOB: commonValidationFields().DOB.optional(),
        role: commonValidationFields(lang).role.optional(),
        gender: commonValidationFields().gender.optional(),
      })
      .refine((value) => value.password === value.confirmPassword, {
        error:
          lang == SystemLangEnum.EN
            ? "Password not confirm"
            : "خطأ في confirmPassword",
      }),
  });
};

export const confirmEmailSchema = (lang) =>
  z.object({
    body: z.object({
      email: commonValidationFields(lang).email,
      otp: commonValidationFields(lang).otp,
    }),
  });

export const resendOtpSchema = (lang) =>
  z.object({
    body: z.object({
      email: commonValidationFields(lang).email,
    }),
  });

export const sendForgetPasswordOtpSchema = resendOtpSchema;
export const verifyForgetPasswordOtpSchema = confirmEmailSchema;

export const resetPasswordSchema = (lang) =>
  z.object({
    body: z
      .object({
        email: commonValidationFields(lang).email,
        otp: commonValidationFields(lang).otp,
        password: commonValidationFields(lang).password,
        confirmPassword: commonValidationFields(lang).password,
      })
      .refine((value) => value.confirmPassword === value.password, {
        error:
          lang == SystemLangEnum.EN
            ? "Password not confirm"
            : "خطأ في confirmPassword",
      }),
  });

  export const sendTwo_Step_Verification_OtpSchema = resendOtpSchema
  export const verifyTwo_Step_Verification_OtpSchema = confirmEmailSchema;
  export const loginConfirmationSchema = verifyTwo_Step_Verification_OtpSchema;
