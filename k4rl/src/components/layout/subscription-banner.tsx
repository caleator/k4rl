"use client";

import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/context/auth";
import { BRANDS } from "@/lib/mock/brands";
import { cn } from "@/lib/utils";

export function SubscriptionBanner() {
  const { user } = useAuth();

  if (!user.brandId) return null;

  const brand = BRANDS.find((b) => b.id === user.brandId);
  if (!brand) return null;

  const { subscriptionStatus, subscriptionTier, trialEndsAt } = brand;

  if (subscriptionStatus === "active") return null;

  const daysLeft = trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const config = {
    trialling: {
      icon: Clock,
      message: daysLeft !== null
        ? `Your free trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Add a payment method to keep access.`
        : "Your free trial is active. Add a payment method to keep access.",
      action: "Add payment method",
      href: "/brand/billing",
      className: "bg-amber-50 text-amber-900 border-amber-200",
      iconClass: "text-amber-500",
    },
    "past-due": {
      icon: AlertTriangle,
      message: "Your last payment failed. Update your payment method to restore full access.",
      action: "Update payment method",
      href: "/brand/billing",
      className: "bg-red-50 text-red-900 border-red-200",
      iconClass: "text-red-500",
    },
    cancelled: {
      icon: XCircle,
      message: "Your subscription has been cancelled. Reactivate to create new products and DPPs.",
      action: "Reactivate",
      href: "/brand/billing",
      className: "bg-muted text-muted-foreground border-border",
      iconClass: "text-muted-foreground",
    },
  } as const;

  if (!(subscriptionStatus in config)) return null;

  const { icon: Icon, message, action, href, className, iconClass } =
    config[subscriptionStatus as keyof typeof config];

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b px-4 py-2.5 text-sm",
        className
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", iconClass)} />
      <span className="flex-1">{message}</span>
      <a
        href={href}
        className="shrink-0 font-medium underline underline-offset-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        {action}
      </a>
    </div>
  );
}
