import { EmailSubjectEnum } from "../../enum/email.enum.js";

export const emailTemplate = {
  [EmailSubjectEnum.CONFIRM_EMAIL]: (OTP) => {
    return `</h1>OTP For Confirm Email : ${OTP}</h1>`;
  },
  [EmailSubjectEnum.FORGET_PASSWORD]: (OTP) => {
    return `</h1>OTP For Forget Password : ${OTP}</h1>`;
  },
  [EmailSubjectEnum.TWO_STEP_VERIFICATION]: (OTP) => {
    return `</h1>OTP For Two Step Verification : ${OTP}</h1>`;
  },
};
