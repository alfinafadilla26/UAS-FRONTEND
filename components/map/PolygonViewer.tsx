"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Fix icon Leaflet
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface PolygonViewerProps {
  landId: string;
}

export default function PolygonViewer({
  landId,
}: PolygonViewerProps) {
  const [landData, setLandData] = useState<any>(null);
  const [polygonCoords, setPolygonCoords] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -2.5489,
    118.0149,
  ]);

  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    async function fetchLand() {
      try {
        const token = localStorage.getItem("access_token") || "";

        const res = await fetch(`/api/proxy/land/${landId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await res.json();

        const data = result.data;

        setLandData(data);

        if (data.latitude && data.longitude) {
          setMapCenter([
            Number(data.latitude),
            Number(data.longitude),
          ]);

          setZoom(17);
        }

        if (data.polygon_path) {
          const coords =
            typeof data.polygon_path === "string"
              ? JSON.parse(data.polygon_path)
              : data.polygon_path;

          setPolygonCoords(coords);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLand();
  }, [landId]);

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        Memuat Detail Polygon...
      </div>
    );
  }

  return (
   <div
  style={{
    maxWidth: "1200px",
    margin: "30px auto",
    padding: "24px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,.08)",
  }}
>
      {/* Card Informasi */}
      <div
  style={{
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
  }}
>
        <h2
          style={{
            marginBottom: "16px",
            color: "#166534",
          }}
        >
          Detail Lahan
        </h2>

        <div
  style={{
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    rowGap: "14px",
    columnGap: "30px",
    fontSize: "15px",
    alignItems: "center",
  }}
>
  <b>Nama Lahan</b>
  <span>{landData?.land_name}</span>

  <b>Luas</b>
  <span>{landData?.total_area_hectares} Ha</span>

  <b>Latitude</b>
  <span>{landData?.latitude}</span>

  <b>Longitude</b>
  <span>{landData?.longitude}</span>

  <b>Status Polygon</b>

  <span>
    {polygonCoords ? (
      <span style={{ color: "#16a34a", fontWeight: 700 }}>
        ✅ Sudah Ada
      </span>
    ) : (
      <span style={{ color: "#dc2626", fontWeight: 700 }}>
        ❌ Belum Ada
      </span>
    )}
  </span>
</div>
      </div>

      {/* Map */}
      <div
       style={{
  height: "600px",
  width: "100%",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #d1d5db",
  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
}}
      >
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
         <LayersControl position="topright">

  <LayersControl.BaseLayer checked name="Google Satellite">
    <TileLayer
      attribution="Google Maps"
      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      maxZoom={20}
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="OpenStreetMap">
    <TileLayer
      attribution="OpenStreetMap"
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

          {landData?.latitude &&
            landData?.longitude && (
              <Marker
                position={[
                  Number(landData.latitude),
                  Number(landData.longitude),
                ]}
              >
                <Popup>
                  {landData.land_name}
                </Popup>
              </Marker>
            )}

          {polygonCoords && (
            <Polygon
              positions={polygonCoords}
              pathOptions={{
                color: "#16a34a",
                weight: 4,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}