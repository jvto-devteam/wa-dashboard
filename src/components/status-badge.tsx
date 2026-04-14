"use client";

import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/wa-client";

interface StatusBadgeProps {
  status: ConnectionStatus;
  className?: string;
  showLabel?: boolean;
}

const statusConfig: Record<
  ConnectionStatus,
  { label: string; dot: string; text: string }
> = {
  connected: {
    label: "Connected",
    dot: "bg-[#25d366]",
    text: "text-[#25d366]",
  },
  connecting: {
    label: "Connecting...",
    dot: "bg-yellow-500 animate-pulse",
    text: "text-yellow-600",
  },
  disconnected: {
    label: "Disconnected",
    dot: "bg-red-500",
    text: "text-red-500",
  },
};

export function StatusBadge({
  status,
  className,
  showLabel = true,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", config.dot)} />
      {showLabel && (
        <span className={cn("text-sm font-medium", config.text)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
