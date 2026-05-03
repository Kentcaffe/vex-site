import { SellerDetailsView } from "@/components/account-settings/seller/SellerDetailsView";
import type { SellerContactPrefs } from "@/lib/seller-contact-preferences";

export type ProfileUser = {
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  listingsCount: number;
  sellerContact: SellerContactPrefs;
};

export function ProfileSection({
  locale,
  user,
  publicProfileUrl,
}: {
  locale: string;
  user: ProfileUser;
  publicProfileUrl: string;
}) {
  return (
    <SellerDetailsView
      locale={locale}
      user={user}
      sellerContact={user.sellerContact}
      publicProfileUrl={publicProfileUrl}
    />
  );
}
