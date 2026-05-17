import { RiImageLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

export function EntityImage({
  imageUrl,
  label,
  aspect = 16 / 9,
  className,
}: {
  imageUrl?: string | null;
  label: string;
  aspect?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-border bg-muted/50",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {imageUrl ? (
        <div
          className="size-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label={label}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <RiImageLine className="size-6 opacity-50" aria-hidden />
        </div>
      )}
    </div>
  );
}
