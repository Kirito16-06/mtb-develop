import createSlug from "@/lib/createSlug";
import { BlogPost } from "@/types/client/blog";
import Image from "next/image";
import Link from "next/link";


export default function BlogCard({
  id,
  title,
  excerpt,
  image,
  date,
  readTime,
}: BlogPost) {
  const slug = createSlug(title);
  return (
    <Link href={`/blog/${id}-${slug}`} className="block h-full">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="relative w-full aspect-[4/2]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-xl font-bold text-[#1E2875] mb-3 line-clamp-2">
            {title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
            <div className="flex items-center space-x-4">
              <span>{date}</span>
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
