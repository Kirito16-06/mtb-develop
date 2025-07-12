import React, { useEffect, useRef, useState } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils/tw";

export type StepStatus = "completed" | "current" | "upcoming";

export interface Step {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
}

interface ApplicationStepperProps {
  steps: Step[];
  className?: string;
  currentStep?: number; // 0-indexed step number
}

export function ApplicationStepper({
  className,
  currentStep = 0,
  steps,
}: ApplicationStepperProps) {
  const ref = useRef<(HTMLDivElement | null)[]>([]);
  const [margins, setMargins] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const firstElement = ref.current[0];
    const lastElement = ref.current[ref.current.length - 1];

    if (firstElement && lastElement) {
      const firstWidth = firstElement.offsetWidth;
      const lastWidth = lastElement.offsetWidth;

      setMargins({
        left: firstWidth / 2,
        right: lastWidth / 2,
      });
    }
  }, []);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[20px] border bg-white shadow-md",
        className
      )}
    >
      <div className="md:px-12 px-5 py-7 w-full">
        <div className="flex w-full justify-between gap-6 relative">
          {/* Connecting line */}
          <div
            className="bg-gray-200 h-[2px] absolute top-[18%] left-0 right-0"
            style={{
              width: `calc(100% - ${margins.left}px - ${margins.right}px)`,
              marginLeft: `${margins.left}px`,
              marginRight: `${margins.right}px`,
            }}
          >
            <div
              className="h-[2px] bg-jp-orange"
              style={{
                width: `${Math.min(
                  100 * (Number(currentStep) / (steps.length - 1)),
                  100
                )}%`,
              }}
            />
          </div>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className="flex flex-col items-center text-center h-full relative"
                ref={(el) => {
                  ref.current[index] = el;
                }}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md",

                    currentStep - 1 === index
                      ? "bg-[#3BA33BE5]"
                      : currentStep >= index
                      ? "bg-jp-orange"
                      : "bg-gray-200"
                  )}
                  aria-hidden="true"
                >
                  {currentStep - 1 >= index ? (
                    <div className="h-5 w-5 rounded bg-white">
                      <CheckIcon
                        className={`h-5 w-5 my-auto ${
                          currentStep - 1 === index
                            ? "text-[#3BA33BE5]"
                            : "text-jp-orange"
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded bg-white" />
                  )}
                </div>
                <div className="mt-3 flex flex-col">
                  <span
                    className={cn(
                      "text-base font-medium md:text-lg",
                      currentStep - 1 >= index
                        ? "text-[#334CAD]"
                        : "text-gray-500"
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-gray-500 md:text-sm">
                    {step.description}
                  </span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
