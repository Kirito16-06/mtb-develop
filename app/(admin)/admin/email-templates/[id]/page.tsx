"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import EmailTemplateEditor from "@/components/EmailTemplateEditor";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmailTemplate, TemplateFormData } from "@/types/client/email-template";

const fetchTemplate = async (id: string): Promise<EmailTemplate> => {
  const response = await fetch(`/api/admin/email-templates/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch template");
  }
  return response.json();
};

const saveTemplate = async ({
  id,
  data,
  isNew,
}: {
  id: string;
  data: TemplateFormData;
  isNew: boolean;
}): Promise<void> => {
  const url = isNew
    ? `/api/admin/email-templates`
    : `/api/admin/email-templates/${id}`;
  const method = isNew ? "POST" : "PUT";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to save template");
  }
};

export default function EditEmailTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const editorType = searchParams.get("editor") as "simple" | "html" | null;
  const initialEditorMode = isNew ? editorType || "simple" : "simple";

  const { data: template, isLoading } = useQuery<EmailTemplate, Error>({
    queryKey: ["emailTemplate", id],
    queryFn: () => fetchTemplate(id),
    enabled: !isNew,
  });

  const mutation = useMutation({
    mutationFn: saveTemplate,
    onSuccess: () => {
      toast.success("Template saved successfully");
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      router.push("/admin/email-templates");
    },
    onError: (error: Error) => {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    },
  });

  const handleSubmit = async (data: TemplateFormData): Promise<void> => {
    return new Promise((resolve) => {
      mutation.mutate({ id, data, isNew }, { onSuccess: () => resolve() });
    });
  };

  if (isLoading && !isNew) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" bg-white rounded-lg mx-auto py-8 px-8 md:p-2">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "Create New Template" : "Edit Template"}
      </h1>
      <EmailTemplateEditor
        initialData={template}
        initialEditorMode={initialEditorMode}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
