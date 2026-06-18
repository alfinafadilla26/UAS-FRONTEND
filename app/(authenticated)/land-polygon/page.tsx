"use client";

import { useRouter } from "next/navigation";
import LandBaseTable from "@/components/land/LandBaseTable";

export default function LandPolygonPage() {
  const router = useRouter();

  // ── Action Buttons ──────────────────────────────────────────────────
  const renderPolygonActions = (item: any) => {
    // Membaca flag has_polygon dari API Yii2
    const hasPolygon = item.has_polygon === 1 || item.has_polygon === true || (item.polygon_path && item.polygon_path !== "[]");

    return (
      <div style={{ display: "flex", gap: "6px", width: "100%", flexWrap: "wrap" }}>
        
        {/* Tombol Add / Edit Polygon */}
        <button
          onClick={() => router.push(`/land-polygon/manage-polygon?id=${item.id}`)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 6,
            border: hasPolygon ? "1px solid #ddd6fe" : "1px solid #bbf7d0",
            background: hasPolygon ? "#f5f3ff" : "#f0fdf4",
            color: hasPolygon ? "#7c3aed" : "#16a34a",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap"
          }}
        >
          {hasPolygon ? "✏️ Edit Polygon" : "➕ Add Polygon"}
        </button>

        {/* Tombol Check EUDR (SEKARANG SELALU AKTIF) */}
        <button
          onClick={() => router.push(`/land-polygon/eudr-compliance?id=${item.id}`)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #fed7aa",
            background: "#fff7ed",
            color: "#ea580c",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap"
          }}
          title="Periksa Kepatuhan Regulasi EUDR Lahan Ini"
        >
          🇪🇺 Check EUDR
        </button>

        {/* Tombol View Polygon Link (DIUBAH: Teks menjadi 'View Polygon') */}
        <a
          href={`/land-polygon/detail?id=${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#334155",
            fontSize: 12,
            textDecoration: "none",
            fontWeight: 500,
            cursor: "pointer"
          }}
          title="Buka peta satelit polygon lahan di tab baru"
        >
          🔗 View Polygon
        </a>
      </div>
    );
  };

  // ── Custom Table Headers (Status Spasial & EUDR Compliance) ──────────
  const renderPolygonHeader = () => (
    <>
      <th style={{ padding: "13px 14px", textAlign: "left", color: "#a7f3d0", textTransform: "uppercase", fontSize: 11 }}>
        Status Spasial
      </th>
      <th style={{ padding: "13px 14px", textAlign: "left", color: "#a7f3d0", textTransform: "uppercase", fontSize: 11 }}>
        EUDR Compliance
      </th>
    </>
  );

  // ── Custom Table Rows (Data Status Spasial & EUDR Badge) ─────────────
  const renderPolygonRow = (item: any) => {
    const hasPolygon = item.has_polygon === 1 || item.has_polygon === true || (item.polygon_path && item.polygon_path !== "[]");
    
    // Sinkronisasi status EUDR berdasarkan ada tidaknya koordinat polygon
    const eudrStatus = item.eudr_status || "Non-Compliant";

    return (
      <>
        {/* Kolom Status Spasial */}
        <td style={{ padding: "12px 14px" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 12,
              background: hasPolygon ? "#dcfce7" : "#fee2e2",
color: hasPolygon ? "#166534" : "#991b1b",
              display: "inline-block",
              whiteSpace: "nowrap"
            }}
          >
            {hasPolygon ? "🟢 Sudah Ada" : "🔴 Belum Ada"}
          </span>
        </td>

        {/* Kolom EUDR Compliance */}
        <td style={{ padding: "12px 14px" }}>
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      padding: "4px 10px",
      borderRadius: 12,
      display: "inline-block",
      whiteSpace: "nowrap",
      background:
        eudrStatus === "Verified"
          ? "#dcfce7"
          : eudrStatus === "In Review"
          ? "#fef3c7"
          : "#fee2e2",
      color:
        eudrStatus === "Verified"
          ? "#166534"
          : eudrStatus === "In Review"
          ? "#92400e"
          : "#991b1b",
    }}
  >
    {eudrStatus === "Verified"
      ? "🟢 Verified"
      : eudrStatus === "In Review"
      ? "🟡 In Review"
      : "🔴 Non-Compliant"}
  </span>
</td>
      </>
    );
  };

  return (
    <LandBaseTable
      title="Pemetaan Geometris & EUDR Lahan"
      subtitle="Manajemen spasial batas poligon lahan pertanian satelit untuk kepatuhan regulasi EUDR"
      icon="🗺️"
      apiUrl="/api/proxy/land" 
      renderActions={renderPolygonActions}
      renderExtraColumnsHeader={renderPolygonHeader}
      renderExtraColumnsRow={renderPolygonRow}
    />
  );
}