import { toast } from "sonner";

export type AdminToastVariant = "success" | "error";

export function showAdminToast(
  message: string,
  variant: AdminToastVariant = "success",
) {
  if (variant === "error") {
    toast.error(message);
    return;
  }
  toast.success(message);
}
