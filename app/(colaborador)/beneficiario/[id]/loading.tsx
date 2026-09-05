import { SkeletonCatalogo } from "@/components/estado/skeletons";

export default function Loading() {
  return (
    <div className="min-h-dvh">
      <div className="h-[49px] border-b" />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mx-auto mb-6 h-8 max-w-md animate-pulse rounded bg-secondary" />
        <div className="mb-4 h-7 w-1/2 animate-pulse rounded bg-secondary" />
        <SkeletonCatalogo />
      </main>
    </div>
  );
}
