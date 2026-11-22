import { EventEmitter } from "node:events";
import { sendOTP } from "./email.service.js";

const emailEvent = new EventEmitter();

emailEvent.on("send-otp", async function ({email , subject}) {
  try {
    await sendOTP(email , subject);
  } catch (error) {
    console.log("Error While Sending Email");
    console.log(error);
  }
});

export default emailEvent
