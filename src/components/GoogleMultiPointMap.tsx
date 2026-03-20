import React, { useEffect, useRef } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import type { Billboard } from "@/types/billboard.types";

interface GoogleMultiPointMapProps {
  billboards: Billboard[];
  center: [number, number];
  heightClassName?: string;
}

const GoogleMultiPointMap: React.FC<GoogleMultiPointMapProps> = ({
  billboards,
  center,
  heightClassName = "h-[420px] md:h-[600px]",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { isLoaded, loadError, hasApiKey } = useGoogleMaps();

  useEffect(() => {
    if (!hasApiKey || !isLoaded || !containerRef.current) return;

    const googleMaps = window.google.maps;

    if (!mapRef.current) {
      mapRef.current = new googleMaps.Map(containerRef.current, {
        center: { lat: center[0], lng: center[1] },
        zoom: 12,
        fullscreenControl: true,
        mapTypeControl: false,
        streetViewControl: false,
      });
    } else {
      mapRef.current.setCenter({ lat: center[0], lng: center[1] });
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const infoWindow = new googleMaps.InfoWindow();

    billboards
      .filter((billboard) => billboard.location.lat !== 0 && billboard.location.lng !== 0)
      .forEach((billboard) => {
        const marker = new googleMaps.Marker({
          position: { lat: billboard.location.lat, lng: billboard.location.lng },
          map: mapRef.current,
          title: billboard.title,
          animation: googleMaps.Animation.DROP,
        });

        const contentString = `
          <div style="max-width: 200px; padding: 0;">
            ${billboard.photos[0] ? `<img src="${billboard.photos[0]}" alt="${billboard.title}" style="width: 100%; height: 96px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ""}
            <h4 style="font-weight: bold; font-size: 14px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${billboard.title}</h4>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${billboard.location.address}, ${billboard.location.city}</p>
            <p style="font-size: 14px; font-weight: bold; color: #047857;">NGN ${billboard.pricing.daily.toLocaleString()}/day</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="font-size: 10px; padding: 2px 8px; background-color: #f3f4f6; border-radius: 9999px; color: #4b5563; text-transform: uppercase;">${billboard.type}</span>
              <span style="font-size: 10px; color: #9ca3af;">Traffic: ${billboard.trafficScore}/10</span>
            </div>
          </div>
        `;

        marker.addListener("click", () => {
          infoWindow.setContent(contentString);
          infoWindow.open({
            anchor: marker,
            map: mapRef.current,
          });
        });

        markersRef.current.push(marker);
      });
  }, [billboards, center, hasApiKey, isLoaded]);

  const overlay = loadError
    ? {
        title: "Map unavailable",
        message: "Google Maps failed to load. Check the API key and enabled APIs.",
      }
    : !hasApiKey
    ? {
        title: "Map unavailable",
        message: "Add VITE_GOOGLE_MAPS_API_KEY to load Google Maps.",
      }
    : {
        title: "Map unavailable",
        message: "Loading Google Maps...",
      };

  return (
    <div className={`relative w-full ${heightClassName}`}>
      <div ref={containerRef} className="h-full w-full outline-none" />
      {(!hasApiKey || loadError || !isLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 px-5 text-center">
          <div>
            <p className="text-sm font-medium text-neutral-800">
              {overlay.title}
            </p>
            <p className="mt-2 text-sm text-neutral-500">{overlay.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMultiPointMap;
