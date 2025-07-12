import { Suspense } from "react";
import  MiracleLogClient  from "@/components/miracle-log/miracle-log-client";
import { Loader2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";


async function getMiracleLogs() {
  const session = await checkRole("USER");
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const logs = await prisma.miracleLog.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  return logs.map(log => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    deletedAt: log.deletedAt?.toISOString() || null
  }));
}

async function getStreak() {
  const session = await checkRole("USER");
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const streak = await prisma.streak.findUnique({
    where: {
      userId_type: {
        userId: session.user.id,
        type: "MIRACLE_LOG"
      }
    },
    select: {
      miracle_log_count: true
    }
  });

  return { count: streak?.miracle_log_count || 0 };
}

export default async function MiracleLogPage() {
  const [logs, streak] = await Promise.all([
    getMiracleLogs(),
    getStreak(),
  ]);

  return (
    <Suspense
      fallback={
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading your miracle logs...</span>
          </div>
      }
    >
      <MiracleLogClient initialLogs={logs} initialStreak={streak} />
    </Suspense>
  );
}
