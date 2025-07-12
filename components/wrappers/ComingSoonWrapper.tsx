"use client";

import { ComingSoonModal } from "@/components/modals/CommingSoonModal";
import { useState } from "react";

type ComingSoonWrapperProps = {
  children: React.ReactNode;
};

export function ComingSoonWrapper({ children }: ComingSoonWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <ComingSoonModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
