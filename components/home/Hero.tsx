"use client";

import { motion } from "framer-motion";
import SignInForm from "../auth/SignInForm";
import CardGrid from "../CardDesign";
import { useSession } from "next-auth/react";

export default function Hero() {
  const { data: session } = useSession();
  console.log("session:", session);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 max-w-2xl mx-auto md:px-4 sm:px-6"
    >
      <div className="space-y-2">
        <h1 className="md:text-[56px] text-[36px] font-bold text-[#1E2875] leading-tight">
          Solopreneurship
        </h1>
        <h1 className="md:text-[56px] text-[36px] font-bold text-[#7B90FF] leading-tight">
          Made Amazing
        </h1>
      </div>

      <p className="md:text-[18px] text-[14px] text-[#636363] leading-relaxed max-w-xl">
        Solopreneurship doesn&apos;t have to be lonely. Join the ecosystem built
        to make your journey joyful, connected and wildly fulfilling.
      </p>

      <div className="pt-2 sm:pt-4">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          <CategoryTag>Trainer</CategoryTag>
          <CategoryTag>Coach</CategoryTag>
          <CategoryTag>Healer</CategoryTag>
          <CategoryTag>Consultant</CategoryTag>
          <CategoryTag>Designer</CategoryTag>
          <CategoryTag>Developer</CategoryTag>
          <CategoryTag>Astrologer</CategoryTag>
        </div>
      </div>

      {session ? <CardGrid /> : <SignInForm />}
    </motion.div>
  );
}

function CategoryTag({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="px-2 py-1.5 sm:px-4 sm:py-2.5 min-w-[80px] rounded-[20px] bg-white text-[#1E2875] text-[12px] sm:text-[15px] font-medium shadow-md transition-all cursor-default"
    >
      {children}
    </motion.button>
  );
}
