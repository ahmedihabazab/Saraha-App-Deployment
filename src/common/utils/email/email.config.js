import nodemailer from "nodemailer";
import { EMAIL_PASSWORD, EMAIL_USER } from "../../../config/config.js";
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use any Service ID from the table below (matching is case-insensitive)
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export default transporter;
