import SignInPageContent from "@/components/auth/SignInPageContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - MyThriveBuddy",
  description: "Sign in to your MyThriveBuddy account",
};

export default function SignInPage() {
  return <SignInPageContent />;
}
