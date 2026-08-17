import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message = "Loading...", fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 space-y-4 text-gray-500">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="font-medium animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 text-gray-500 w-full h-full">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
