"use client";
import { Button } from "@/components/ui/button";
import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import FormWrapper from "@/components/wrappers/FormWrapper";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import { getAxiosErrorMessage } from "@/utils/ax";
import ResetFormPageWrapper from "@/components/wrappers/ResetFormPageWrapper";
import { ResetPasswordInputs, resetPasswordSchema } from "@/schema/zodSchema";



const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const router = useRouter();

  const handleResetPassword = async (data: ResetPasswordInputs) => {
    try {
      const res = await axios.post("/api/auth/reset-password", {
        password: data.password,
        token,
      });

      if (res.status !== 200) {
        toast.error("Failed to reset password. Please try again.");
        return;
      }
      toast.success("Password reset successful. You can now login.");
      router.push("/signin");
    } catch (error) {
      console.error("Error:", error);
      // toast.error("Failed to reset password. Please try again.");
      toast.error(getAxiosErrorMessage(error));
    }
  };

  return (
    <ResetFormPageWrapper>
      <FormWrapper
        title="Reset Password"
        description="Please enter your email to receive password reset link"
      >
        <form
          onSubmit={handleSubmit(handleResetPassword)}
          className="flex flex-col gap-4 w-full min-w-sm"
        >
          <InputWithLabel
            label="Enter Password"
            type="password"
            {...register("password")}
            error={errors.password}
          />
          <InputWithLabel
            label="Confirm Password"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword}
          />
          <Button type="submit" disabled={isSubmitting} size={"lg"}>
            Submit
          </Button>
        </form>
      </FormWrapper>
    </ResetFormPageWrapper>
  );
};

const ResetPasswordPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* //? IDK useSearchParams asked for suspense at build time */}
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
};

export default ResetPasswordPage;
