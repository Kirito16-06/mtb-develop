"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Gift, Clock, Sparkles, ExternalLink } from "lucide-react";
import { getInitials } from "@/utils/getInitials";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

interface MagicBoxProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface RandomUser {
  id: string;
  name: string;
  image: string | null;
}

const MagicBoxModal: React.FC<MagicBoxProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);

  // Get magic box
  const {
    data: boxData,
    isLoading: isBoxLoading,
    refetch: refetchBox,
  } = useQuery({
    queryKey: ["magicBox"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user/magic-box");
      return data;
    },
    enabled: isOpen && !!userId,
    refetchOnWindowFocus: false,
    // staleTime: 1000 * 60 * 2, // 2 minutes
  });
  //console.log("boxData", boxData); //?dev

  // Open box mutation
  const openBoxMutation = useMutation({
    mutationFn: async (boxId: string) => {
      const { data } = await axios.post("/api/user/magic-box", { boxId });
      return data;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["magicBox"] });
      queryClient.invalidateQueries({ queryKey: ["magicBoxStatus"] });
      refetchBox();
    },
    onError: (error) => {
      toast.error("Failed to open the magic box");
      console.error(error);
    },
  });

  // Redeem box mutation
  const redeemBoxMutation = useMutation({
    mutationFn: async ({
      boxId,
      selectedUserId,
    }: {
      boxId: string;
      selectedUserId: string;
    }) => {
      const { data } = await axios.put("/api/user/magic-box", {
        boxId,
        selectedUserId,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["magicBox"] });
      queryClient.invalidateQueries({ queryKey: ["magicBoxStatus"] });
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      toast.success(
        `You received ${data.jpEarned} JP and shared ${data.shared.jpAmount} JP!`
      );
      refetchBox();
    },
    onError: (error) => {
      toast.error("Failed to redeem the magic box");
      console.error(error);
    },
  });

  // Reset selected user and track previous status when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setPrevStatus(null);
      setShowConfetti(false);
    }
  }, [isOpen]);

  // Trigger confetti on status transition
  useEffect(() => {
    if (boxData?.status && prevStatus) {
      if (prevStatus === "UNOPENED" && boxData.status === "OPENED") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 6000);
      }
    }
    if (boxData?.status) {
      setPrevStatus(boxData.status);
    }
    // return () => setShowConfetti(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxData?.status]);

  const handleOpenBox = () => {
    if (boxData?.magicBox?.id) {
      openBoxMutation.mutate(boxData.magicBox.id);
    }
  };

  const handleRedeemBox = () => {
    if (boxData?.magicBox?.id && selectedUser) {
      redeemBoxMutation.mutate({
        boxId: boxData.magicBox.id,
        selectedUserId: selectedUser,
      });
    } else {
      toast.error("Please select a user to share with");
    }
  };

  const formatNextBoxTime = (nextBoxAt: string) => {
    const nextBoxDate = new Date(nextBoxAt);

    if (nextBoxDate <= new Date()) {
      return "Available now";
    }

    return `Available in ${formatDistanceToNow(nextBoxDate)}`;
  };

  const renderContent = () => {
    if (
      isBoxLoading ||
      openBoxMutation.isPending ||
      redeemBoxMutation.isPending
    ) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading your magic box...</p>
        </div>
      );
    }

    // No box data yet
    if (!boxData) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Gift className="h-16 w-16 text-yellow-500 mb-4" />
          <p className="text-xl font-semibold mb-2">Your Magic Box</p>
          <p className="text-gray-600 mb-6">
            Click to get your daily JP rewards!
          </p>
          <Button onClick={() => refetchBox()}>Check for Magic Box</Button>
        </div>
      );
    }

    const { magicBox, randomUsers, status } = boxData;

    // Box is redeemed, show timer for next box
    if (status === "REDEEMED") {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Clock className="h-16 w-16 text-blue-500 mb-4" />
          <p className="text-xl font-semibold mb-2">Magic Box Redeemed</p>
          <p className="text-gray-600 mb-2">
            You&apos;ve already opened today&apos;s Magic Box
          </p>
          <p className="text-blue-600 font-medium mb-6">
            {formatNextBoxTime(magicBox.nextBoxAt)}
          </p>
          <div className="flex items-center bg-blue-50 p-4 rounded-lg">
            <div className="mr-3">
              <Image
                src="/Pearls.png"
                alt="JP"
                width={30}
                height={30}
                className="rounded-xl"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">You earned</p>
              <p className="text-lg font-bold text-blue-600">
                {magicBox.jpAmount ? magicBox.jpAmount / 2 : 0} JP
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Box is unopened
    if (status === "UNOPENED") {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Gift className="h-16 w-16 text-yellow-500 mb-4" />
          <p className="text-xl font-semibold mb-2">Magic Box</p>
          <p className="text-gray-600 mb-6">
            Open your magic box to get JP rewards!
          </p>
          <Button
            onClick={handleOpenBox}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Open Magic Box
          </Button>
        </div>
      );
    }

    // Box is opened but not redeemed, show random users to share with
    if (status === "OPENED" && randomUsers) {
      return (
        <div className="flex flex-col items-center p-6">
          {/* {showConfetti && ( */}
          {/* {true && (
            <div className="absolute top-0 left-0 right-0 inset-0 pointer-events-none z-50 transition-all">
              <Confetti width={window.innerWidth} height={window.innerHeight} />
            </div>
          )} */}
          <Sparkles className="h-12 w-12 text-yellow-500 mb-2" />
          <p className="text-xl font-semibold mb-1">
            You found {magicBox.jpAmount} JP!
          </p>
          <p className="text-gray-600 mb-6">
            Choose a user to share half with (
            {Math.floor((magicBox.jpAmount || 0) / 2)} JP each)
          </p>

          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            {randomUsers.map((user: RandomUser) => (
              <div
                key={user.id}
                className={`flex  p-3 rounded-lg border justify-between items-center ${
                  selectedUser === user.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div
                  className="flex  items-center  cursor-pointer min-w-0 gap-2"
                  onClick={() => setSelectedUser(user.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="font-medium truncate">{user.name}</p>
                  </div>
                </div>

                <a
                  href={`/profile/${user.id}`}
                  className="text-sm flex items-center  text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  profile
                </a>
              </div>
            ))}
          </div>

          <Button
            onClick={handleRedeemBox}
            disabled={!selectedUser}
            className="w-full"
          >
            Share & Redeem
          </Button>
        </div>
      );
    }

    // Fallback
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-600">Something went wrong. Please try again.</p>
        <Button onClick={() => refetchBox()} className="mt-4">
          Refresh
        </Button>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md md:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-center">Magic Box</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[999999999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              gravity={0.5}
              numberOfPieces={200}
              recycle={false}
              // opacity={confettiOpacity}
              // className=""
              style={{
                position:'fixed',
                zIndex: '999999'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MagicBoxModal;
