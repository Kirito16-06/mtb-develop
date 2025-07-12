import { Metadata } from "next";
import Hero from "@/components/home/Hero";
import SpotlightCard from "@/components/home/SpotlightCard";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "MyThriveBuddy - Solopreneurship Made Amazing",
  description:
    "Solopreneurship doesn't have to be lonely. Join the ecosystem built to make your journey joyful, connected and wildly fulfilling.",
  openGraph: {
    title: "MyThriveBuddy - Solopreneurship Made Amazing",
    description:
      "Solopreneurship doesn't have to be lonely. Join the ecosystem built to make your journey joyful, connected and wildly fulfilling.",
    url: "https://mythrivebuddy.com",
    siteName: "MyThriveBuddy",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "MyThriveBuddy - Solopreneurship Made Amazing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyThriveBuddy - Solopreneurship Made Amazing",
    description:
      "Solopreneurship doesn't have to be lonely. Join the ecosystem built to make your journey joyful, connected and wildly fulfilling.",
    images: ["/logo.png"],
  },
};

// TODO: add current active spotlight get it with api
export default function Home() {
  console.log("Hello ")
  console.log("check")
  return (
    <>
      <AppLayout>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mt-6 sm:mt-8">
          <div className="flex flex-col justify-between">
            <Hero />
          </div>
          <div className="flex flex-col">
            <SpotlightCard />
          </div>
        </div>
      </AppLayout>
    </>
  );
}
