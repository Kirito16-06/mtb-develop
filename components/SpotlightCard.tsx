import { useState } from "react";
import Image from "next/image";
import type { Project } from "../types/types";
import Skeleton from "./Skeleton";

interface SpotlightCardProps {
  project: Project;
  onClick: (projectId: string) => void;
}

const SpotlightCard = ({ project, onClick }: SpotlightCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(true);

  return (
    <div
      className="w-full px-4 md:px-6 lg:px-8 cursor-pointer"
      onClick={() => onClick(project.id)}
    >
      <div className="max-w-screen-xl mx-auto">
        <div
          className="bg-white rounded-lg shadow-md overflow-hidden 
          transform transition-transform hover:scale-[1.02]"
        >
          <div className="relative w-full pb-[56.25%]">
            {imageLoading && <Skeleton className="absolute inset-0" />}
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              onLoadingComplete={() => setImageLoading(false)}
            />
          </div>

          <div className="p-4 md:p-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="text-lg md:text-xl font-semibold line-clamp-2">
              {project.title}
            </h3>

            <p className="text-sm text-gray-600 line-clamp-3">
              {project.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="relative w-8 h-8">
                {avatarLoading && (
                  <Skeleton className="absolute inset-0 rounded-full" />
                )}
                <Image
                  src={project.author.avatar}
                  alt={project.author.name}
                  fill
                  className="rounded-full object-cover"
                  onLoadingComplete={() => setAvatarLoading(false)}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{project.author.name}</p>
                <p className="text-xs text-gray-500">{project.postedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightCard;
