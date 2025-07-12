"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Prisma } from "@prisma/client";
import JPCard from "@/components/dashboard/JPCard";
import RightPanel from "@/components/dashboard/user/RightPanel";
import { ApplicationStepper } from "@/components/ApplicationStepper";
import {
  spotlightSteps,
  SpotlightStepperMap,
  prosperitySteps,
  ProsperityStepperMap,
} from "@/lib/constants/applicationSteps";
import PageSkeleton from "@/components/PageSkeleton";


export default function DashboardPage() {
  const { data: session, status } = useSession();
  // const userId = session?.user?.id;
  // this hook i have called in layout so on every route with this layout have access to this hook
  // useUserPresence({ userId } as UserPresenceProps);

  const { data: spotlights, isLoading: spotlightLoading } = useQuery<
    Prisma.SpotlightGetPayload<{ include: { user: true } }>[]
  >({
    queryKey: ["spotlight", session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/user/spotlight`);
      return response.data;
    },
    retry: false,
    enabled: !!session?.user?.id,
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const response = await axios.get("/api/user");
      return response.data.user;
    },
    retry: false,
  });

  const { data: prosperityApplications, isLoading: prosperityLoading } =
    useQuery<Prisma.ProsperityDropGetPayload<{ include: { user: true } }>[]>({
      queryKey: ["prosperityDrops", session?.user?.id],
      queryFn: async () => {
        const response = await axios.get(`/api/user/prosperity`);
        return response.data;
      },
      retry: false,
      enabled: !!session?.user?.id,
    });

  console.log(spotlights);

  if (
    spotlightLoading ||
    status === "loading" ||
    userLoading ||
    prosperityLoading
  ) {
    // return <PageLoader />;
    return <PageSkeleton type="dashboard" />;
  }

  const currentSpotlight:
    | Prisma.SpotlightGetPayload<{
        include: { user: true };
      }>
    | undefined = spotlights?.find((spotlight) => {
    return ["APPLIED", "IN_REVIEW", "APPROVED", "ACTIVE"].includes(
      spotlight.status
    );
  });
  console.log("currentSpotlight", currentSpotlight);

  const currentProsperity = prosperityApplications?.find((prosperity) => {
    return ["APPLIED", "IN_REVIEW", "APPROVED"].includes(prosperity.status);
  });
  console.log("currentProsperity", currentProsperity);

  return (
    <div className="py-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Dashboard Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-3">
            <JPCard value={userData?.jpEarned || 0} label="Total JP Earned" />
            <JPCard value={userData?.jpSpent || 0} label="Total JP Spent" />
            <JPCard value={userData?.jpBalance || 0} label="JP Balance" />
          </div>

          <h2 className="text-xl sm:text-2xl mt-6 mb-4 text-slate-800 font-semibold">
            Spotlight
          </h2>
          <ApplicationStepper
            steps={spotlightSteps}
            currentStep={
              currentSpotlight
                ? SpotlightStepperMap[currentSpotlight?.status]
                : 0
            }
          />

          <h2 className="text-xl sm:text-2xl mt-8 mb-4 text-slate-800 font-semibold">
            Prosperity Drop
          </h2>
          <ApplicationStepper
            steps={prosperitySteps}
            currentStep={
              currentProsperity
                ? ProsperityStepperMap[currentProsperity?.status]
                : 0
            }
          />
        </div>

        {/* Divider */}
        {/* <div className="hidden lg:block h-auto w-px bg-gray-300 dark:bg-brown-500"></div> */}

        {/* Right Panel */}
        <div className="lg:flex-[0.4] mt-6 lg:mt-0">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
