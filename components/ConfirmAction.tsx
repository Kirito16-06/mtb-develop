
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,

} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface ConfirmActionProps {
  action: () => void; // The function to execute on confirm
  children: React.ReactNode; // The trigger element
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDisabled?: boolean;
}

const ConfirmAction = ({
  action,
  children,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDisabled = false
}: ConfirmActionProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    action();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDisabled}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDisabled}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmAction;
