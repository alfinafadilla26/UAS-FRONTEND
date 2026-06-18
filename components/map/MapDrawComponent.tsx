"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  FeatureGroup,
  Marker,
  Popup,
  Polygon,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

// Import CSS Leaflet agar peta tidak berantakan
import "leaflet/dist/leaflet.css";

// Bersihkan konfigurasi icon default Leaflet murni agar tidak bentrok dengan SSR Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface MapDrawComponentProps {
  landId: string | null;
  token: string;
}

export default function MapDrawComponent({ landId, token }: MapDrawComponentProps) {
  const [landData, setLandData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [polygonCoords, setPolygonCoords] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-2.5489, 118.0149]); // Default Indonesia
  const [zoom, setZoom] = useState<number>(5);

  const featureGroupRef = useRef<any>(null);

  // 1. Load Data Lahan dari API Yii2 menggunakan rute REST standar proxy lokal
  useEffect(() => {
    async function fetchLand() {
      if (!landId) return;

      try {
        const targetUrl = `/api/proxy/land/${landId}`;
        console.log("Menembak via Proxy ke:", targetUrl);

        const res = await fetch(targetUrl, {
          method: "GET",
          headers: {
            "Authorization": token.startsWith("Bearer") ? token : `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        const actualData = result.data ? result.data : result;

        if (actualData) {
          setLandData(actualData);

          if (actualData.latitude && actualData.longitude) {
            setMapCenter([parseFloat(actualData.latitude), parseFloat(actualData.longitude)]);
            setZoom(16);
          }

          if (actualData.polygon_path) {
            const coords =
              typeof actualData.polygon_path === "string"
                ? JSON.parse(actualData.polygon_path)
                : actualData.polygon_path;
            setPolygonCoords(coords);
          }
        }
      } catch (err) {
        console.error("Detail Error Fetch Lahan:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLand();
  }, [landId, token]);

  // 2. Event saat selesai menggambar polygon baru
  const _onCreated = (e: any) => {
    const layer = e.layer;
    const latLngs = layer.getLatLngs()[0];
    const formattedCoords = latLngs.map((point: any) => [point.lat, point.lng]);
    setPolygonCoords(formattedCoords);
  };

  // 3. Event saat mengedit polygon yang ada
  const _onEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      const latLngs = layer.getLatLngs()[0];
      const formattedCoords = latLngs.map((point: any) => [point.lat, point.lng]);
      setPolygonCoords(formattedCoords);
    });
  };

  // 4. Event saat polygon dihapus
  const _onDeleted = () => {
    setPolygonCoords(null);
  };

  // 5. Nembak ke API update-polygon dengan format URL REST murni (/update-polygon/id)
  const handleSave = async () => {
    if (!polygonCoords || polygonCoords.length === 0) {
      alert("Silakan gambar polygon terlebih dahulu!");
      return;
    }

    try {
      const formBody = new URLSearchParams();
      formBody.append("polygon_path", JSON.stringify(polygonCoords));

      // DIUBAH: Mengikuti parameter argumen actionUpdatePolygon($id) di Yii2 Anda
      const targetUrl = `/api/proxy/land/update-polygon/${landId}`;

      const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Authorization": token.startsWith("Bearer") ? token : `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      if (result.status === true || result.success === true) {
        alert("Berhasil menyimpan data polygon lahan!");
      } else {
        alert("Gagal menyimpan: " + (result.msg || result.message || "Terjadi kesalahan backend"));
      }
    } catch (err) {
      console.error("Error saving polygon:", err);
      alert("Terjadi kesalahan sistem atau rute proxy terputus (404/500).");
    }
  };

  if (loading) return <p style={{ padding: 20, textTransform: "uppercase", fontSize: 13, color: "#64748b" }}>Memuat Konten Peta...</p>;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* CSS injection via CDN untuk mengatasi kegagalan module bundler Leaflet Draw */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"
      />

      <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: 0, color: "#1e293b" }}>
        Kelola Polygon Lahan: {landData?.land_name || "Lahan"}
      </h1>

      <div style={{ height: "500px", width: "100%", position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          
          {/* DIUBAH: Menggunakan Server Citra Satelit Hybrid murni dari Google Maps */}
          <LayersControl position="topright">

  <LayersControl.BaseLayer checked name="Google Satellite">
    <TileLayer
      attribution="&copy; Google Maps"
      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      maxZoom={20}
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="OpenStreetMap">
    <TileLayer
      attribution="&copy; OpenStreetMap"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Deforestation">
    <TileLayer
      attribution="Google Earth Engine"
      url="https://tiles.globalforestwatch.org/umd_tree_cover_loss/latest/dynamic/{z}/{x}/{y}.png"
    />
  </LayersControl.BaseLayer>

</LayersControl>

          {/* Marker Utama Lahan */}
          {landData?.latitude && landData?.longitude && (
            <Marker position={[parseFloat(landData.latitude), parseFloat(landData.longitude)]}>
              <Popup>Titik Pusat Lahan</Popup>
            </Marker>
          )}

          {/* Fitur Draw */}
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topleft"
              onCreated={_onCreated}
              onEdited={_onEdited}
              onDeleted={_onDeleted}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  shapeOptions: { color: "#22c55e", fillOpacity: 0.25, weight: 3 },
                },
              }}
            />
            {/* Render polygon lama jika ada */}
            {polygonCoords && <Polygon positions={polygonCoords} color="#3b82f6" weight={3} fillOpacity={0.2} />}
          </FeatureGroup>
        </MapContainer>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            backgroundColor: "#16a34a",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Simpan Koord Polygon
        </button>
      </div>
    </div>
  );
}