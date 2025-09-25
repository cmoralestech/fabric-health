"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { MinimalFooter } from "@/components/layout/Footer";
import { loginSchema } from "@/lib/validations";
import Link from "next/link";

type LoginData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const fillCredentials = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
    setError(""); // Clear any previous errors
  };

  const onSubmit = async (data: LoginData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            SurgeryManager
          </h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Secure healthcare management system</p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sign In
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  error={errors.email?.message}
                />

                <div>
                  <PasswordInput
                    label="Password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    New to SurgeryManager?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-semibold border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    Create New Account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-amber-800 mb-1">
                Medical Disclaimer
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                This system is for healthcare management only and does not
                provide medical advice. Not for use in medical emergencies.
                Always consult qualified healthcare professionals for medical
                decisions.
              </p>
              <Link
                href="/compliance"
                className="text-xs text-amber-600 hover:text-amber-800 font-medium underline mt-1 inline-block"
              >
                View compliance information
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-blue-800 mb-4 text-center">
            📝 Demo Credentials for Testing:
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() =>
                fillCredentials("admin@hospital.com", "password123")
              }
              className="bg-white p-3 rounded border border-blue-200 flex justify-between items-center hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div>
                <div className="font-medium text-blue-900 text-sm">
                  Administrator
                </div>
                <div className="text-blue-700 text-xs">Full system access</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 font-mono">
                  admin@hospital.com
                </div>
                <div className="text-xs text-blue-600 font-mono">
                  password123
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                fillCredentials("surgeon@hospital.com", "password123")
              }
              className="bg-white p-3 rounded border border-blue-200 flex justify-between items-center hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div>
                <div className="font-medium text-blue-900 text-sm">Surgeon</div>
                <div className="text-blue-700 text-xs">
                  Medical professional
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 font-mono">
                  surgeon@hospital.com
                </div>
                <div className="text-xs text-blue-600 font-mono">
                  password123
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                fillCredentials("staff@hospital.com", "password123")
              }
              className="bg-white p-3 rounded border border-blue-200 flex justify-between items-center hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div>
                <div className="font-medium text-blue-900 text-sm">Staff</div>
                <div className="text-blue-700 text-xs">Healthcare support</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600 font-mono">
                  staff@hospital.com
                </div>
                <div className="text-xs text-blue-600 font-mono">
                  password123
                </div>
              </div>
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-4 text-center">
            💡 Click on any credential above to quickly test the system
          </p>
        </div>

        <MinimalFooter />
      </div>
    </div>
  );
}
