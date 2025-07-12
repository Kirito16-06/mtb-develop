
import { Metadata } from "next";
import { Suspense } from 'react'
import AppLayout from "@/components/layout/AppLayout";
import PageLoader from "@/components/PageLoader";


import AboutUsPage from '@/components/about-us/About-us';


export const metadata: Metadata = {
  title: "Sign Up - MyThriveBuddy",
  description: "Create your MyThriveBuddy account",
};

const AboutUs = () => {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <AboutUsPage />
      </Suspense>
     </AppLayout>
  );
};

export default AboutUs;
