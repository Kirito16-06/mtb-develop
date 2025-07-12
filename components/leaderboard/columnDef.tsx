import { LeaderboardUser } from "@/types/client/leaderboard";
import { getInitials } from "@/utils/getInitials";
import { ColumnDef } from "@tanstack/react-table";

const getRankIcon = (rank: number) => {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank.toString();
};

export const columns: ColumnDef<LeaderboardUser>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => (
      <div className="text-xl font-bold">{getRankIcon(row.original.rank)}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <a
        href={`/profile/${row.original.id}`}
        className="flex items-center gap-3 hover:underline hover:"
        target="_blank"
      >
        {row.original.image ? (
          <img
            src={row.original.image}
            alt={row.original.name}
            className="w-10 h-10 rounded object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
            {getInitials(row.original.name)}
          </div>
        )}
        {row.original.name}
      </a>
    ),
  },
  // {
  //   accessorKey: "category",
  //   header: "Category",
  // },
  {
    accessorKey: "jpEarned",
    header: "JP Earned",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.jpEarned}</div>
    ),
  },
  {
    accessorKey: "jpSpent",
    header: "JP Spent",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.jpSpent}</div>
    ),
  },
  {
    accessorKey: "jpTransaction",
    header: "JP Transaction",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.jpTransaction}</div>
    ),
  },
  {
    accessorKey: "jpBalance",
    header: "JP Balance",
    cell: ({ row }) => (
      <div className="font-bold">{row.original.jpBalance}</div>
    ),
  },
];
