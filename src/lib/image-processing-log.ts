export type ImageProcessingPhase =
  | "pipeline-selected"
  | "encode-benchmark"
  | "client-crop-export"
  | "save-complete"
  | "server-encode-race";

export type ImageProcessingLogDetails = Record<string, unknown>;

function isDevLoggingEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Dev-only structured logs; in the browser also POSTs to the Next dev terminal. */
export function logImageProcessing(
  phase: ImageProcessingPhase,
  details: ImageProcessingLogDetails,
): void {
  if (!isDevLoggingEnabled()) {
    return;
  }

  const payload = {
    phase,
    at: new Date().toISOString(),
    details,
  };

  if (typeof window !== "undefined") {
    console.info(`[image] ${phase}`, details);
    void fetch("/api/dev/image-processing-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* Terminal logging is best-effort */
    });
    return;
  }

  console.info(`[image] ${phase}`, details);
}
