const Hero = () => {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
          {/* Hero Content */}
          <div className="w-full md:w-1/2 space-y-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Welcome to Our Platform
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Discover amazing projects and connect with talented developers from around the world.
            </p>
            <button className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
          
          {/* Hero Image */}
          <div className="w-full md:w-1/2">
            <img 
              src="/hero-image.jpg" 
              alt="Hero" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 