"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  saveHeroMediaFile,
  deleteHeroMediaFile,
  HeroMediaValidationError,
} from "@/lib/hero-media-storage";
import type { Prisma } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return session.user;
}

function refresh() {
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export type UploadHeroMediaState = { error?: string };

export async function uploadHeroMediaAction(
  _prevState: UploadHeroMediaState,
  formData: FormData
): Promise<UploadHeroMediaState> {
  const admin = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  let saved: { url: string; type: "IMAGE" | "VIDEO" };
  try {
    saved = await saveHeroMediaFile(file);
  } catch (error) {
    if (error instanceof HeroMediaValidationError) return { error: error.message };
    throw error;
  }

  const maxSort = await prisma.heroMedia.aggregate({ _max: { sortOrder: true } });
  const created = await prisma.heroMedia.create({
    data: { type: saved.type, url: saved.url, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "CREATE",
      entity: "HeroMedia",
      entityId: created.id,
      after: created as unknown as Prisma.InputJsonValue,
    },
  });

  refresh();
  return {};
}

export async function deleteHeroMediaAction(id: string): Promise<void> {
  const admin = await requireAdmin();

  const media = await prisma.heroMedia.delete({ where: { id } });
  await deleteHeroMediaFile(media.url);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "DELETE",
      entity: "HeroMedia",
      entityId: id,
      before: media as unknown as Prisma.InputJsonValue,
    },
  });

  refresh();
}

export async function toggleHeroMediaAction(id: string, isActive: boolean): Promise<void> {
  const admin = await requireAdmin();

  const before = await prisma.heroMedia.findUniqueOrThrow({ where: { id } });
  const after = await prisma.heroMedia.update({ where: { id }, data: { isActive } });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "UPDATE",
      entity: "HeroMedia",
      entityId: id,
      before: before as unknown as Prisma.InputJsonValue,
      after: after as unknown as Prisma.InputJsonValue,
    },
  });

  refresh();
}

export async function reorderHeroMediaAction(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();

  const items = await prisma.heroMedia.findMany({ orderBy: { sortOrder: "asc" } });
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const a = items[index]!;
  const b = items[swapIndex]!;

  await prisma.$transaction([
    prisma.heroMedia.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.heroMedia.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  refresh();
}
