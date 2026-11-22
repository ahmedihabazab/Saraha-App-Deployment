import {
  getEmailKey,
  getSendOtpBanKey,
  getSendOtpTRialsKey,
  getValueCashed,
  incrKey,
  setValueCashed,
  ttl,
} from "../../cashe.service.js";
import { BadRequestException } from "../../exeption/app.exception.js";
import generateOTP from "../../otp.js";
import { hashValue } from "../../security/hash.js";
import transporter from "./email.config.js";
import { emailTemplate } from "./email.template.js";

export async function sendMail({ to, cc, bcc, subject, html, attachments }) {
  try {
    const info = await transporter.sendMail({
      from: '"Example Team" <team@example.com>',
      to,
      cc,
      bcc,
      subject,
      html,
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}

export async function sendOTP(email, subject) {
  const OTP = generateOTP();

  await sendMail({
    to: email,
    subject,
    html: emailTemplate[subject](OTP),
  });

  await setValueCashed({
    key: getEmailKey(email, subject),
    value: await hashValue({ value: OTP }),
    options: { expiration: { value: 180 } },
  });

  if (await getValueCashed(getSendOtpTRialsKey(email, subject))) {
    await incrKey({ key: getSendOtpTRialsKey(email, subject) });
  } else {
    await setValueCashed({
      key: getSendOtpTRialsKey(email, subject),
      value: 1,
      options: { expiration: { value: 1200 } },
    });
  }
}

export async function checkOtpCycle(email, subject) {
  const oldOTP_TTL = await ttl(getEmailKey(email, subject));

  if (oldOTP_TTL > 0) {
    throw BadRequestException({
      errMsg: `old OTP still Valid , send REQ after ${oldOTP_TTL} `,
    });
  }

  const isBannedTtl = await ttl(getSendOtpBanKey(email, subject));

  if (isBannedTtl > 0) {
    throw BadRequestException({
      errMsg: `You are banned , try again after ${isBannedTtl} `,
    });
  }

  const trialsNo = await getValueCashed(getSendOtpTRialsKey(email, subject));

  if (trialsNo == 2) {
    //MAX 3 TRIALS
    await setValueCashed({
      key: getSendOtpBanKey(email, subject),
      value: 0,
      options: { expiration: { value: 25 * 60 } },
    });
  }
}
