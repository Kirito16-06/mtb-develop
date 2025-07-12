/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/ax";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import {
  IBlockUserParams,
  IBlockUserResponse,
  IUser,
} from "@/types/client/user-info";
import useAdminPresence from "@/hooks/useUserRealtime";


async function fetchUsers(
  filter: string,
  search: string,
  page: number,
  pageSize: number
): Promise<{ users: IUser[]; total: number }> {
  const { data } = await axios.get(`/api/admin/dashboard/getAllUsers`, {
    params: {
      filter,
      search,
      page,
      pageSize,
    },
  });
  return data;
}

async function blockUser(
  params: IBlockUserParams
): Promise<IBlockUserResponse> {
  const { data } = await axios.patch(`/api/admin/dashboard/blockUser`, params);
  return data;
}

export default function UserInfoContent() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [reason, setReason] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const queryClient = useQueryClient();

  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", filter, searchTerm, page],
    queryFn: () => fetchUsers(filter, searchTerm, page, pageSize),
    refetchOnWindowFocus: false,
  });

  const blockMutation = useMutation({
    mutationFn: (params: IBlockUserParams) => blockUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", filter, searchTerm, page],
      });
      setShowModal(false);
    },
    onError: (err) => toast.error(getAxiosErrorMessage(err)),
  });

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value.toLowerCase());
    setPage(1);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleBlockClick = (user: IUser) => {
    setSelectedUser(user);
    setReason("");
    setShowModal(true);
  };

  const handleBlockSubmit = () => {
    if (!reason.trim() || !selectedUser) return;
    blockMutation.mutate({ userId: selectedUser.id, reason });
  };

  const users = data?.users || [];
  const totalUsers = data?.total || 0;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const onlineUsers = useAdminPresence(["users", filter, searchTerm, page]);
  const onlineUserIds = new Set(onlineUsers.map((u) => u.userId));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">User Management</h2>

      <div className="flex mb-4 gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <select
          className="px-4 py-2 border rounded-lg"
          onChange={handleFilterChange}
          defaultValue="all"
        >
          <option value="all">All Users</option>
          <option value="blocked">Blocked</option>
          <option value="new">New</option>
        </select>
      </div>

      {isLoading && <p>Loading users...</p>}
      {isError && <p className="text-red-600">Error: {error?.message}</p>}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>JP Earned</TableHead>
              <TableHead>JP Balance</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full relative bg-purple-100 flex items-center justify-center">
                      {user.name.slice(0, 2).toUpperCase()}
                      {user.isOnline && onlineUserIds.has(user?.id) && (
                        <span className="absolute h-2 w-2 bottom-0 right-0 rounded-full bg-green-500 ring-1 ring-white"></span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.jpEarned}</TableCell>
                <TableCell>{user.jpBalance}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {user.plan?.name || "Free"}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    className={`${
                      user.isBlocked
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:text-red-900"
                    }`}
                    onClick={() => handleBlockClick(user)}
                    disabled={user.isBlocked}
                  >
                    {user.isBlocked ? "Blocked" : "Block"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-gray-500"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Block Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Block User</h3>
            <p className="mb-4">
              Blocking <strong>{selectedUser.email}</strong>
            </p>
            <textarea
              className="w-full border rounded-lg p-2 mb-4"
              placeholder="Enter reason for blocking"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 border rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={handleBlockSubmit}
                disabled={!reason.trim() || blockMutation.isPending}
              >
                {blockMutation.isPending ? "Blocking..." : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}