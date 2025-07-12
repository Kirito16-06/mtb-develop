

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/ax";
import { SignupFormType, signupSchema } from "@/schema/zodSchema";
import GoogleIcon from "../icons/GoogleIcon";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const referralCodeFromURL = searchParams.get("ref");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormType>({
    resolver: zodResolver(signupSchema),
  });

  // ✅ Store referral code in cookie if present
  useEffect(() => {
    if (referralCodeFromURL) {
      setValue("referralCode", referralCodeFromURL);
      Cookies.set("referralCode", referralCodeFromURL, { expires: 7 });
    }
  }, [referralCodeFromURL, setValue]);

  // ✅ React Query mutation for signup
  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormType) => {
      const res = await axios.post("/api/auth/signup", data);
      return res.data;
    },
    onSuccess: async (data, variables) => {
      toast.success("Signup successful");
      const referralCode = variables.referralCode || Cookies.get("referralCode");

      if (referralCode) {
        try {
          const referralRes = await axios.post("/api/refer-friend/process", {
            referralCode,
            userId: data.userId,
          });

          if (referralRes.status >= 200 && referralRes.status < 300) {
            toast.success("Referral processed successfully!");
            Cookies.remove("referralCode"); // remove after processing
          }
        } catch (refErr) {
          toast.error(getAxiosErrorMessage(refErr, "Referral failed"));
        }
      }

      router.push("/signin");
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, "Signup failed"));
    },
  });

  const onSubmit: SubmitHandler<SignupFormType> = async (formData) => {
    setIsLoading(true);
    signupMutation.mutate(formData, {
      onSettled: () => setIsLoading(false),
    });
  };

  
  const handleGoogleLogin = async () => {
    try {
      // Get referral code from URL or cookies
      // const referralCode = searchParams.get('ref');
      
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/dashboard",
        // state: "gggggggggg",
      });
      
      if (result?.ok) {
        console.log("herer in okay");
        router.push("/dashboard");
        toast.success("Signed in successfully");
        return;
      }
      if (result?.error) {
        toast.error("Google Sign in failed. Please try again later.");
      }
    } catch (error) {
      console.error("Error signing in", error);
      toast.error(
        getAxiosErrorMessage(
          error,
          "Google Sign in failed. Please try again later."
        )
      );
    }
  };


  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register("name")} placeholder="Your Name" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        <Input {...register("email")} placeholder="Email" type="email" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <div className="relative">
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="relative">
          <Input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
          />
          <div
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Input
          {...register("referralCode")}
          placeholder="Referral Code (optional)"
          readOnly={!!referralCodeFromURL}
        />
        {errors.referralCode && (
          <p className="text-red-500">{errors.referralCode.message}</p>
        )}
        {referralCodeFromURL && (
          <p className="text-gray-500 text-sm">
            Referral code auto-filled from link
          </p>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 flex items-center justify-center space-x-2"
        onClick={handleGoogleLogin}
      >
        <GoogleIcon />
        <span>Sign in with Google</span>
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-[#1E2875] hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
