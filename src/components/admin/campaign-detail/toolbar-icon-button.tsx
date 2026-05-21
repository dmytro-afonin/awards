"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ToolbarLabelMode = "always" | "xl" | "icon-only";

const actionAtXl = "size-9 xl:h-9 xl:w-auto xl:px-3" as const;
const iconAtXl = "size-8 xl:h-8 xl:w-auto xl:px-2.5" as const;

function labelContent(label: string, mode: ToolbarLabelMode) {
  if (mode === "icon-only") {
    return <span className="sr-only">{label}</span>;
  }
  if (mode === "always") {
    return <span>{label}</span>;
  }
  return (
    <>
      <span className="hidden xl:inline">{label}</span>
      <span className="sr-only xl:hidden">{label}</span>
    </>
  );
}

function toolbarButtonSize(
  labelMode: ToolbarLabelMode,
  size: React.ComponentProps<typeof Button>["size"],
) {
  if (labelMode === "always") {
    return "default";
  }
  if (labelMode === "icon-only") {
    return size ?? "icon-sm";
  }
  return size ?? "icon-sm";
}

function toolbarButtonClassName(labelMode: ToolbarLabelMode, icon = false) {
  if (labelMode === "xl") {
    return icon ? iconAtXl : actionAtXl;
  }
  if (labelMode === "icon-only") {
    return icon ? "size-8" : "size-9";
  }
  return undefined;
}

function ToolbarButtonWithTooltip({
  label,
  labelMode,
  button,
}: {
  label: string;
  labelMode: ToolbarLabelMode;
  button: React.ReactElement;
}) {
  if (labelMode === "always") {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent className={labelMode === "xl" ? "xl:hidden" : undefined}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function ToolbarIconButton({
  label,
  icon,
  onClick,
  disabled,
  className,
  render,
  labelMode = "xl",
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  render?: React.ReactElement;
  labelMode?: ToolbarLabelMode;
}) {
  const button = (
    <Button
      type={render ? undefined : "button"}
      variant="ghost"
      size={toolbarButtonSize(labelMode, "icon-sm")}
      className={cn(
        "shrink-0 gap-1.5",
        toolbarButtonClassName(labelMode, true),
        className,
      )}
      nativeButton={render ? false : undefined}
      disabled={disabled}
      onClick={onClick}
      render={render}
    >
      {icon}
      {labelContent(label, labelMode)}
    </Button>
  );

  return (
    <ToolbarButtonWithTooltip
      label={label}
      labelMode={labelMode}
      button={button}
    />
  );
}

export function ToolbarActionButton({
  label,
  icon,
  onClick,
  disabled,
  className,
  variant = "outline",
  size = "icon-sm",
  render,
  labelMode = "xl",
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  render?: React.ReactElement;
  labelMode?: ToolbarLabelMode;
}) {
  const button = (
    <Button
      type={render ? undefined : "button"}
      variant={variant}
      size={toolbarButtonSize(labelMode, size)}
      className={cn(
        "shrink-0 gap-1.5",
        toolbarButtonClassName(labelMode),
        className,
      )}
      nativeButton={render ? false : undefined}
      disabled={disabled}
      onClick={onClick}
      render={render}
    >
      {icon}
      {labelContent(label, labelMode)}
    </Button>
  );

  return (
    <ToolbarButtonWithTooltip
      label={label}
      labelMode={labelMode}
      button={button}
    />
  );
}

export function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />;
}
