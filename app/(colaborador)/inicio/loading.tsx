import { SkeletonBeneficiarios } from "@/components/estado/skeletons";

export default function Loading() {
  return (
    <div className="min-h-dvh">
      <div className="h-[57px] border-b" />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mx-auto mb-6 h-8 max-w-md animate-pulse rounded bg-secondary" />
        <div className="mb-4 h-7 w-2/3 animate-pulse rounded bg-secondary" />
        <SkeletonBeneficiarios />
      </main>
    </div>
  );
}
