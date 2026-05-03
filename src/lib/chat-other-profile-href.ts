import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Link către pagina publică de firmă, dacă utilizatorul e business verificat. */
export async function getChatOtherProfileHref(otherUserId: string): Promise<string | null> {
  const row = (await prisma.user.findFirst({
    where: {
      id: otherUserId,
      accountType: "business",
      businessStatus: "approved",
    } as unknown as Prisma.UserWhereInput,
    select: { id: true } as unknown as Prisma.UserSelect,
  })) as { id: string } | null;
  return row ? `/firm/${row.id}` : null;
}
