import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Check, HelpCircle, Minus } from "lucide-react";
import MaxWidthWrapper from "@/Components/MaxWidthWrapper";
import { buttonVariants } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

const pricingItems = [
  {
    plan: "Free",
    tagline: "For small side projects and trying things out.",
    quota: 10,
    features: [
      { text: "5 pages per PDF", positive: true },
      { text: "16MB file size limit", positive: true },
      { text: "Mobile-friendly interface", positive: true },
      { text: "Higher-quality responses", positive: false },
      { text: "Priority support", positive: false },
    ],
  },
  {
    plan: "Pro",
    tagline: "For larger projects with higher needs.",
    quota: 50,
    features: [
      { text: "25 pages per PDF", positive: true },
      { text: "64MB file size limit", positive: true },
      { text: "Mobile-friendly interface", positive: true },
      { text: "Higher-quality responses", positive: true },
      { text: "Priority support", positive: true },
    ],
  },
];

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
      <div className="mx-auto mb-10 sm:max-w-lg">
        <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
        <p className="mt-5 text-gray-600 sm:text-lg">
          Whether you&apos;re just trying out AI Doc or need more, we&apos;ve
          got a plan for you.
        </p>
      </div>

      <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {pricingItems.map(({ plan, tagline, quota, features }) => (
          <div
            key={plan}
            className={cn("relative rounded-2xl bg-white shadow-lg", {
              "border-2 border-blue-600 shadow-blue-200": plan === "Pro",
              "border border-gray-200": plan !== "Pro",
            })}
          >
            {plan === "Pro" && (
              <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                Coming soon
              </div>
            )}

            <div className="p-5">
              <h3 className="my-3 text-center font-display text-3xl font-bold">
                {plan}
              </h3>
              <p className="text-gray-500">{tagline}</p>
              <p className="my-5 font-display text-6xl font-semibold">
                {plan === "Pro" ? "$14" : "$0"}
              </p>
              <p className="text-gray-500">per month</p>
            </div>

            <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-1">
                <p>{quota} PDFs/mo included</p>
                <HelpCircle className="h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <ul className="my-10 space-y-5 px-8">
              {features.map(({ text, positive }) => (
                <li key={text} className="flex space-x-5">
                  <div className="flex-shrink-0">
                    {positive ? (
                      <Check className="h-6 w-6 text-blue-500" />
                    ) : (
                      <Minus className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <p
                    className={cn("text-gray-600", {
                      "text-gray-400": !positive,
                    })}
                  >
                    {text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-200" />
            <div className="p-5">
              <Link
                href={user ? "/dashboard" : "/api/auth/register"}
                className={buttonVariants({
                  className: "w-full",
                  variant: plan === "Pro" ? "default" : "secondary",
                })}
              >
                {user ? "Go to dashboard" : "Sign up"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
};

export default Page;
