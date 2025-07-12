import React from "react";

const ResetFormPageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center h-full w-full bg-transparent">
      <div className="container p-4 bg-transparent h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ResetFormPageWrapper;
