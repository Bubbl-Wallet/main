"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const ChatSkeleton = () => {
  return (
    <div className="flex flex-col w-full max-w-lg mx-auto h-screen">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8" />

            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />

          <div className="flex-1">
            <Skeleton className="h-16 w-3/4 rounded-lg" />
            <Skeleton className="h-3 w-12 mt-1" />
          </div>
        </div>

        <div className="flex gap-3 flex-row-reverse">
          <Skeleton className="w-8 h-8 rounded-full" />

          <div className="flex-1 text-right">
            <Skeleton className="h-10 w-1/2 rounded-lg ml-auto" />
            <Skeleton className="h-3 w-8 mt-1 ml-auto" />
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="h-10 w-10" />
        </div>

        <Skeleton className="h-3 w-64 mt-2" />
      </div>
    </div>
  );
};
