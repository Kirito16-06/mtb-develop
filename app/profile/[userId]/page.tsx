"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageSkeleton from "@/components/PageSkeleton";
import {
  ArrowLeft,
  Linkedin,
  // Twitter,
  Instagram,
  Share2,
  Facebook,
  Youtube,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TikTokIcon from "@/components/icons/TiktokIcon";
// import { FaWhatsapp } from 'react-icons/fa6'

interface UserData {
  name: string;
  email: string;
  image: string | null;
  keyOfferings: string | null;
  achievements: string | null;
  missionStatement: string | null;
  featuredWorkTitle: string | null;
  featuredWorkDesc: string | null;
  socialHandles: {
    facebook: string;
    x: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  goals: string | null;
  website: string | null;
  jpEarned: number;
  jpSpent: number;
  jpBalance: number;
  jpTransaction: number;
}

async function fetchUser(userId: string): Promise<UserData> {
  const res = await fetch(`/api/user/${userId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user data");
  }
  return res.json();
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@"); // Split email into local and domain parts
  const maskedLocalPart =
    localPart[0] + "*****" + localPart[localPart.length - 1]; // Mask middle part of local part
  return maskedLocalPart + "@" + domain; // Return masked email
}

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (session?.user?.id && userId !== session.user.id) {
      timeoutId = setTimeout(() => {
        axios
          .post("/api/user/insights/profile-views", {
            userId,
            viewerId: session.user.id,
          })
          .catch(console.error);
      }, 500); // Delay to prevent rapid duplicate calls
    }

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
  }, [userId, session?.user?.id]);

  const {
    data: userData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${userId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard!");
  };

  console.log("userdata=", userData);

  if (isLoading) {
    return <PageSkeleton type=" user-profile" />;

  }

  if (error || !userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{(error as Error)?.message}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-4 space-y-4 flex-wrap">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData.image || undefined} />
                <AvatarFallback>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="md:text-3xl text-xl font-bold">
                  {userData.name}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  {maskEmail(userData.email)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    JP Balance: {userData.jpBalance}
                  </Badge>
                  <Badge variant="outline">
                    JP Earned: {userData.jpEarned}
                  </Badge>
                  <Badge variant="outline">JP Spent: {userData.jpSpent}</Badge>
                  <Badge variant="outline">
                    JP Transaction: {userData.jpTransaction}
                  </Badge>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-40 flex items-center justify-center space-x-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share Profile</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60 space-y-1">
                  {/* Copy Profile Link */}
                  <DropdownMenuItem asChild>
                    <button
                      onClick={handleCopyLink}
                      className="w-full h-10 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-black text-sm rounded-md"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v16l4-4h9c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H10l-2 2V7h11v10z" />
                      </svg>
                      <span>Copy Profile Link</span>
                    </button>
                  </DropdownMenuItem>

                  {/* Share on X */}
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://twitter.com/intent/tweet?text=Check out this profile: ${profileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full h-10 flex items-center justify-center space-x-2 bg-black hover:bg-black/90 text-white text-sm">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>Share on X</span>
                      </Button>
                    </a>
                  </DropdownMenuItem>

                  {/* Share on WhatsApp */}
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://wa.me/?text=Check out this profile: ${profileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full h-10 flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white text-sm">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span>Share on WhatsApp</span>
                      </Button>
                    </a>
                  </DropdownMenuItem>

                  {/* Share on Telegram */}
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://t.me/share/url?url=Check out this profile: ${profileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full h-10 flex items-center justify-center space-x-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white text-sm">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.563 8.994l-1.83 8.59c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.534-.196 1.006.128.832.941z" />
                        </svg>
                        <span>Share on Telegram</span>
                      </Button>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {userData.website && (
              <div className="flex items-center space-x-2">
                <a
                  href={userData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="bg-blue-600 text-white text-base font-normal px-4 py-1 rounded hover:bg-blue-700 transition">
                    Visit Website
                  </button>
                </a>
              </div>
            )}

            <div className="flex space-x-4 items-center ">
              {userData.socialHandles.facebook && (
                <a
                  href={userData.socialHandles.facebook}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Facebook className="h-6 w-6 text-blue-600 hover:text-blue-800" />
                </a>
              )}
              {userData.socialHandles.x && (
                <a
                  href={userData.socialHandles.x}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* <Twitter className="h-6 w-6 text-blue-400 hover:text-blue-600" />
                   */}

                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {userData.socialHandles.linkedin && (
                <a
                  href={userData.socialHandles.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-6 w-6 text-blue-700 hover:text-blue-900" />
                </a>
              )}

              {userData.socialHandles.youtube && (
                <a
                  href={userData.socialHandles.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube className="h-6 w-6 text-red-600 hover:text-red-800" />
                </a>
              )}

              {userData.socialHandles.tiktok && (
                <a
                  href={userData.socialHandles.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TikTokIcon className="h-6 w-6 text-blue-700 hover:text-blue-900" />
                </a>
              )}
              {userData.socialHandles.instagram && (
                <a
                  href={userData.socialHandles.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-6 w-6 text-pink-500 hover:text-pink-700" />
                </a>
              )}
            </div>

            {userData.keyOfferings && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Key Offerings</h3>
                <p className="text-gray-600">{userData.keyOfferings}</p>
              </div>
            )}

            {userData.achievements && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Achievements</h3>
                <p className="text-gray-600">{userData.achievements}</p>
              </div>
            )}

            {userData.missionStatement && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Missions</h3>
                <p className="text-gray-600">{userData.missionStatement}</p>
              </div>
            )}

            {userData.goals && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Goals</h3>
                <p className="text-gray-600">{userData.goals}</p>
              </div>
            )}

            {userData.featuredWorkTitle && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Title</h3>
                <p className="text-gray-600">{userData.featuredWorkTitle}</p>
              </div>
            )}

            {userData.featuredWorkDesc && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{userData.featuredWorkDesc}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}