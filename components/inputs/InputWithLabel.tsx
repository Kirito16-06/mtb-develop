import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";
import { FieldError } from "react-hook-form";
export interface FormInputExtraProps {
  label: ReactNode;
  direction?: string;
  error?: FieldError;
}

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    FormInputExtraProps {}

export function InputWithLabel({
  label,
  //   direction,
  error,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Input
        {...props}
        className={`h-12 ${props.className || ""} ${
          error ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
      {/* {direction && !error && (
        <p className="text-sm text-muted-foreground">{direction}</p>
      )} */}
    </div>
  );
}
