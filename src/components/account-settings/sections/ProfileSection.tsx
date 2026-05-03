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
  isVerified: boolean;
  listingsCount: number;
  sellerContact: SellerContactPrefs;
};

export function ProfileSection({ locale, user }: { locale: string; user: ProfileUser }) {
  return <SellerDetailsView locale={locale} user={user} sellerContact={user.sellerContact} />;
}
