// "use client";

// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { format } from "date-fns";
// import { Users, Eye, PhoneCall } from "lucide-react";
// import ChartContainer from "@/components/insights/ChartContainer";
// import SpotlightHistoryTable from "@/components/insights/SpotlightHistoryTable";
// import SummaryCard from "@/components/insights/SummaryCard";
// import PageLoader from "@/components/PageLoader";

// // Update the interface:
// // - dailyActivity remains as before.
// // - spotlight.active is now a single object (or null), and spotlight.history remains an array.
// interface InsightsData {
//   dailyActivity: {
//     dates: string[];
//     logins: number[];
//   };
//   spotlight: {
//     active: {
//       id: string;
//       views: number;
//       clicks: number;
//     } | null;
//     hourlyMetrics: {
//       hour: string;
//       views: number;
//       clicks: number;
//     }[];
//     history: {
//       applicationDate: string;
//       activatedDate: string;
//       views: number;
//       clicks: number;
//     }[];
//   };
// }

// // Summary Card Component (remains unchanged)

// const InsightsPage = () => {
//   const { data, isLoading, error } = useQuery<InsightsData>({
//     queryKey: ["insights"],
//     queryFn: async () => {
//       const response = await axios.get("/api/user/insights");
//       return response.data;
//     },
//   });

//   if (isLoading) {
//     return <PageLoader />;
//   }

//   if (error || !data) {
//     return (
//       <div className="text-red-500">
//         Error loading insights. Please try again later.
//       </div>
//     );
//   }

//   // Prepare login chart data (from the past 30 days)
//   const loginChartData = data.dailyActivity.dates.map((date, index) => ({
//     date: format(new Date(date), "MMM dd"),
//     logins: data.dailyActivity.logins[index],
//   }));

//   // Compute summary values:
//   const totalLogins = data.dailyActivity.logins.reduce((a, b) => a + b, 0);
//   const spotlightViews = data.spotlight.active
//     ? data.spotlight.active.views
//     : 0;
//   const spotlightClicks = data.spotlight.active
//     ? data.spotlight.active.clicks
//     : 0;

//   // Determine if the user has an active spotlight
//   const hasActiveSpotlight = Boolean(data.spotlight.active);

//   return (
//     <div className="w-full p-6 space-y-6">
//       <h1 className="text-2xl font-bold mb-6">Activity Insights</h1>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <SummaryCard title="Total Logins" value={totalLogins} icon={Users} />
//         {hasActiveSpotlight && (
//           <>
//             <SummaryCard
//               title="Spotlight Views (Today)"
//               value={hasActiveSpotlight ? spotlightViews : 0}
//               icon={Eye}
//             />
//             <SummaryCard
//               title="Connect Clicks (Today)"
//               value={hasActiveSpotlight ? spotlightClicks : 0}
//               icon={PhoneCall}
//             />
//           </>
//         )}
//       </div>

//       {/* Login Activity Chart (Last 30 Days) */}
//       <ChartContainer
//         title="Login Activity (Last 30 Days)"
//         type="line"
//         data={loginChartData}
//         xKey="date"
//         lines={[
//           {
//             dataKey: "logins",
//             stroke: "#151E46",
//             name: "Daily Logins",
//           },
//         ]}
//       />

//       {/* Spotlight Section */}
//       {hasActiveSpotlight ? (
//         <>
//           {/* Render active spotlight graph if user currently has a spotlight */}
//           <ChartContainer
//             title="Active Spotlight Metrics"
//             type="bar"
//             data={data.spotlight.hourlyMetrics}
//             xKey="hour"
//             bars={[
//               { dataKey: "views", fill: "#151E46", name: "Views" },
//               { dataKey: "clicks", fill: "#FF7070", name: "Connect Clicks" },
//             ]}
//           />

//           {/* Previous Spotlight Stats: Show table if history data exists */}
//           {data.spotlight.history.length > 0 && (
//             <SpotlightHistoryTable history={data.spotlight.history} />
//           )}
//         </>
//       ) : (
//         // If no active spotlight, show only the spotlight history (if any)
//         data.spotlight.history.length > 0 && (
//           <SpotlightHistoryTable history={data.spotlight.history} />
//         )
//       )}
//     </div>
//   );
// };

// export default InsightsPage;

import Image from "next/image";

