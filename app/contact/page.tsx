import { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Contact Us - MyThriveBuddy",
  description: "Get in touch with the MyThriveBuddy team",
};

export default function ContactPage() {
  return (
    <>
      {/* 
    <main className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#F8F2FF] to-[#FF69B4] py-4 sm:py-6 md:py-8 px-4">
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-4 sm:p-6 md:p-8">
          <Navbar /> */}
      <AppLayout>
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#1E2875] mb-4">
              Contact Us
            </h1>
            <p className="text-gray-600">
              Have questions or feedback? We&apos;d love to hear from you. Send
              us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>
          <ContactForm />
        </div>
      </AppLayout>
      {/* </div>
      </div>
    </main> */}
    </>
  );
}
