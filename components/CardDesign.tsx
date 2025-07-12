import Image from "next/image";

const Card = ({
  title,
  description,
  bgColor,
  icon,
}: {
  title: string;
  description: string;
  bgColor: string;
  icon: string;
}) => (
  <div
    className={`w-full max-w-md p-4 rounded-lg shadow-md ${bgColor} text-white flex flex-col items-center justify-center relative overflow-hidden`}
  >
    <div className="w-[72px] h-[72px] mb-2 absolute -top-5 -right-5">
      <Image src={icon} alt={title} width={72} height={72} />
    </div>
    <h3 className="text-[16px] text-start font-bold mt-5 w-full">{title}</h3>
    <p className="text-start text-[12px]">{description}</p>
  </div>
);

const    CardGrid = () => {
  const cards = [
    {
      title: "MagicBox",
      description: "Unlock Your Daily JoyPearl Surprise!",
      bgColor: "bg-purple-700",
      icon: "/magic-box.svg",
    },
    {
      title: "BuddyLens",
      description: "Ask, Reflect, and Grow with BuddyLens!",
      bgColor: "bg-indigo-700",
      icon: "/buddies.svg",
    },
    {
      title: "1% Start",
      description: "Kick Off Your Power Hours!",
      bgColor: "bg-red-700",
      icon: "/leader-speak.svg",
    },
    {
      title: "Spotlight",
      description: "Highlight Your Growth, Inspire Others!",
      bgColor: "bg-orange-700",
      icon: "/spotlight-new.svg",
    },
    {
      title: "1% Progress",
      description: "Build a Better You, 1% Every Day!",
      bgColor: "bg-pink-700",
      icon: "/bags.svg",
    },
    {
      title: "Miracle Log",
      description: "Your Space for Everyday Miracles!",
      bgColor: "bg-blue-700",
      icon: "/notebboks.svg",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            description={card.description}
            bgColor={card.bgColor}
            icon={card.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default CardGrid;
