import { cn } from "@/lib/utils/tw";
import React from "react";

interface FormWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const FormWrapper = ({
  title,
  description,
  children,
  className,
  ...props
}: FormWrapperProps) => {
  return (
    <div
      className={cn(
        "space-y-8 border w-fit bg-white/90 rounded-[32px] px-6 py-9 sm:px-8 sm:py-11 md:px-10 md:py-14",
        className
      )}
      {...props}
    >
      <div>
        <h1 className="text-3xl font-bold text-thrive-blue ">{title}</h1>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default FormWrapper;
