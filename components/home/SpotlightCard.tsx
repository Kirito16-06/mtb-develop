// "use client";

// import Image from "next/image";
// import { motion } from "framer-motion";
// import avtarImg from "@/public/avtar.png";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { Prisma } from "@prisma/client";

// // TODO: get types from prism for spotlight
// interface SpotlightResponse {
//   id: string;
//   expiresAt: string;
//   user: {
//     name: string;
//     email: string;
//     image?: string;
//     userBusinessProfile: Prisma.UserGetPayload<{
//       include: { userBusinessProfile: true };
//     }>["userBusinessProfile"];
//     // other user fields except password
//   };
// }

// export default function SpotlightCard() {
//   const { data: spotlight, isLoading } = useQuery<SpotlightResponse>({
//     queryKey: ["publicSpotlight"],
//     queryFn: async () => {
//       const { data } = await axios.get("/api/public/spotlight");
//       return data;
//     },
//   });
//   // const { featuredWorkTitle,} = spotlight?.user?.userBusinessProfile[0];
// console.log(spotlight);
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.5 }}
//       className="bg-[#0A0B1C] rounded-[32px] md:px-8 px-4 text-white relative overflow-hidden h-full"
//     >
//       <div className="">
//         <h2 className="text-[32px] font-bold leading-tight my-8">
//           Spotlight of
//           <br />
//           the Day.
//         </h2>

//         <p className="text-[#B4B4B4] text-[16px] mb-6">
//           Meet the inspiring solopreneur leading the way today.
//         </p>

//         <div className="flex items-center space-x-5 mb-6">
//           <div className="relative w-[80px] h-[80px]">
//             <Image
//               src={
//                 spotlight?.user?.userBusinessProfile?.[0]?.featuredWorkImage ||
//                 avtarImg
//               }
//               alt="Profile"
//               fill
//               className="rounded-full object-cover"
//               priority
//             />
//           </div>
//           <div>
//             <h3 className="text-[24px] font-bold">
//               {isLoading
//                 ? "Loading..."
//                 : spotlight?.user?.name || "No Spotlight Available"}
//             </h3>
//             <p className="text-[#B4B4B4] text-[16px]">
//               {spotlight?.user?.userBusinessProfile?.[0]?.featuredWorkTitle ??
//                 "Marketing Coordinator"}
//             </p>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl p-6  md:mt-[160px]">
//           <p className="text-[#636363] text-[16px] leading-relaxed mb-6">
//             {spotlight?.user?.userBusinessProfile?.[0]?.featuredWorkDesc ||
//               `This creates a sense of recognition and highlights the individual in
//             focus, while maintaining the overall theme of growth and
//             inspiration. Let&apos;s know if you&apos;d like any changes!`}
//           </p>
//           <a
//             href={
//               spotlight?.user?.userBusinessProfile?.[0]?.priorityContactLink || ""
//             }
//             target="_blank"
//           >
//             <button className="w-full bg-[#1E2875] text-white py-3 rounded-lg font-medium hover:bg-[#1E2875]/90 transition-colors">
//               Let&apos;s Connect
//             </button>
//           </a>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import avtarImg from "@/public/avtar.png";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { SpotlightResponse } from "@/types/client/spotligh";

// Spotlight types
export default function SpotlightCard() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedView = useRef(false);

  // Fetch spotlight data
  const { data: spotlight, isLoading } = useQuery<SpotlightResponse>({
    queryKey: ["publicSpotlight"],
    queryFn: async () => {
      const { data } = await axios.get("/api/public/spotlight");
      return data;
    },
  });

  // Track view mutation
  const trackViewMutation = useMutation({
    mutationFn: async (spotlightId: string) => {
      return axios.post("/api/public/spotlight-activity", {
        spotlightId,
        type: "VIEW",
      });
    },
  });

  // Track click mutation
  const trackClickMutation = useMutation({
    mutationFn: async (spotlightId: string) => {
      return axios.post("/api/public/spotlight-activity", {
        spotlightId,
        type: "CONNECT",
      });
    },
  });

  // View tracking using IntersectionObserver
  useEffect(() => {
    if (!spotlight?.id || !cardRef.current || hasTrackedView.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackViewMutation.mutate(spotlight.id);
          hasTrackedView.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [spotlight?.id, trackViewMutation]);

  const handleConnectClick = () => {
    if (spotlight?.id) {
      trackClickMutation.mutate(spotlight.id);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-[32px] md:px-10 px-4 text-white relative overflow-hidden h-full custom-phone-bg"
      style={{
        backgroundImage: `url('/landing-bg.svg')`, // Replace with your image URL or path
        backgroundSize: "100% 100%", // Adjusts image to cover the container
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents image repetition
      }}
    >
      <div>
        <h2 className="md:text-[36px] text-lg font-bold leading-normal my-8">
          Spotlight of
          <br className="md:block hidden" />
          the Day.
        </h2>

        <p className="text-[#B4B4B4] md:text-[25px] mb-6">
          Meet the inspiring solopreneur leading the way today.
        </p>

        <div className="flex items-end space-x-5 mb-6 space-between pl-[2%] pr-[8%]">
          <div className="grow">
            <h3 className="text-[24px] font-bold">
              {isLoading
                ? "Loading..."
                : spotlight?.user?.name || "No Spotlight Available"}
            </h3>
            <p className="text-[#B4B4B4] text-[16px]">
              {spotlight?.user?.userBusinessProfile?.[0]?.featuredWorkTitle ??
                "Marketing Coordinator"}
            </p>
          </div>
          <div className="relative md:w-[160px] md:h-[160px] w-[90px] h-[70px]">
            <Image
              src={
                spotlight?.user?.userBusinessProfile?.[0].featuredWorkImage ||
                avtarImg
              }
              alt="Profile"
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
        </div>

        <div
          className=" rounded-2xl  p-6 md:mt-[160px] mb-5"
          style={{
            backgroundImage: `url('/spotlight-bg.svg')`, // Replace with your image URL or path
            backgroundSize: "cover", // Adjusts image to cover the container
            backgroundPosition: "center", // Centers the image
            backgroundRepeat: "no-repeat", // Prevents image repetition
          }}
        >
          <p className="text-[#50525B] text-[16px] leading-relaxed mb-6">
            {spotlight?.user?.userBusinessProfile?.[0].featuredWorkDesc ||
              `This creates a sense of recognition and highlights the individual in
              focus, while maintaining the overall theme of growth and
              inspiration.`}
          </p>
          <a
            href={
              spotlight?.user?.userBusinessProfile?.[0].priorityContactLink || 
              "#"
            }
            target="_blank"
            onClick={handleConnectClick}
          >
            <button className=" bg-[#151E46] text-white py-2 px-4 rounded-full font-medium hover:bg-[#1E2875]/90 transition-colors">
              Let&apos;s Connect
            </button>
          </a>
        </div>
      </div> 
    </motion.div>
  );
}
