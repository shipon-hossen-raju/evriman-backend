import { Payment } from "@prisma/client";
import config from "../../../config";

export const paymentConfirmHtml = (
  payload: Payment & {
    userName: string;
    amountPay: number;
    currencySymbol: "£";
    planName: string;
    startDate: string;
    endDate: string;
    contactLimit: number;
    stripePaymentIntentId: string;
  }
) => {
  return `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Confirmation</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f6f6f6;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 8px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #333;
      margin-bottom: 5px;
    }
    .content {
      color: #555;
      line-height: 1.6;
    }
    .highlight {
      color: #000;
      font-weight: 600;
    }
    .details {
      background-color: #f0f0f0;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
      font-size: 14px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Payment Confirmed ✅</h1>
      <p>Thank you for your purchase!</p>
    </div>

    <div class="content">
      <p>Hi <span class="highlight"> ${payload.userName} </span>,</p>

      <p>We’ve successfully received your payment of <span class="highlight">${
        payload.currencySymbol
      }${payload.amountPay}</span> for the subscription plan: <strong>${
    payload.planName
  }</strong>.</p>

      <div class="details">
        <p><strong>Subscription Period:</strong> ${payload.startDate} to ${
    payload.endDate
  }</p>
        <p><strong>Contacts Allowed:</strong> ${payload.contactLimit}</p>
        <p><strong>Payment ID:</strong> ${payload.stripePaymentIntentId}</p>
      </div>

      <p>If you have any questions, feel free to reply to this email. We’re happy to help.</p>

      <p>Cheers,  
        <br/> ${config.site_name} Team
      </p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${
    config.site_name
  }. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

   `;
};
