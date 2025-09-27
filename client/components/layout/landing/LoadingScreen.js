import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col py-8 items-center">
      <div className="flex-1">
        <div className="flex flex-col items-center h-full gap-y-8 px-8">
          <div className="flex-1 flex flex-col items-center justify-center opacity-50">
            <Loader2 className="animate-spin h-20 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
