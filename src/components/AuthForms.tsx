"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import type { OauthAvailability } from "@/components/auth/types";

export type { OauthAvailability } from "@/components/auth/types";

type Props = {
  oauth?: OauthAvailability;
  /** Din `/api/auth/callback` redirect: `?error=oauth_callback` etc. */
  callbackError?: string;
  callbackUrl?: string;
};

export function AuthForms({ oauth, callbackError, callbackUrl }: Props) {
  return <AuthCard oauth={oauth} callbackError={callbackError} callbackUrl={callbackUrl} />;
}
