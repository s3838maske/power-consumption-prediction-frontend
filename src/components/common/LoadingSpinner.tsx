import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = "default", text }: { size?: "sm" | "default" | "lg"; text?: string }) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <Loader2 className={`${sizeClass} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
