"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock } from "lucide-react";

type ComingSoonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ComingSoonModal({ open, onOpenChange }: ComingSoonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-black rounded-3xl sm:rounded-3xl shadow-lg flex flex-col gap-6 items-center p-10 max-w-[400px] sm:max-w-[450px]">
        {/* Big Clock Icon */}
        <Clock
          className="h-20 w-20"
          strokeWidth={1.5}
          style={{ color: "#FF7070" }}
        />
        <DialogHeader className="text-center">
          <DialogTitle
            className="text-3xl font-medium"
            style={{ color: "#151E46" }}
          >
            Coming Soon
          </DialogTitle>
        </DialogHeader>

        {/* Optional Close Button */}
        {/* <DialogClose asChild>
          <Button
            variant="outline"
            className="mt-4 bg-white text-[#151E46] border border-[#151E46] hover:bg-[#f0f0f0]">
            Close
          </Button>
        </DialogClose> */}
      </DialogContent>
    </Dialog>
  );
}
