import { Loader2 } from "lucide-react";
import React from "react";

const PageLoader = () => {
    return (
      <div className="py-16 flex justify-center items-center">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
      </div>
    );
};

export default PageLoader;
