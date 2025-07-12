// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { toast } from "sonner";
// import { useEffect } from "react";
// import PageLoader from "@/components/PageLoader";

"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useEffect } from "react";
import PageLoader from "@/components/PageLoader";

export default function VerifyEmail() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { data, error, isPending, isError } = useQuery<
    {
      success: boolean;
    },
    Error
  >({
    queryKey: ["verify-email", token],
    queryFn: async () => {
      if (!token) throw new Error("Invalid verification link");
      const res = await axios.post("/api/auth/verify-email/confirm", { token });
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (data?.success) {
      toast.success("Email verified successfully!");
      router.push("/signin");
    }
  }, [data, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Email Verification
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          {isPending ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <PageLoader />
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          ) : isError ? (
            <div className="text-center">
              <p className="text-red-500">{error.message}</p>
              <button
                onClick={() => router.push("/signin")}
                className="mt-4 text-[#151E46] hover:text-[#151E46]/80"
              >
                Return to Sign In
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// export default function VerifyEmail() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const { data, error, isPending, isError } = useQuery<VerifyResponse, Error>({
//     queryKey: ["verify-email", token],
//     queryFn: async () => {
//       if (!token) throw new Error("Invalid verification link");
//       const res = await axios.post("/api/auth/verify-email/confirm", { token });
//       return res.data;
//     },
//     enabled: !!token, // Run only if token is available
//     retry: false,
//   });

//   useEffect(() => {
//     if (data?.success) {
//       toast.success("Email verified successfully!");
//       router.push("/signin");
//     }
//   }, [data, router]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
//         <div className="text-center">
//           <h2 className="text-3xl font-bold text-gray-900">
//             Email Verification
//           </h2>
//         </div>

//         <div className="mt-8 space-y-6">
//           {isPending ? (
//             <div className="flex flex-col items-center justify-center space-y-4">
//               <PageLoader />
//               <p className="text-gray-600">Verifying your email...</p>
//             </div>
//           ) : isError ? (
//             <div className="text-center">
//               <p className="text-red-500">{error.message}</p>
//               <button
//                 onClick={() => router.push("/signin")}
//                 className="mt-4 text-[#151E46] hover:text-[#151E46]/80"
//               >
//                 Return to Sign In
//               </button>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }
