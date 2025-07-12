"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadCloud, Loader2, Pencil, UserPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormType } from "@/schema/zodSchema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@/utils/ax";
import { getInitials } from "@/utils/getInitials";
import PageSkeleton from "../PageSkeleton";
import { ProfileResponse } from "@/types/client/my-profile";

export default function MyProfile() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
    }
  });

  // Fetch user profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery<ProfileResponse>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const response = await axios.get<ProfileResponse>('/api/user/my-profile');
        setHasProfile(true);
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          setHasProfile(false);
        }
        throw error;
      }
    },
  });

  // Update form with profile data when available
  useEffect(() => {
    if (profileData?.profile) {
      const { profile } = profileData;
      reset({
        name: profile.name,
        bio: profile.bio || '',
      });
      
      if (profile.image) {
        setProfileImage(profile.image);
      }
    }
  }, [profileData, reset]);

  // Save profile data
  const saveProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post<ProfileResponse>('/api/user/my-profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(hasProfile ? "Profile updated successfully!" : "Profile created successfully!");
      if (data.profile.image) {
        setProfileImage(data.profile.image);
        setNewProfileImage(null);
      }
      setIsEditMode(false);
      setHasProfile(true);
      
      // Invalidate and refetch the userProfile query
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { 
          profilePicture: data.profile.image,
          fullName: data.profile.name
        } 
      }));
    },
    onError: (error) => {
      toast.error(getAxiosErrorMessage(error, "Failed to save profile"));
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isEditMode || hasProfile === false) {
      fileInputRef.current?.click();
    }
  };

  const onSubmit = (formData: ProfileFormType) => {
    const submitData = new FormData();
    
    // Add form fields to FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        submitData.append(key, value);
      }
    });
    
    // Add profile image if there's a new one
    if (newProfileImage) {
      submitData.append('profilePicture', newProfileImage);
    }
    
    saveProfileMutation.mutate(submitData);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };


  if (isLoadingProfile) {
      return <PageSkeleton type="my-profile" />;
  }

  if (hasProfile === false) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <UserPlus className="text-primary h-5 w-5" />
                <p className="text-sm">It looks like you have not set up your profile yet. Please fill in the form below to create your profile.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Avatar 
                  className="h-16 w-16 cursor-pointer" 
                  onClick={handleImageClick}
                >
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" />
                  ) : null}
                  <AvatarFallback>
                    {getInitials(profileData?.profile?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label className="flex items-center gap-2 cursor-pointer" onClick={handleImageClick}>
                    <UploadCloud size={20} /> Upload Profile Picture
                  </Label>
                  <Input 
                    type="file" 
                    className="mt-2 hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Click on the Profile Picture to change your profile picture</p>
                </div>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  {...register("name")}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label>Bio / About Me</Label>
                <Input
                  {...register("bio")}
                  placeholder="Write a short intro..."
                />
                {errors.bio && (
                  <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={saveProfileMutation.isPending}
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    "Create Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">My Profile</CardTitle>
          {!isEditMode ? (
            <Button
              onClick={toggleEditMode}
              className="flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit Profile
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={toggleEditMode}
              className="flex items-center gap-2"
            >
              Cancel
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar 
                className={`h-16 w-16 ${isEditMode ? 'cursor-pointer' : ''}`} 
                onClick={handleImageClick}
              >
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile" />
                ) : null}
                <AvatarFallback>
                  {getInitials(profileData?.profile?.name || "")}
                </AvatarFallback>
              </Avatar>
              {isEditMode && (
                <div>
                  <Label className="flex items-center gap-2 cursor-pointer" onClick={handleImageClick}>
                    <UploadCloud size={20} /> Upload Profile Picture
                  </Label>
                  <Input 
                    type="file" 
                    className="mt-2 hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Click on the avatar to change your profile picture</p>
                </div>
              )}
            </div>

            <div>
              <Label>Name</Label>
              <Input
                {...register("name")}
                placeholder="Enter your name"
                disabled={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Bio / About Me</Label>
              <Input
                {...register("bio")}
                placeholder="Write a short intro..."
                disabled={!isEditMode}
                className={!isEditMode ? "bg-muted" : ""}
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
              )}
            </div>

            {isEditMode && (
              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={saveProfileMutation.isPending}
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
