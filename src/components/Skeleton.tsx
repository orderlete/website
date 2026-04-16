'use client';

import { cn } from "@/lib/utils";

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%]", className)}
      style={{ animation: 'shimmerBg 1.5s ease-in-out infinite' }}
      {...props}
    />
  );
};

export const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100/60 flex flex-col h-full" style={{ boxShadow: '0 2px 16px -4px rgba(0,0,0,0.06)' }}>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3.5 w-4/5 rounded-full" />
        <Skeleton className="h-2.5 w-3/5 rounded-full" />
        <div className="flex justify-between items-center pt-3">
          <div className="space-y-1.5">
            <Skeleton className="h-2 w-8 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
