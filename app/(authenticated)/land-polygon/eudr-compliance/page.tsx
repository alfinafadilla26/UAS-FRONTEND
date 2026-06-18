"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

const MapPreview = dynamic(
  () => import("@/components/map/MapPreview"),
  {
    ssr: false,
  }
);

export default function EudrCompliancePage() {
  const params = useSearchParams();
  const landId = params.get("id");

  const [land, setLand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState("Belum Dicek");

  useEffect(() => {
    async function fetchLand() {
      if (!landId) return;

      try {
        const token = localStorage.getItem("access_token") || "";

        const res = await fetch(`/api/proxy/land/${landId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await res.json();

        setLand(result.data);

        if (result.data?.eudr_status) {
          setStatus(result.data.eudr_status);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLand();
  }, [landId]);

  // Simulasi pengecekan EUDR (sementara karena backend belum ada)
  const handleCheck = async () => {
    setChecking(true);
    setStatus("Checking");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (
      land?.polygon_path &&
      land?.latitude &&
      land?.longitude
    ) {
      setStatus("Verified");
    } else {
      setStatus("Non-Compliant");
    }

    setChecking(false);
  };

  const getStatusColor = () => {
  switch (status) {
    case "Verified":
      return {
        bg: "#dcfce7",
        color: "#166534",
      };

    case "Checking":
      return {
        bg: "#fef3c7",
        color: "#92400e",
      };

    default:
      return {
        bg: "#fee2e2",
        color: "#991b1b",
      };
  }
};

const statusColor = getStatusColor();

const complianceScore = land?.polygon_path ? 50 : 25;

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        Memuat data lahan...
      </div>
    );
  }

  return (
    <div
      style={{
  width: "100%",
  padding: "20px",
}}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#065f46",
        }}
      >
        🇪🇺 EUDR Compliance Checker
      </h1>

      <p
        style={{
          color: "#64748b",
          marginTop: 8,
        }}
      >
        Pemeriksaan kepatuhan European Union Deforestation Regulation
      </p>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 18,
    marginTop: 30,
    marginBottom: 30,
  }}
>
  {/* Status */}
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      border: "1px solid #e5e7eb",
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: "#64748b",
      }}
    >
      Status
    </div>

    <div
      style={{
        marginTop: 8,
        fontSize: 22,
        fontWeight: 700,
        color:
          status === "Verified"
            ? "#16a34a"
            : "#dc2626",
      }}
    >
      {status}
    </div>
  </div>

  {/* Polygon */}
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      border: "1px solid #e5e7eb",
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: "#64748b",
      }}
    >
      Polygon
    </div>

    <div
      style={{
        marginTop: 8,
        fontSize: 22,
        fontWeight: 700,
      }}
    >
      {land?.polygon_path ? "✅ Ya" : "❌ Tidak"}
    </div>
  </div>

  {/* Coordinate */}
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      border: "1px solid #e5e7eb",
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: "#64748b",
      }}
    >
      Coordinate
    </div>

    <div
      style={{
        marginTop: 8,
        fontSize: 22,
        fontWeight: 700,
      }}
    >
      {land?.latitude && land?.longitude ? "✅ Complete" : "❌ Missing"}
    </div>
  </div>

  {/* Risk */}
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      border: "1px solid #e5e7eb",
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: "#64748b",
      }}
    >
      Risk Level
    </div>

    <div
      style={{
        marginTop: 8,
        fontSize: 22,
        fontWeight: 700,
        color: "#f59e0b",
      }}
    >
      Pending
    </div>
  </div>
</div>

      <div
        style={{
          marginTop: 30,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h3 style={{ marginBottom: 20 }}>
          Informasi Lahan
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr",
            rowGap: 12,
          }}
        >
          <b>Nama Lahan</b>
          <span>{land?.land_name ?? "-"}</span>

          <b>Komoditas</b>
          <span>{land?.commodity_name ?? "-"}</span>

          <b>Luas</b>
          <span>{land?.total_area_hectares ?? "-"} Ha</span>

          <b>Latitude</b>
          <span>{land?.latitude ?? "-"}</span>

          <b>Longitude</b>
          <span>{land?.longitude ?? "-"}</span>

          <b>Status Polygon</b>
          <span>
            {land?.polygon_path ? (
              <span
                style={{
                  color: "#16a34a",
                  fontWeight: 700,
                }}
              >
                ✅ Sudah Ada
              </span>
            ) : (
              <span
                style={{
                  color: "#dc2626",
                  fontWeight: 700,
                }}
              >
                ❌ Belum Ada
              </span>
            )}
          </span>
        </div>

        <hr style={{ margin: "30px 0" }} />

        <div
  style={{
    marginBottom: 30,
  }}
>
  <h3
    style={{
      marginBottom: 16,
    }}
  >
    Lokasi Lahan
  </h3>

  <div
    style={{
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid #e5e7eb",
    }}
  >
    <MapPreview landId={landId!} />
  </div>
</div>

        <h3
  style={{
    marginBottom: 20,
  }}
>
  Status EUDR
</h3>

<span
  style={{
    padding: "10px 18px",
    borderRadius: 30,
    fontWeight: 700,
    background: statusColor.bg,
    color: statusColor.color,
    display: "inline-block",
    marginBottom: 30,
  }}
>
  {status}
</span>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 25,
  }}
>
  {/* Compliance Score */}
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 20,
      background: "#f8fafc",
    }}
  >
    <h3
      style={{
        marginBottom: 20,
      }}
    >
      Compliance Score
    </h3>

    <div
      style={{
        width: "100%",
        height: 14,
        background: "#e5e7eb",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${complianceScore}%`,
          height: "100%",
          background: "#16a34a",
        }}
      />
    </div>

    <div
      style={{
        marginTop: 12,
        fontWeight: 700,
        color: "#166534",
      }}
    >
      {complianceScore}% Complete
    </div>
  </div>

  {/* Checklist */}
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 20,
      background: "#f8fafc",
    }}
  >
    <h3
      style={{
        marginBottom: 20,
      }}
    >
      Compliance Checklist
    </h3>

    <div style={{ lineHeight: 2.2 }}>

      <div>
        {land?.polygon_path ? "✅" : "❌"} Polygon tersedia
      </div>

      <div>
        {land?.latitude && land?.longitude ? "✅" : "❌"} Koordinat lengkap
      </div>

      <div>
        ⏳ Forest Loss Analysis
      </div>

      <div>
        ⏳ Risk Assessment
      </div>

      <div>
        ⏳ Deforestation Validation
      </div>

    </div>
  </div>
</div>

<div
  style={{
    marginTop: 25,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    background: "#fffbeb",
  }}
>
  <h3
    style={{
      marginBottom: 15,
      color: "#92400e",
    }}
  >
    Recommendation
  </h3>

  <ul
    style={{
      lineHeight: 2,
      paddingLeft: 20,
    }}
  >
    {!land?.polygon_path && (
      <li>Tambahkan polygon lahan terlebih dahulu.</li>
    )}

    {!land?.latitude && (
      <li>Lengkapi koordinat latitude.</li>
    )}

    {!land?.longitude && (
      <li>Lengkapi koordinat longitude.</li>
    )}

    <li>
      Jalankan pemeriksaan EUDR setelah seluruh data lengkap.
    </li>
  </ul>
</div>

        <div
          style={{
            marginTop: 30,
          }}
        >
          <button
            onClick={handleCheck}
            disabled={checking}
            style={{
              background: "#16a34a",
              color: "#fff",
              padding: "12px 28px",
              border: "none",
              borderRadius: 8,
              cursor: checking
                ? "not-allowed"
                : "pointer",
              opacity: checking ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {checking
              ? "Checking..."
              : "Check Compliance"}
          </button>
        </div>
      </div>
    </div>
  );
}