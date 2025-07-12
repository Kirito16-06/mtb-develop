const CategoryTags = () => {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-start items-center">
          <button className="text-xs md:text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            All
          </button>
          <button className="text-xs md:text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            Web Development
          </button>
          <button className="text-xs md:text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            Mobile Apps
          </button>
          <button className="text-xs md:text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            Design
          </button>
          {/* Add more categories as needed */}
        </div>
      </div>
    </div>
  );
};

export default CategoryTags; 