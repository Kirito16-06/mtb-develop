"use client";

import { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Import TinyMCE types with fallback for missing definitions
import type { Editor as TinyMCEEditor } from "tinymce";

// Define a custom type for the fetch callback since MenuItemMapCallback is not exported
type MenuItemFetchCallback = (
  items: Array<{ type: string; text: string; onAction: () => void }>
) => void;

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
  }
);

interface TinyMCEEditorWithUI extends TinyMCEEditor {
  ui: {
    registry: {
      addMenuButton: (
        name: string,
        config: {
          text: string;
          fetch: (callback: MenuItemFetchCallback) => void;
        }
      ) => void;
    };
  };
}

interface EmailTemplateEditorProps {
  initialData?: {
    id?: string;
    templateId: string;
    subject: string;
    htmlContent: string;
    description?: string;
  };
  initialEditorMode?: "simple" | "html";
  onSubmit: (data: {
    templateId: string;
    subject: string;
    htmlContent: string;
    description?: string;
  }) => Promise<void>;
  defaultFrom?: string;
}

const defaultPreviewData = {
  username: "John Doe",
  verificationUrl: "https://preview-link.com/verify",
  resetPasswordUrl: "https://preview-link.com/reset-password",
  email: "john.doe@example.com",
};

export default function EmailTemplateEditor({
  initialData,
  initialEditorMode = "simple",
  onSubmit,
  defaultFrom = "user@mail.com",
}: EmailTemplateEditorProps) {
  const [templateId, setTemplateId] = useState(initialData?.templateId || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [htmlContent, setHtmlContent] = useState(
    initialData?.htmlContent ||
      (initialEditorMode === "html" ? "<!-- Paste your HTML code here -->" : "")
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [previewHtml, setPreviewHtml] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorMode, setEditorMode] = useState<"simple" | "html">(
    initialEditorMode
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    let preview = htmlContent;
    Object.entries(defaultPreviewData).forEach(([key, value]) => {
      preview = preview.replace(
        new RegExp(`{{${key}}}`, "g"),
        value.toString()
      );
    });
    setPreviewHtml(preview);
  }, [htmlContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        templateId,
        subject,
        htmlContent,
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-5 px-4">
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">
            📄 Basic Details
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="templateId">Template ID</Label>
              <Input
                id="templateId"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="e.g., welcome-email"
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this template for?"
              />
            </div>
          </div>
        </div>

        {/* Editor Mode Toggle */}
        <div className="flex space-x-2 mb-4">
          <Button
            type="button"
            variant={editorMode === "simple" ? "default" : "outline"}
            onClick={() => setEditorMode("simple")}
          >
            Simple Editor
          </Button>
          <Button
            type="button"
            variant={editorMode === "html" ? "default" : "outline"}
            onClick={() => setEditorMode("html")}
          >
            HTML Editor
          </Button>
        </div>

        {/* Editor */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">
            ✏️ Email Editor
          </h2>
          <div className="flex flex-col space-y-2">
            <Label>
              {editorMode === "simple" ? "Content" : "HTML Content"}
            </Label>
            {editorMode === "simple" ? (
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                tinymceScriptSrc={`https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY}/tinymce/6/tinymce.min.js`}
                value={htmlContent}
                onEditorChange={setHtmlContent}
                init={{
                  height: 500,
                  menubar: false,
                  plugins: "link image media table code fullscreen",
                  toolbar:
                    "code | addVariables | fontsize | bold italic underline strikethrough superscript subscript | alignleft aligncenter alignright alignjustify | outdent indent | link image media | table | fullscreen | undo redo",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  setup: (editor: TinyMCEEditorWithUI) => {
                    editor.ui.registry.addMenuButton("addVariables", {
                      text: "Add Variable",
                      fetch: (callback: MenuItemFetchCallback) => {
                        const items = [
                          {
                            type: "menuitem",
                            text: "Username",
                            onAction: () =>
                              editor.insertContent("{{username}}"),
                          },
                          {
                            type: "menuitem",
                            text: "Verification URL",
                            onAction: () =>
                              editor.insertContent("{{verificationUrl}}"),
                          },
                          {
                            type: "menuitem",
                            text: "Reset URL",
                            onAction: () =>
                              editor.insertContent("{{resetUrl}}"),
                          },
                          {
                            type: "menuitem",
                            text: "Email",
                            onAction: () => editor.insertContent("{{email}}"),
                          },
                          {
                            type: "menuitem",
                            text: "Insert Link",
                            onAction: () =>
                              editor.insertContent("{{insert_link}}"),
                          },
                          {
                            type: "menuitem",
                            text: "Insert Date",
                            onAction: () =>
                              editor.insertContent("{{insert_date}}"),
                          },
                        ];
                        callback(items);
                      },
                    });
                  },
                }}
              />
            ) : (
              <div className="rounded-lg overflow-hidden border bg-[#1e1e1e]">
                <MonacoEditor
                  height="300px"
                  defaultLanguage="html"
                  value={htmlContent}
                  onChange={(value) => setHtmlContent(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    theme: "vs-dark",
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-6 py-2"
          >
            Preview
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 transition-colors"
          >
            {isSubmitting ? "Saving..." : "💾 Save Template"}
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Email Preview</h2>
              <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <strong>From:</strong> {defaultFrom}
              </div>
              <div>
                <strong>Subject:</strong> {subject}
              </div>
              <div className="border-t pt-4">
                <strong>Content:</strong>
                <div
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="prose max-w-full mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
