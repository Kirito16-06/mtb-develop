import axios from "axios";
import { prisma } from "@/lib/prisma";
import { renderEmailTemplate } from "@/utils/renderEmailContent";

interface EmailData {
  toEmail: string;
  toName: string;
  templateId: string;
  templateData: Record<string, any>;
}

export async function sendEmailUsingTemplate({
  toEmail,
  toName,
  templateId,
  templateData,
}: EmailData) {
  const senderEmail = process.env.CONTACT_SENDER_EMAIL;
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!senderEmail || !brevoApiKey) {
    throw new Error("Missing necessary environment variables");
  }

  const brevoApiUrl = "https://api.brevo.com/v3/smtp/email";
  const headers = {
    "Content-Type": "application/json",
    "api-key": brevoApiKey,
  };

  const template = await prisma.emailTemplate.findUnique({
    where: { templateId },
  });

  if (!template) {
    throw new Error(`Email template with id "${templateId}" not found`);
  }

  const emailContent = renderEmailTemplate(template.htmlContent, templateData);

  const payload = {
    sender: { email: senderEmail },
    to: [{ email: toEmail, name: toName }],
    subject: template.subject,
    htmlContent: emailContent,
  };

  await axios.post(brevoApiUrl, payload, { headers });
}
