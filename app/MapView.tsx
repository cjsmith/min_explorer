"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapView.module.css";

interface Location {
  latitude: number;
  longitude: number;
}

interface Observations {
  avalanche: number;
  incident: number;
  quick: number;
  snowpack: number;
  weather: number;
}

interface ObservationItem {
  id: string;
  title: string;
  username: string;
  datetime: string;
  location: Location;
  region: string;
  imageCount: number;
  observations: Observations;
  tags: string[];
}

interface MapViewProps {
  observations: ObservationItem[];
  onObservationSelect: (id: string) => void;
  selectedId?: string;
}

// Using a public Mapbox token - in production, this should be an environment variable
const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiY2oyc21pdGgiLCJhIjoiY205MGo2Nm5xMG10dzJrcTB4ejhsZ2JrbyJ9.g6ivNLfl-A9pbv7hth6ZgA";

export default function MapView({
  observations,
  onObservationSelect,
  selectedId,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Calculate center from observations
    const lats = observations.map((o) => o.location.latitude);
    const lngs = observations.map((o) => o.location.longitude);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length || 49.3;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length || -123.1;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [centerLng, centerLat],
      zoom: 8,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    // Add markers for each observation
    observations.forEach((obs) => {
      const el = document.createElement("div");
      el.className = styles.marker;
      if (selectedId === obs.id) {
        el.classList.add(styles.markerSelected);
      }

      el.addEventListener("click", () => {
        onObservationSelect(obs.id);
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(`
        <div class="${styles.popup}">
          <strong>${obs.title}</strong>
          <p>${obs.username}</p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([obs.location.longitude, obs.location.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("mouseenter", () => popup.addTo(map));
      el.addEventListener("mouseleave", () => popup.remove());

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (observations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      observations.forEach((obs) => {
        bounds.extend([obs.location.longitude, obs.location.latitude]);
      });
      map.fitBounds(bounds, { padding: 50 });
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
    };
  }, [observations, onObservationSelect, selectedId]);

  return <div ref={mapContainerRef} className={styles.mapContainer} />;
}

// Smaller map for detail view
interface DetailMapProps {
  latitude: number;
  longitude: number;
}

export function DetailMap({ latitude, longitude }: DetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [longitude, latitude],
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    // Add marker for the observation location
    const el = document.createElement("div");
    el.className = styles.detailMarker;

    new mapboxgl.Marker(el).setLngLat([longitude, latitude]).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return <div ref={mapContainerRef} className={styles.detailMapContainer} />;
}

// Mini map for card list view
export function MiniMap({ latitude, longitude }: DetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [longitude, latitude],
      zoom: 10,
      interactive: false, // Disable interactions for mini map
      attributionControl: false,
    });

    mapRef.current = map;

    // Add marker for the observation location
    const el = document.createElement("div");
    el.className = styles.miniMarker;

    new mapboxgl.Marker(el).setLngLat([longitude, latitude]).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return <div ref={mapContainerRef} className={styles.miniMapContainer} />;
}
