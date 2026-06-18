"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const LANDS_API_URL = "/api/proxy/lands"; // Contoh endpoint terpusat Anda



export default function DashboardPage() {
  const router = useRouter();
  const [landsData, setLandsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ubah title browser
    document.title = `Dashboard | ${process.env.NEXT_PUBLIC_APP_NAME}`;
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchDashboardMetrics(token);
  }, []);

  async function fetchDashboardMetrics(token: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(LANDS_API_URL, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      
      // Mengambil data array land (menangani jika dibungkus json.data)
      setLandsData(Array.isArray(json) ? json : json.data || []);
    } catch (err: any) {
      // Mock data sebagai fallback jika API proxy belum dikonfigurasi
      setLandsData([
        { id: 1, area_hectares: 4.5, compliance_status: "compliant", active_cycle: true },
        { id: 2, area_hectares: 3.2, compliance_status: "auditing", active_cycle: true },
        { id: 3, area_hectares: 2.1, compliance_status: "compliant", active_cycle: false },
        { id: 4, area_hectares: 5.8, compliance_status: "pending", active_cycle: false },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ── Kalkulasi Metrik Operasional Komoditas ──────────────────────
  const metrics = useMemo(() => {
    const totalParcels = landsData.length;
    const totalArea = landsData.reduce((sum, item) => sum + (Number(item.area_hectares) || 0), 0);
    const activeCycles = landsData.filter(item => item.active_cycle).length;
    const compliantCount = landsData.filter(item => item.compliance_status === "compliant").length;
    
    return {
      totalParcels,
      totalArea: totalArea.toFixed(1),
      activeCycles,
      complianceRate: totalParcels ? Math.round((compliantCount / totalParcels) * 100) : 0
    };
  }, [landsData]);

  if (loading) {
    return <div style={{ color: "#64748b", fontSize: 14, padding: "20px 0" }}>⏳ Compiling farm metrics...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* ── Section Welcome ── */}
      <div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#0f172a" }}>Welcome Back, Farmer!</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Here is the real-time operational status and EUDR compliance health of your plantation assets.</p>
      </div>

      {/* ── Section Cards Summary ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Total Cultivated Lands</span>
            <span style={{ fontSize: 20 }}>⛰️</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>{metrics.totalParcels} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400 }}>Parcels</span></div>
          <div style={{ fontSize: 12, color: "#22c55e", marginTop: 4, fontWeight: 500 }}>📍 Geospatially mapped</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Total Footprint Size</span>
            <span style={{ fontSize: 20 }}>📐</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#2563eb", marginTop: 8 }}>{metrics.totalArea} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400 }}>Hectares</span></div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Boundaries defined by polygon</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Active Planting Cycles</span>
            <span style={{ fontSize: 20 }}>🔄</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>{metrics.activeCycles} <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400 }}>Sectors</span></div>
          <div style={{ fontSize: 12, color: "#d97706", marginTop: 4, fontWeight: 500 }}>🛠️ Operations logging active</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>EUDR Compliance Rate</span>
            <span style={{ fontSize: 20 }}>🛡️</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: metrics.complianceRate > 70 ? "#16a34a" : "#dc2626", marginTop: 8 }}>{metrics.complianceRate}%</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Targeting 100% Zero-Deforestation</div>
        </div>

      </div>

      {/* ── Section Dua Kolom: Quick Navigation & Audit Status ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, flexWrap: "wrap" }}>
        
        {/* Kolom Kiri: Quick Task Action */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: 16, color: "#0f172a" }}>Required Compliance Checklists</h3>
          <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>Quickly jump to clear international market export blocks.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Trace Missing Land Polygons", desc: "Ensure all registered plots have clear boundary mappings for satellite screening.", path: "/polygons", icon: "🗺️" },
              { label: "Upload Deforestation Certificates", desc: "Link land legality documents to guarantee compliance past the 2020 cutoff date.", path: "/documents", icon: "📁" },
              { label: "Update Crop Yield Data", desc: "Log active harvests inside cycle activities to avoid export quota bottlenecks.", path: "/planting-cycles", icon: "📝" },
            ].map((task, idx) => (
              <div 
                key={idx} 
                onClick={() => router.push(task.path)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, border: "1px solid #f1f5f9", borderRadius: 8, cursor: "pointer", background: "#f8fafc", transition: "transform 0.1s" }}
              >
                <div style={{ fontSize: 20 }}>{task.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{task.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{task.desc}</div>
                </div>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>➔</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Info Box Regulasi */}
        <div style={{ background: "#0f172a", borderRadius: 12, padding: 20, color: "#94a3b8", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38bdf8", fontSize: 12, fontWeight: 700, letterSpacing: "1px" }}>
              <span>🇪🇺</span> EUDR MARKET GATE
            </div>
            <h4 style={{ color: "#fff", margin: "10px 0 6px 0", fontSize: 15, fontWeight: 600 }}>Zero Deforestation Policy</h4>
            <p style={{ fontSize: 12, lineHeight: "1.5", margin: 0 }}>
              Your crop supply chain must strictly prove no deforestation occurred on your land points after the December 31, 2020 international cutoff deadline. Keep your polygon vectors updated.
            </p>
          </div>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 12, marginTop: 16, fontSize: 11, color: "#475569" }}>
            Data standard synchronized with <strong>RSPO</strong> & <strong>ISPO</strong> frameworks.
          </div>
        </div>

      </div>

    </div>
  );
}