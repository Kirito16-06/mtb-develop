"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonList } from "@/components/common/SkeletonList";
import { columns } from "@/components/transaction-history/columnDef";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionDataTable } from "@/components/transaction-history/data-table";
import { Pagination } from "@/components/ui/pagination";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const LimitSelect = ({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: string) => void;
}) => (
  <div className="px-0 py-0 p-0 space-y-0 items-start mb-6 mx-0 flex justify-end">
    <Select value={value.toString()} onValueChange={onValueChange}>
      <SelectTrigger className="w-48 font-medium text-gray-700 focus:outline-none outline-none focus:ring-0">
        <SelectValue placeholder="Items per page" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5">5 per page</SelectItem>
        <SelectItem value="10">10 per page</SelectItem>
        <SelectItem value="20">20 per page</SelectItem>
        <SelectItem value="50">50 per page</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const TransactionHistoryContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
  const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;

  const { data, isLoading } = useQuery({
    queryKey: ["transactions-history", page, limit],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/user/history?page=${page}&limit=${limit}`
      );
      return data;
    },
    placeholderData: (previousData) => previousData, // This replaces keepPreviousData
    // keepPreviousData:true,
  });

  const handlePageChange = (newPage: number) => {
    router.push(
      `/dashboard/transactions-history?page=${newPage}&limit=${limit}`
    );
  };

  const handleLimitChange = (value: string) => {
    router.push(`/dashboard/transactions-history?page=1&limit=${value}`);
  };

  const {
    transactions = [],
    totalPages,
    // page: currentPage = page,
  } = data || {};

  console.log('totatalPages',totalPages)

  if (isLoading) {
    return (
      <>
        <LimitSelect value={limit} onValueChange={handleLimitChange} />
        <Card>
          <CardContent className="p-0">
            <TransactionDataTable
              columns={columns}
              data={[]}
              currentPage={page}
              totalPages={totalPages} 
              onPageChange={() => {}}
              isLoading={true}
              rowCount={limit}
            />
            <div className="p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <LimitSelect value={limit} onValueChange={handleLimitChange} />
      <Card>
        <CardContent className="p-0">
          <TransactionDataTable
            columns={columns}
            data={transactions}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={false}
          />
          <div className="p-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const TransactionsHistoryPage = () => {
  return (
    <div className="p-4">
      <Suspense
        fallback={
          <Card className="p-4">
            <LimitSelect value={DEFAULT_LIMIT} onValueChange={() => {}} />
            <CardContent>
              <SkeletonList count={4} />
            </CardContent>
          </Card>
        }
      >
        <TransactionHistoryContent />
      </Suspense>
    </div>
  );
};

export default TransactionsHistoryPage;
