"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/leaderboard/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "@/components/leaderboard/columnDef";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_LEADERBOARD_PAGE,
  DEFAULT_LEADERBOARD_PAGE_LIMIT,
} from "@/lib/constant";
import PageSkeleton from "../PageSkeleton";
import { SortKey, SortSelectProps } from "@/types/client/leaderboard";





// Create a new component for the Select UI
const SortSelect = ({
  orderBy,
  // page,
  // limit,
  onValueChange,
}: SortSelectProps) => (
  <div className="px-0 py-0 p-0 space-y-0 items-start mt-8 mb-6 mx-0 flex justify-end">
    <Select value={orderBy} onValueChange={onValueChange}>
      <SelectTrigger className="w-48 font-medium text-gray-700 focus:outline-none outline-none focus:ring-0">
        <SelectValue placeholder="Sort by JP Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="jpEarned">JP Earned</SelectItem>
        <SelectItem value="jpSpent">JP Spent</SelectItem>
        <SelectItem value="jpBalance">JP Balance</SelectItem>
        <SelectItem value="jpTransaction">JP Transaction</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

// Modify LeaderboardContent to include both the select and table
const LeaderboardContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || DEFAULT_LEADERBOARD_PAGE;
  const limit =
    Number(searchParams.get("limit")) || DEFAULT_LEADERBOARD_PAGE_LIMIT;
  const orderBy = (searchParams.get("orderBy") as SortKey) || "jpEarned";

  
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", page, limit, orderBy],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/user/leaderboard?limit=${limit}&page=${page}&orderBy=${orderBy}`
      );
      return data;
    },
  });

  const handleSort = (value: string) => {
    router.push(
      `/dashboard/leaderboard?orderBy=${value}&page=${page}&limit=${limit}`
    );
  };

  if (isLoading) {
    return <PageSkeleton type="leaderboard" />;
    
    // return (
    //   <>
    //     <SortSelect
    //       orderBy={orderBy}
    //       // page={page}
    //       // limit={limit}
    //       onValueChange={handleSort}
    //     />
    //     <Card className="p-4">
    //       <CardContent>
    //         <div className="space-y-4">
    //           {[1, 2, 3, 4].map((i) => (
    //             <Skeleton key={i} className="w-full h-16" />
    //           ))}
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </>
    // );
  }

  const { users = [] } = data || {};
  const totalPages = data?.totalPages || 1;

  return (
    <>
      <SortSelect
        orderBy={orderBy}
        // page={page}
        // limit={limit}
        onValueChange={handleSort}
      />
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={users} totalPages={totalPages}/>
        </CardContent>
      </Card>
    </>
  );
};

// Simplify the main page component
const LeaderboardPage = () => {

  return (
    <Suspense
      fallback={
        <Card className="p-4">
          <SortSelect
            orderBy="jpEarned"
            // page={DEFAULT_LEADERBOARD_PAGE}
            // limit={DEFAULT_LEADERBOARD_PAGE_LIMIT}
            onValueChange={() => {}}
          />
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
};

export default LeaderboardPage;