"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  User,
  Shield,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  newTab?: boolean;
}

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Calendar },
    { name: "Patients", href: "/patients", icon: Users },
    ...((session?.user as { role: string } | undefined)?.role === "ADMIN"
      ? [
          {
            name: "Audit Logs",
            href: "/audit-logs",
            icon: Shield,
            newTab: true,
          },
        ]
      : []),
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white/98 backdrop-blur-md shadow-xl border-b border-gray-200/60 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-100 group-hover:scale-102 transition-all duration-200">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-800 transition-all duration-200">
                  SurgeryManager
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noopener noreferrer" : undefined}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      active
                        ? "text-blue-700 bg-blue-50 shadow-sm"
                        : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/60"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-105 ${
                        active
                          ? "text-blue-700"
                          : "text-gray-500 group-hover:text-blue-600"
                      }`}
                    />
                    {item.name}
                    {item.newTab && (
                      <svg
                        className="w-3 h-3 ml-1 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                    {active && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-blue-100 group-hover:scale-102 transition-all duration-200">
                  <span className="text-sm font-semibold text-white">
                    {(session?.user as { name: string } | undefined)?.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {(session?.user as { name: string } | undefined)?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {(
                      session?.user as { role: string } | undefined
                    )?.role?.toLowerCase()}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/60 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {(session?.user as { name: string } | undefined)?.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {
                            (session?.user as { name: string } | undefined)
                              ?.name
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {
                            (session?.user as { email: string } | undefined)
                              ?.email
                          }
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                          {(
                            session?.user as { role: string } | undefined
                          )?.role?.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Profile Settings
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Preferences
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {(session?.user as { name: string } | undefined)?.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200/60">
          <div className="px-4 pt-4 pb-3 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  target={item.newTab ? "_blank" : undefined}
                  rel={item.newTab ? "noopener noreferrer" : undefined}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? "text-blue-700 bg-blue-50 shadow-sm"
                      : "text-gray-700 hover:text-blue-700 hover:bg-blue-50/60"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 ${
                      active ? "text-blue-700" : "text-gray-500"
                    }`}
                  />
                  {item.name}
                  {item.newTab && (
                    <svg
                      className="w-4 h-4 ml-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  )}
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-200/60 px-4 py-4">
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50/80 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-white">
                  {(session?.user as { name: string } | undefined)?.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-base font-medium text-gray-900">
                  {(session?.user as { name: string } | undefined)?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {(session?.user as { email: string } | undefined)?.email}
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                  {(
                    session?.user as { role: string } | undefined
                  )?.role?.toLowerCase()}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                Profile Settings
              </button>
              <button className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <Settings className="w-5 h-5 mr-3 text-gray-400" />
                Preferences
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
