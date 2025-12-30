"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import Image from "next/image";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, keepLoggedIn }),
            });

            if (res.ok) {
                router.push("/dashboard");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Invalid credentials");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Side: Login Form */}
            <div className="flex w-full flex-col justify-center bg-white dark:bg-[#0B1120] px-8 lg:w-1/2 lg:px-24">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-10">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Go to ProPart Admin System
                        </h1>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-500">
                                {error}
                            </div>
                        )}

                        <div>
                            <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <InputField
                                type="email"
                                placeholder="email@propart.ae"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="dark:bg-[#151D2F] dark:border-gray-800"
                                required
                                autoComplete="none"
                            />
                        </div>

                        <div>
                            <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <InputField
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="dark:bg-[#151D2F] dark:border-gray-800"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? (
                                        <EyeIcon className="h-5 w-5 fill-current" />
                                    ) : (
                                        <EyeCloseIcon className="h-5 w-5 fill-current" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Checkbox
                                checked={keepLoggedIn}
                                onChange={setKeepLoggedIn}
                                id="keepLoggedIn"
                                label="Keep me logged in"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-brand-500 py-3 text-white transition-all hover:bg-brand-600 shadow-lg shadow-brand-500/20"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
                <Image
                    src="https://images.pexels.com/photos/2405648/pexels-photo-2405648.jpeg"
                    alt="Dubai Aerial View"
                    fill
                    className="object-cover opacity-80"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20"></div>
            </div>
        </div>
    );
}
