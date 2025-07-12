import { useState } from "react";
import type { Category } from "../types/types";

interface CategoryTagsProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
}

const CategoryTags = ({ categories, onCategorySelect }: CategoryTagsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategorySelect(categoryId);
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-start items-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`text-xs md:text-sm px-3 py-1 rounded-full transition-colors
                ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTags;
