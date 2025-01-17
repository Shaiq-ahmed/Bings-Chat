import { User, Bell } from "lucide-react";

const SidebarSkeleton = () => {
  // Create an array for 8 skeleton items
  const skeletonChats = Array(8).fill(null);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 skeleton" />
            <span className="font-medium hidden lg:block skeleton w-20 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <div className="btn btn-ghost btn-sm relative skeleton h-8 w-8" />
            <div className="btn btn-ghost btn-sm relative skeleton h-8 w-8" />
          </div>
        </div>
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>

      {/* Chat list skeleton */}
      <div className="overflow-y-auto w-full py-3">
        {skeletonChats.map((_, idx) => (
          <div
            key={idx}
            className="w-full p-3 flex items-center gap-3 border-b border-gray-200"
          >
            {/* Avatar Skeleton */}
            <div className="relative">
              <div className="skeleton w-12 h-12 rounded-full" />
            </div>

            {/* Chat Info Skeleton */}
            <div className="text-left min-w-0 flex-1 hidden lg:block">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-24" />
            </div>

            {/* Timestamp Skeleton */}
            <div className="hidden lg:block text-sm text-zinc-400">
              <div className="skeleton h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarSkeleton;
