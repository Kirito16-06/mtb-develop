export interface EmailTemplate {
  id?: string;
  templateId: string;
  subject: string;
  htmlContent: string;
  description?: string;
}

export interface TemplateFormData {
  templateId: string;
  subject: string;
  htmlContent: string;
  description?: string;
}
