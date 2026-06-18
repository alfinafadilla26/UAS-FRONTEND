"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

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

interface Props {
  landId: string;
}

export default function MapPreview({ landId }: Props) {
  const [land, setLand] = useState<any>(null);
  const [polygon, setPolygon] = useState<any>(null);

  const [center, setCenter] = useState<[number, number]>([
    -2.5489,
    118.0149,
  ]);

  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("access_token") || "";

      const res = await fetch(`/api/proxy/land/${landId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      const data = result.data;

      setLand(data);

      if (data.latitude && data.longitude) {
        setCenter([
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

        setPolygon(coords);
      }
    }

    load();
  }, [landId]);

  return (
    <div
      style={{
        height: 450,
        width: "100%",
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <LayersControl position="topright">

          <LayersControl.BaseLayer
            checked
            name="Google Satellite"
          >
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer
            name="OpenStreetMap"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer
            name="Deforestation"
          >
            <TileLayer
              url="https://tiles.globalforestwatch.org/umd_tree_cover_loss/latest/dynamic/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

        </LayersControl>

        {land?.latitude && land?.longitude && (
          <Marker
            position={[
              Number(land.latitude),
              Number(land.longitude),
            ]}
          />
        )}

        {polygon && (
          <Polygon
            positions={polygon}
            pathOptions={{
              color: "#16a34a",
              weight: 4,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}