export default function DailyThriveInsights() {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Daily Thrive Insights
          </h1>
          <p className="text-xl flex items-center text-gray-500 max-w-3xl mx-auto">
            Track your journey across all your MyThriveBuddy features, celebrate
            your daily wins, and unlock surprises that reward your consistency.
          </p>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-14 gap-x-10">
          {/* Card 1 - MagicBox */}
          <div className="relative">
            <div className="absolute -top-4 left-4 z-10">
              <div className="bg-pink-500 text-white px-4 py-1 rounded-b-[2px] rounded-t-[8px] font-medium">
                MagicBox - Insight
              </div>
            </div>
            <div className="bg-[linear-gradient(90deg,#B76ADF_0%,#65347F_100%)] flex items-center rounded-lg min-h-40 p-8 pt-10 text-white text-center relative">
              <p className="text-xl font-medium">
                You&apos;re 40% more likely to try a new habit after opening the
                Magic Box first.
              </p>
              <div className="absolute -bottom-3 left-4 shadow-md bg-white rounded-md">
                <div className="w-[58px] h-[58px] flex items-center justify-center">
                  <Image src="/magic.svg" alt="" width={32} height={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Spotlight */}
          <div className="relative">
            <div className="absolute -top-4 left-4 z-10">
              <div className="bg-[#3283C6] text-white px-4 py-1 rounded-b-[2px] rounded-t-[8px] font-medium">
                Spotlight - Insight
              </div>
            </div>
            <div className="bg-[linear-gradient(90deg,#B9591C_0%,#8E3903_100%)] flex items-center rounded-lg min-h-40 p-8 pt-10 text-white text-center relative">
              <p className="text-xl font-medium">
                Using Spotlight, you generated $6,453 in monthly sales from just
                4 visibility moments.
              </p>
              <div className="absolute -bottom-3 left-4 shadow-md bg-white rounded-md">
                <div className="w-[58px] h-[58px] flex items-center justify-center">
                  <Image src="/spotlight.svg" alt="" width={32} height={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Miracle Log */}
          <div className="relative">
            <div className="absolute -top-4 left-4 z-10">
              <div className="bg-[#E8899E] text-white px-4 py-1 rounded-b-[2px] rounded-t-[8px] font-medium">
                Miracle Log - Insight
              </div>
            </div>
            <div className="bg-[linear-gradient(90deg,#51C0F9_0%,#106794_100%)] flex items-center rounded-lg min-h-40 p-8 pt-10 text-white text-center relative">
              <p className="text-xl flex items-center font-medium">
                You logged 17 miracles during your busiest work weeks—your
                mindset stayed strong when it mattered most.
              </p>
              <div className="absolute -bottom-3 left-4 shadow-md bg-white rounded-md">
                <div className="w-[58px] h-[58px] flex items-center justify-center">
                  <Image src="/note.svg" alt="" width={32} height={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 - MagicBox */}
          <div className="relative">
            <div className="absolute -top-4 left-4 z-10">
              <div className="bg-[#392648] text-white px-4 py-1 rounded-b-[2px] rounded-t-[8px] font-medium">
                1% Start - Insight
              </div>
            </div>
            <div className="bg-[linear-gradient(90deg,#FF605B_0%,#9E0A05_100%)] flex items-center rounded-lg min-h-40 p-8 pt-10 text-white text-center relative">
              <p className="text-xl flex items-center font-medium">
                Tuesday mornings are your highest-performing 1% Start zone.
              </p>
              <div className="absolute -bottom-3 left-4 shadow-md bg-white rounded-md">
                <div className="w-[58px] h-[58px] flex items-center justify-center ">
                  <Image src="/leader.svg" alt="" width={32} height={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 5 - MagicBox */}
          <div className="relative">
            <div className="absolute -top-4 left-4 z-10">
              <div className="bg-[#FFAC37] text-white px-4 py-1 rounded-b-[2px] rounded-t-[8px] font-medium ">
                1% Progress Vault - Insight
              </div>
            </div>
            <div className="bg-[linear-gradient(90deg,#F25CB6_0%,#AD0068_100%)] flex items-center rounded-lg min-h-40 p-8 pt-10 text-white text-center relative">
              <p className="text-xl flex items-center font-medium">
                Vault entries done after 10 PM were least likely to be completed
                the next day.
              </p>
              <div className="absolute -bottom-3 left-4 shadow-md bg-white rounded-md">
                <div className="w-[58px] h-[58px] flex items-center justify-center">
                  <Image src="/money.svg" alt="" width={32} height={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 6 - MagicBox */}
          <div className="relative">
            <div className="absolute -top-4 left-4 z-10">
              <div className="bg-[#FF69AD] text-white px-4 py-1 rounded-b-[2px] rounded-t-[8px] font-medium">
                BuddyLens - Insight
              </div>
            </div>
            <div className="bg-[linear-gradient(90deg,#374B99_0%,#121B3E_100%)] flex items-center rounded-lg min-h-40 p-8 pt-10 text-white text-center relative">
              <p className="text-xl  font-medium">
                Your breakthroughs often come 2–3 days after buddyLens feedback.
              </p>
              <div className="absolute -bottom-3 left-4 shadow-md bg-white rounded-md">
                <div className="w-[58px] h-[58px] flex items-center justify-center">
                  <Image src="/buddy.svg" alt="" width={32} height={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
