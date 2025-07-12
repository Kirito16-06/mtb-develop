"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import axios from "axios";
import { getAxiosErrorMessage } from "@/utils/ax";
import {  MagicBoxSettings, magicBoxSettingsSchema } from "@/schema/zodSchema";


export function MagicBoxSettingsForm({
  initialValues,
}: {
  initialValues: { minJpAmount: number; maxJpAmount: number };
}) {
  const queryClient = useQueryClient();

  const form = useForm<MagicBoxSettings>({
    resolver: zodResolver(magicBoxSettingsSchema),
    defaultValues: initialValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: MagicBoxSettings) => {
      const res = await axios.put("/api/admin/magic-box/settings", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Magic box settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["magicBoxSettings"] });
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error, "Failed to update settings"));
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
    >
      <InputWithLabel
        label="Minimum JP Amount"
        type="number"
        min="1"
        max="1000"
        {...form.register("minJpAmount", { valueAsNumber: true })}
        error={form.formState.errors.minJpAmount}
      />

      <InputWithLabel
        label="Maximum JP Amount"
        type="number"
        min="1"
        max="1000"
        {...form.register("maxJpAmount", { valueAsNumber: true })}
        error={form.formState.errors.maxJpAmount}
      />

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Update Settings"
        )}
      </Button>
    </form>
  );
}
