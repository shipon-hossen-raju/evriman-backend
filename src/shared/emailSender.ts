import nodemailer from "nodemailer";
import config from "../config";



const emailSender = async (email: string, html: string, subject: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.titan.email",
    port: 465,
    secure: true,
    auth: {
      user: "pixelteam@smtech24.com", 
      pass: "@pixel321team", 
    },
  });
  

  const info = await transporter.sendMail({
    from: "pixelteam@smtech24.com",
    to: email,
    subject: subject,
    html,
  });
// console.log("test");
  
};

export default emailSender;

export const OtpHtml = (otp: number) => {
  return `
  <div style="text-align: center; padding: 20px;">
    <h1>Welcome to Our Service!</h1>
    <p>Your OTP is: <strong>${otp}</strong></p>
    <p>Please enter this code to verify your email address.</p>
    <p>Thank you for joining us!</p>
    <p>Best regards,</p>
    <p>Evriman</p>
  </div>
  `;
};