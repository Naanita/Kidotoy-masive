import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/** Esqueletos de carga (misma forma que el contenido real, sin saltos). */

export function SkeletonBeneficiarios({ n = 3 }: { n?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: n }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-3 p-4">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-10 w-28 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonCatalogo({ n = 6 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
            <Skeleton className="mt-3 h-11 w-full rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonTabla({
  filas = 8,
  columnas = 5,
}: {
  filas?: number;
  columnas?: number;
}) {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex gap-4 border-b bg-muted/50 px-4 py-3">
        {Array.from({ length: columnas }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: filas }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b px-4 py-3 last:border-0">
          {Array.from({ length: columnas }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonMetricas({ n = 4 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-2 p-4">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-8 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
