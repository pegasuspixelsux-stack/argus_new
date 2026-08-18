"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import type { PropertyPhoto } from "@/types/property";
import { cn } from "@/lib/utils";

export function PhotoGallery({ photos, title }: { photos: PropertyPhoto[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
        <Building2 className="size-10" />
      </div>
    );
  }

  const active = photos[Math.min(activeIndex, photos.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active.url} alt={title} className="size-full object-cover" />
      </div>
      {photos.length > 1 ? (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {photos.map((photo, index) => (
            <button
              key={photo.path}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "aspect-square overflow-hidden rounded-md border-2 transition-colors",
                index === activeIndex ? "border-primary" : "border-transparent"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
