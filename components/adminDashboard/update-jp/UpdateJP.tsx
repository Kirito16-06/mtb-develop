"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@prisma/client";
import { UpdateActivityJPForm } from "@/components/adminDashboard/UpdateActivityJPForm";
import { MagicBoxSettingsForm } from "@/components/adminDashboard/MagicBoxSettingsForm";
import PageSkeleton from "@/components/PageSkeleton";

export default function UpdateActivityJpPage() {
  const { data: activities = [], isLoading: loadingA } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/activity/list");
      return data;
    },
  });

  const { data: magicBoxSettings, isLoading: loadingM } = useQuery({
    queryKey: ["magicBoxSettings"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/magic-box/settings");
      return data.settings;
    },
  });

  if (loadingA || loadingM) return <PageSkeleton type="update-jp" />;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Update Activity JP Amount</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Update Activity JP</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateActivityJPForm activities={activities as Activity[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Magic Box Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <MagicBoxSettingsForm initialValues={magicBoxSettings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
