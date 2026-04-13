"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import type { OauthAvailability } from "@/components/auth/types";

export type { OauthAvailability } from "@/components/auth/types";

type Props = {
  oauth?: OauthAvailability;
};

export function AuthForms({ oauth }: Props) {
  return <AuthCard oauth={oauth} />;
}
