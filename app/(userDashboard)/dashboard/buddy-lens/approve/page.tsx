
import BuddyLensApprovePage from "@/components/buddy-lens/ApproveRequets";
import PageSkeleton from "@/components/PageSkeleton";
import { Suspense } from "react";

export default function Approve() {
  return (
    <Suspense
      fallback={
        <PageSkeleton type="approve" />
      }>
      <BuddyLensApprovePage />
    </Suspense>
  )
}
