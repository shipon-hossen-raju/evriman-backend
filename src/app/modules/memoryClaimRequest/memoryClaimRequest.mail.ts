import { MemoryClaimRequest, UserMemory } from "@prisma/client";
import config from "../../../config";

// approve mail template for memory claim request
export const approvedMailGenerate = (userMemory: UserMemory, claimerData: MemoryClaimRequest) => {
  const approvedMail = `
   <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Memory Claim Approved</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
      }

      .container {
        background: #fff;
        border-radius: 10px;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      h2 {
        color: #2c3e50;
      }

      p {
        color: #555;
        line-height: 1.6;
      }

      .memory {
        margin-top: 20px;
        border-top: 1px solid #eee;
        padding-top: 20px;
      }

      .memory-content {
        font-style: italic;
        margin-bottom: 20px;
        color: #333;
      }

      .document {
        background: #f1f1f1;
        padding: 10px 15px;
        border-radius: 8px;
        color: #333;
        font-size: 14px;
        text-decoration: none;
        display: inline-block;
        margin-top: 10px;
      }

      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Your Memory Claim Has Been Approved</h2>
      <p>Dear ${claimerData.claimantName},</p>
      <p>
        We are pleased to inform you that your request to claim the memories of
        <strong>${claimerData.deceasedName}</strong> has been approved.
      </p>

      <div class="memory">
        <h3>Memory Shared With You</h3>
        <p class="memory-content">
        ${userMemory.content ? userMemory.content : ""}
        </p>

        <div class="media">
         ${userMemory.files.map((file) => {
           // link clicked to download files
           return `<a class="document" href="${file}" target="_blank">📄 Download File</a>`;
         })}         
        </div>
      </div>

      <p>
        We hope these cherished memories offer comfort and connection during
        this meaningful time.
      </p>

      <p>Warm regards,<br />${config.site_name} Team</p>

      <div class="footer">
        &copy; 2025 ${config.site_name}. All rights reserved.
      </div>
    </div>
  </body>
</html>

`;
  return approvedMail;
};

// rejected mail template for memory claim request
export const rejectedMailGenerate = (claimerData: MemoryClaimRequest) => {
  const rejectedMail = `
   <!DOCTYPE html>
<html lang="en">
  <head>
      <meta charset="UTF-8" />
      <title>Memory Claim Rejected</title>
      <style>
         body {
         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
         background-color: #f4f4f4;
         padding: 20px;
         }
         .container {
         background: #fff;
         border-radius: 10px;
         max-width: 600px;
         margin: auto;
         padding: 30px;

         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
         }

         h2 {
         color: #2c3e50;
         }

         p {
         color: #555;
         line-height: 1.6;
         }
         .footer {
         margin-top: 40px;
         text-align: center;
         font-size: 12px;
         color: #999;
         }
      </style>
   </head>
   <body>
      <div class="container">
         <h2>Your Memory Claim Has Been Rejected</h2>
         <p>Dear ${claimerData.claimantName},</p>
         <p>
            We regret to inform you that your request to claim the memories of
            <strong>${claimerData.deceasedName}</strong> has been rejected.
         </p>
         <p>
            If you have any questions or need further assistance, please feel
            free to contact us.
         </p>
         <p>Thank you for your understanding.</p>
         <p>Warm regards,<br />${config.site_name} Team</p>

         <div class="footer">
            &copy; 2025 ${config.site_name}. All rights reserved.
         </div>
      </div>
   </body>
</html>
`;
  return rejectedMail;
};
