"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import FormWrapper from "@/components/wrappers/FormWrapper";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import { getAxiosErrorMessage } from "@/utils/ax";
import ResetFormPageWrapper from "@/components/wrappers/ResetFormPageWrapper";
import { useRouter } from "next/navigation";
import { forgotPasswordInputs, forgotPasswordSchema } from "@/schema/zodSchema";

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<forgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const router = useRouter();

  const handleforgotPassword = async (data: forgotPasswordInputs) => {
    try {
      const res = await axios.post("/api/auth/forgot-password", data);

      if (res.status !== 200) {
        console.log(res); //?dev
        // toast.error("Failed to request password reset. Please try again.");
        toast.error(
          getAxiosErrorMessage(
            res,
            "Failed to request password reset. Please try again."
          )
        );
        return;
      }
      router.push("/");
      console.log("Password reset requested for:", data.email);
      toast.success("Password reset link sent to your email.");
    } catch (error) {
      console.error("Error:", error);
      // toast.error("Failed to request password reset. Please try again.");
      toast.error(getAxiosErrorMessage(error));
    }
  };

  return (
    <ResetFormPageWrapper>
      <FormWrapper
        title="Forgot your password?"
        description="Please enter your email to receive password reset link"
      >
        <form
          onSubmit={handleSubmit(handleforgotPassword)}
          className="flex flex-col gap-4 w-full min-w-sm"
        >
          <InputWithLabel
            label="Enter your email"
            {...register("email")}
            error={errors.email}
          />
          <Button type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </form>
      </FormWrapper>
    </ResetFormPageWrapper>
  );
};

export default ForgotPasswordPage;
