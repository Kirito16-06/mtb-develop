"use client";

import { Activity } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { getAxiosErrorMessage } from "@/utils/ax";
import { ActivityFormValues, activitySchema } from "@/schema/zodSchema";

export function UpdateActivityJPForm({
  activities,
}: {
  activities: Activity[];
}) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activityId: "",
      jpAmount: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ActivityFormValues) => {
      const res = await axios.post("/api/admin/activity/update-jp", {
        activityId: data.activityId,
        jpAmount: parseInt(data.jpAmount),
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("JP amount updated successfully!");
      form.reset();
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error, "Failed to update JP amount"));
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Activity</label>
        <Select
          onValueChange={(val) => {

            // console.log(kjndgjkvndxfjkvxknb : ${val});

            return form.setValue("activityId", val);
          }}
          value={form.watch("activityId")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an activity" />
          </SelectTrigger>
          <SelectContent>
            {activities.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.activity ?? "Unnamed"} (JP: {a.jpAmount ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.activityId && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.activityId.message}
          </p>
        )}
      </div>

      <InputWithLabel
        label="New JP Amount"
        type="number"
        min="0"
        {...form.register("jpAmount")}
        error={form.formState.errors.jpAmount}
      />

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Update JP Amount"
        )}
      </Button>
    </form>
  );
}