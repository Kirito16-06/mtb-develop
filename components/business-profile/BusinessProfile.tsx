"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import AppLayout from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";
import CompletionBar from "@/components/userBusinessProfile/CompletionBar";
import ProfileDisplay from "@/components/userBusinessProfile/ProfileDisplay";
import ProfileEdit from "@/components/userBusinessProfile/ProfileEdit";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageLoader from "@/components/PageLoader";
import { type BusinessProfile } from "@/types/client/business-profile";


// Fallback profile object to use when API returns no profile
const defaultProfile: BusinessProfile = {
  name: "",
  businessInfo: "",
  missionStatement: "",
  goals: "",
  keyOfferings: "",
  achievements: "",
  email: "",
  phone: "",
  website: "",
  socialHandles: {
    linkedin: "",
    instagram: "",
    x: "",
    youtube: "",
    facebook: "",
    tiktok: "",
  },
  featuredWorkTitle: "",
  featuredWorkDesc: "",
  featuredWorkImage: "",
  priorityContactLink: "",
  completionPercentage: 0,
};

const BusinessProfile = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch profile data with useQuery
  const { data: profile, isLoading: queryLoading } = useQuery<BusinessProfile>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/user/profile/getProfile?userId=${userId}`
      );
      // If API returns no profile, fallback to defaultProfile
      return res.data.profile ?? defaultProfile;
    },
    enabled: !!userId, // Only fetch when userId is available
    initialData: defaultProfile,
  });

  // Automatically switch to edit mode if profile.name is empty
  useEffect(() => {
    console.log("profile", profile);
    if (!queryLoading) {
      if (profile?.name) {
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    }
  }, [profile, queryLoading]);

  // Update profile data with useMutation
  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      axios.put(`/api/user/profile/updateProfile?userId=${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] }); // Refetch profile data
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setSelectedFile(null); // Clear selected file after submission
    },
    onError: () => {
      toast.error("Error updating profile. Please try again.");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessProfile>({
    defaultValues: defaultProfile,
  });

  const commonClassName =
    "w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80";

  // Reset form with fetched profile data
  useEffect(() => {
    if (profile) {
      reset({
        ...profile,
        socialHandles: Object.fromEntries(
          Object.entries(profile.socialHandles || {}).map(([platform, url]) => [
            platform,
            typeof url === "string" ? url.replace(/^https?:\/\//, "") : "",
          ])
        ),
        priorityContactLink: profile.priorityContactLink
          ? profile.priorityContactLink.replace(/^https?:\/\//, "")
          : "",
      });
      setImagePreview(profile.featuredWorkImage || null);
    }
  }, [profile, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<BusinessProfile> = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "socialHandles") {
        const normalizedHandles: Record<string, string> = {};
        Object.entries(value || {}).forEach(([platform, url]) => {
          if (typeof url === "string" && url.trim()) {
            normalizedHandles[platform] =
              url.startsWith("http://") || url.startsWith("https://")
                ? url
                : `https://${url}`;
          }
        });
        formData.append(key, JSON.stringify(normalizedHandles));
      } else if (
        key === "priorityContactLink" &&
        typeof value === "string" &&
        value.trim()
      ) {
        const normalizedLink =
          value.startsWith("http://") || value.startsWith("https://")
            ? value
            : `https://${value}`;
        formData.append(key, normalizedLink);
      } else if (
        key !== "featuredWorkImage" &&
        value !== undefined &&
        value !== null
      ) {
        formData.append(key, value.toString());
      }
    });
    if (selectedFile) {
      formData.append("featuredWorkImage", selectedFile, selectedFile.name);
    }
    mutation.mutate(formData);
  };

  // Use mutation.isPending for React Query v5
  const loading = queryLoading || mutation.isPending;

  if (status === "loading") {
    return <PageLoader />;
  }

  if (!session) {
    return (
      <div className="p-6 text-center">
        <AppLayout>Please log in to view your profile.</AppLayout>
      </div>
    );
  }

  return (
    <div className="flex-1 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Business Profile
      </h1>
      <CompletionBar percentage={profile?.completionPercentage ?? 0} />
      {loading && (
        <div className="mb-4 flex justify-center items-center">
          <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
        </div>
      )}
      {!isEditing ? (
        <ProfileDisplay
          profileData={profile}
          onEditClick={() => setIsEditing(true)}
        />
      ) : (
        <ProfileEdit
          onCancel={() => setIsEditing(false)}
          onSubmit={handleSubmit(onSubmit)}
          register={register}
          errors={errors}
          commonClassName={commonClassName}
          handleFileChange={handleFileChange}
          imagePreview={imagePreview}
        />
      )}
    </div>
  );
};

export default BusinessProfile;
