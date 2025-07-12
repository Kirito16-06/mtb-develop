"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import PageSkeleton from "@/components/PageSkeleton";
interface template {
  id: string;
  templateId: string;
  subject: string;
  description: string;
  updatedAt: Date;
}

const ITEMS_PER_PAGE = 6;

const fetchTemplates = async (page: number) => {
  const response = await axios.get(
    `/api/admin/email-templates?page=${page}&limit=${ITEMS_PER_PAGE}`
  );
  return response.data;
};

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["email-templates", currentPage],
    queryFn: () => fetchTemplates(currentPage),
  });

  const templates = data?.templates || [];
  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

  const handleCreateTemplate = (editorType: "simple" | "html") => {
    router.push(`/admin/email-templates/new?editor=${editorType}`);
    setIsModalOpen(false);
  };

  //   !
  if (isLoading) {
    return <PageSkeleton type="email-templates" />;
  }

  return (
    <div className="md:container bg-white rounded-lg mx-auto py-8">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="md:text-2xl font-bold">Email Templates</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Create New Template
        </Button>
      </div>

      {/* Modal for Editor Selection */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Choose Editor</h2>
            <div className="flex flex-col space-y-4">
              <Button onClick={() => handleCreateTemplate("simple")}>
                Simple Editor
              </Button>
              <Button onClick={() => handleCreateTemplate("html")}>
                HTML Editor
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader>
                <TableRow>
                  <TableHead>Template ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template: template) => (
                  <TableRow key={template.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {template.templateId}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template.subject}
                    </TableCell>
                    {template.description ? (
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.description}
                      </TableCell>
                    ) : (
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        NA
                      </TableCell>
                    )}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(
                        new Date(template.updatedAt),
                        "MMM d, yyyy hh:mm a"
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/admin/email-templates/${template.id}`)
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
