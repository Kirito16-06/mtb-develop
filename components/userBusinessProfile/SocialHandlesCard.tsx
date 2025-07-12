// components/SocialInputCard.tsx
import { BusinessProfile } from "@/types/client/business-profile";
import React from "react";
import type { UseFormRegister, Path } from "react-hook-form";


interface SocialHandlesCardProps {
  label: string;
  name: Path<BusinessProfile>;
  register: UseFormRegister<BusinessProfile>;
  commonClassName: string;
}

const SocialHandlesCard: React.FC<SocialHandlesCardProps> = ({
  label,
  name,
  register,
  commonClassName,
}) => (
  <div>
    <label htmlFor={name} className="block font-medium mb-1">
      {label}: <span className="text-sm text-gray-500">(Optional)</span>
    </label>
    <div className="flex items-center">
      <span className="inline-flex items-center p-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-md">
        https://
      </span>
      <input
        id={name}
        type="text"
        {...register(name)}
        className={`${commonClassName} rounded-l-none`}
      />
    </div>
  </div>
);

export default SocialHandlesCard;
