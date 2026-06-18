"use client";

import { useRouter } from "next/navigation";
import LandBaseTable from "@/components/land/LandBaseTable";

export default function LandPolygonPage() {
  const router = useRouter();

  // Custom Action Buttons untuk halaman Polygon
  const renderPolygonActions = (item: any) => {
    // Sesuaikan pengecekan dengan nama field dari API Yii2 Anda ('polygon_path')
    const hasPolygon = item.polygon_path && item.polygon_path !== "" && item.polygon_path !== "[]";

    return (
      <>
        <button
          onClick={() => router.push(`/land-polygon/manage-polygon?id=${item.id}`)} // <-- DIUBAH KE SINI
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "6px 10px",
            borderRadius: 6,
            border: hasPolygon ? "1px solid #ddd6fe" : "1px solid #bbf7d0",
            background: hasPolygon ? "#f5f3ff" : "#f0fdf4",
            color: hasPolygon ? "#7c3aed" : "#16a34a",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {hasPolygon ? "✏️ Edit Polygon" : "➕ Add Polygon"}
        </button>

        <button
          onClick={() => router.push(`/land-polygon/manage-polygon?id=${item.id}`)} // <-- Diarahkan ke halaman yang sama karena Leaflet Draw bisa langsung me-load & menampilkan polygon lama
          disabled={!hasPolygon}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: hasPolygon ? "#fff" : "#f1f5f9",
            color: hasPolygon ? "#374151" : "#94a3b8",
            fontSize: 12,
            cursor: hasPolygon ? "pointer" : "not-allowed",
            fontWeight: 500,
          }}
          title={hasPolygon ? "Lihat Map" : "Polygon belum dibuat"}
        >
          👁️ View Map
        </button>
      </>
    );
  };

  // Kolom status kustom tambahan untuk versi tabel
  const renderPolygonHeader = () => (
    <th style={{ padding: "13px 14px", textAlign: "left", color: "#a7f3d0", textTransform: "uppercase", fontSize: 11 }}>Status Spasial</th>
  );

  const renderPolygonRow = (item: any) => {
    // Samakan pengecekan kondisi agar indikator badge akurat
    const hasPolygon = item.polygon_path && item.polygon_path !== "" && item.polygon_path !== "[]";
    return (
      <td style={{ padding: "12px 14px" }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: 12,
          background: hasPolygon ? "#e0f2fe" : "#fef2f2",
          color: hasPolygon ? "#0369a1" : "#991b1b"
        }}>
          {hasPolygon ? "✓ Terpetakan" : "✗ Belum Ada"}
        </span>
      </td>
    );
  };

  return (
    <LandBaseTable
      title="Pemetaan Geometris Polygon"
      subtitle="Manajemen spasial batas-batas poligon lahan pertanian satelit"
      icon="🗺️"
      apiUrl="/api/proxy/land" // Menggunakan API proxy yang sudah ada
      renderActions={renderPolygonActions}
      renderExtraColumnsHeader={renderPolygonHeader}
      renderExtraColumnsRow={renderPolygonRow}
    />
  );
}