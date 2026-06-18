"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const PolygonViewer = dynamic(
  () => import("@/components/map/PolygonViewer"),
  {
    ssr: false,
  }
);

function DetailContent() {
  const params = useSearchParams();
  const landId = params.get("id");

  if (!landId) {
    return <div style={{ padding: 30 }}>ID Lahan tidak ditemukan.</div>;
  }

  return <PolygonViewer landId={landId} />;
}

export default function DetailPolygonPage() {
  return (
    <Suspense fallback={<div style={{ padding: 30 }}>Loading...</div>}>
      <DetailContent />
    </Suspense>
  );
}