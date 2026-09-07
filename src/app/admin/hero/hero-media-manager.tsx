"use client";

import { useActionState, useRef } from "react";
import type { HeroMedia } from "@prisma/client";
import { ArrowDown, ArrowUp, ImageIcon, Trash2, Video } from "lucide-react";

import {
  uploadHeroMediaAction,
  deleteHeroMediaAction,
  toggleHeroMediaAction,
  reorderHeroMediaAction,
  type UploadHeroMediaState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlowCard } from "@/components/party/glow-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const initialUploadState: UploadHeroMediaState = {};

export function HeroMediaManager({ items }: { items: HeroMedia[] }) {
  const [state, formAction, isPending] = useActionState(uploadHeroMediaAction, initialUploadState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-6">
      <GlowCard className="p-6">
        <h2 className="mb-3 font-heading text-lg font-semibold">Upload media</h2>
        <form
          ref={formRef}
          action={async (formData) => {
            await formAction(formData);
            formRef.current?.reset();
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            required
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-glow/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-glow hover:file:bg-glow/20"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="shrink-0 bg-primary text-primary-foreground"
          >
            {isPending ? "Uploading…" : "Upload"}
          </Button>
        </form>
        {state.error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          JPEG, PNG or WebP up to 10MB. MP4 or WebM up to 60MB.
        </p>
      </GlowCard>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No media yet — the home page hero is showing the default light effect.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <HeroMediaRow
              key={item.id}
              item={item}
              isFirst={index === 0}
              isLast={index === items.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HeroMediaRow({
  item,
  isFirst,
  isLast,
}: {
  item: HeroMedia;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <GlowCard className="flex items-center gap-4 p-4">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white/5">
        {item.type === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element -- served via route handler, not a public/ path next/image can optimize
          <img src={item.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <video src={item.url} className="h-full w-full object-cover" muted />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.type === "IMAGE" ? (
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Video className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="truncate text-sm text-muted-foreground">
            {item.url.split("/").pop()}
          </span>
        </div>
        <form action={toggleHeroMediaAction.bind(null, item.id, !item.isActive)} className="mt-1">
          <button type="submit">
            <Badge
              variant={item.isActive ? "default" : "secondary"}
              className={item.isActive ? "cursor-pointer bg-verified text-white" : "cursor-pointer"}
            >
              {item.isActive ? "Active" : "Inactive"}
            </Badge>
          </button>
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <form action={reorderHeroMediaAction.bind(null, item.id, "up")}>
          <Button type="submit" variant="ghost" size="icon-sm" disabled={isFirst} aria-label="Move up">
            <ArrowUp className="h-4 w-4" />
          </Button>
        </form>
        <form action={reorderHeroMediaAction.bind(null, item.id, "down")}>
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            aria-label="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </form>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10"
                aria-label="Delete"
              />
            }
          >
            <Trash2 className="h-4 w-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this media?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes it from the home page hero immediately and can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={deleteHeroMediaAction.bind(null, item.id)}>
                <AlertDialogAction
                  type="submit"
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </GlowCard>
  );
}
