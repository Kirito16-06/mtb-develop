import { Suspense } from "react";
import ProgressVaultClient from "@/components/progress-vault/progress-vault-client";
import { Loader2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { checkRole } from "@/lib/utils/auth";

async function getProgressVault() {
  const session = await checkRole("USER");
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const logs = await prisma.progressVault.findMany({
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
        type: "PROGRESS_VAULT"
      }
    },
    select: {
      progress_vault_count: true
    }
  });

  return { count: streak?.progress_vault_count || 0 };
}

export default async function ProgressVaultPage() {
  const [logs, streak] = await Promise.all([
    getProgressVault(),
    getStreak(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your progress vault...</span>
        </div>
      }
    >
      <ProgressVaultClient initialLogs={logs} initialStreak={streak} />
    </Suspense>
  );
}
