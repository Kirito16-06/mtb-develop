export function renderEmailTemplate(
  template: string | undefined,
  data: Record<string, any>
): string {
  if (!template) return "";
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = data[key.trim()];
    return value !== undefined ? value.toString() : `[${key.trim()}]`;
  });
}

export const defaultPreviewData = {
  username: "John Doe",
  verificationUrl: "https://preview-link.com/verify",
  resetUrl: "https://preview-link.com/reset-password",
  email: "john.doe@example.com",
  // Add more default preview data as needed
};
