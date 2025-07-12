"use client";
import { useSession } from "next-auth/react";
import AppLayout from "../layout/AppLayout";
import React, { Suspense, useEffect } from "react";
import SignUpForm from "./SignUpForm";
import { useRouter } from "next/navigation";
import PageLoader from "../PageLoader";

const SiginUpPageContent = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    if (session?.user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <AppLayout>
      {/* // <main className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#F8F2FF] to-[#FF69B4] py-4 sm:py-6 md:py-8 px-4">
    //   <div className="max-w-[1280px] mx-auto">
    //     <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-4 sm:p-6 md:p-8">
    //       <Navbar /> */}
      <div className="mt-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E2875] mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join MyThriveBuddy today</p>
        </div>
        {/* <SignUpForm /> */}

        <Suspense fallback={<PageLoader />}>
          <SignUpForm />
        </Suspense>
      </div>
      {/* //     </div>
    //   </div>
    // </main> */}
    </AppLayout>
  );
};

export default SiginUpPageContent;
