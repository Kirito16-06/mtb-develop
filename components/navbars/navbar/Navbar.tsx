"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import NavLink from "./NavLink";
import { Button } from "../../ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2 relative">
          <Image
            src="/icon-logo-mtb.png"
            alt="MyThriveBuddy"
            width={50}
            height={50}
            className="object-contain"
          />
          <span className="font-semibold md:text-[22px]  text-black">
            MyThriveBuddy.com
          </span>
          <span className="md:text-[10px] absolute right-0 -top-3 text-[7px] font-medium px-1.5 sm:px-2 py-0.5 bg-black text-white rounded">
            BETA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
          {session && <NavLink href="/dashboard">Dashboard</NavLink>}
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/contact">Contact Us</NavLink>
          <NavLink href="/about-us">About Us</NavLink>
          <div className="flex items-center space-x-3">
            {session ? (
              <Button
                onClick={() => signOut()}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0A0B1C] text-white rounded-full text-[14px] sm:text-[15px] font-medium hover:bg-[#0A0B1C]/90 transition-colors"
              >
                Sign Out
              </Button>
            ) : (
              <>
                <NavLink href="/signup">
                  <Button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#1E2875] text-white rounded-full text-[14px] sm:text-[15px] font-medium hover:bg-[#1E2875]/90 transition-colors">
                    Sign Up
                  </Button>
                </NavLink>
                <NavLink href="/signin">
                  <Button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0A0B1C] text-white rounded-full text-[14px] sm:text-[15px] font-medium hover:bg-[#0A0B1C]/90 transition-colors">
                    Sign In
                  </Button>
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white mt-2 p-4 rounded-lg shadow-lg md:hidden z-50">
          <div className="flex flex-col space-y-4">
            {session && <NavLink href="/dashboard">Dashboard</NavLink>}
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contact">Contact Us</NavLink>
            <NavLink href="/about-us">About Us</NavLink>
            {session ? (
              <Button
                onClick={() => signOut()}
                className="w-full text-center px-6 py-2.5 bg-red-600 text-white rounded-full text-[15px] font-medium hover:bg-red-700 transition-colors"
              >
                Sign Out
              </Button>
            ) : (
              <>
                <NavLink href="/signup">
                  <Button className="w-full text-center px-6 py-2.5 bg-[#1E2875] text-white rounded-full text-[15px] font-medium hover:bg-[#1E2875]/90 transition-colors">
                    Sign Up
                  </Button>
                </NavLink>
                <NavLink href="/signin">
                  <Button className="w-full text-center px-6 py-2.5 bg-[#0A0B1C] text-white rounded-full text-[15px] font-medium hover:bg-[#0A0B1C]/90 transition-colors">
                    Sign In
                  </Button>
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
