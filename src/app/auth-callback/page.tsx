"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, isError } = useQuery({
    queryKey: ["auth-callback"],
    queryFn: async () => {
      const res = await fetch("/api/auth-callback");
      if (!res.ok) throw new Error("Session not ready");
      return (await res.json()) as { success: boolean };
    },
    retry: 3,
    retryDelay: 500,
  });

  useEffect(() => {
    if (data?.success) {
      router.push(origin ? `/${origin}` : "/dashboard");
    }
  }, [data, origin, router]);

  useEffect(() => {
    if (isError) {
      router.push("/");
    }
  }, [isError, router]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

// useSearchParams requires a Suspense boundary during prerendering.
const Page = () => (
  <Suspense>
    <AuthCallback />
  </Suspense>
);

export default Page;
