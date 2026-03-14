import React, { useEffect, useRef, useState } from "react";

interface GoogleMapInteractiveProps {
  latitude?: number;
  longitude?: number;
  defaultCenter?: [number, number];
  onLocationChange?: (lat: number, lng: number) => void;
  heightClassName?: string;
  readOnly?: boolean;
}

const GoogleMapInteractive: React.FC<GoogleMapInteractiveProps> = ({
  latitude,
  longitude,
  defaultCenter = [6.5244, 3.3792],
  onLocationChange,
  heightClassName = "h-[350px]",
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      if ((window as any).google?.maps) {
        setIsReady(true);
      } else {
        timer = setTimeout(check, 200);
      }
    };
    check();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current) return;
    const google = (window as any).google;

    const center = latitude !== undefined && longitude !== undefined
      ? { lat: latitude, lng: longitude }
      : { lat: defaultCenter[0], lng: defaultCenter[1] };

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center,
        zoom: latitude !== undefined ? 16 : 11,
        fullscreenControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        gestureHandling: readOnly ? "none" : "auto",
        zoomControl: !readOnly,
      });

      if (!readOnly && onLocationChange) {
        mapRef.current.addListener("click", (e: any) => {
          onLocationChange(e.latLng.lat(), e.latLng.lng());
        });
      }
    } else {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(latitude !== undefined ? 16 : 11);
    }

    if (latitude !== undefined && longitude !== undefined) {
      if (!markerRef.current) {
        markerRef.current = new google.maps.Marker({
          position: center,
          map: mapRef.current,
          draggable: !readOnly,
          animation: google.maps.Animation.DROP,
        });

        if (!readOnly && onLocationChange) {
          markerRef.current.addListener("dragend", (e: any) => {
            onLocationChange(e.latLng.lat(), e.latLng.lng());
          });
        }
      } else {
        markerRef.current.setPosition(center);
        markerRef.current.setDraggable(!readOnly);
      }
    } else if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  }, [isReady, latitude, longitude, readOnly, onLocationChange, defaultCenter]);

  return (
    <div className={`relative w-full ${heightClassName}`}>
      <div ref={containerRef} className="h-full w-full outline-none" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 px-5 text-center">
          <div>
            <p className="text-sm font-medium text-neutral-800">Map unavailable</p>
            <p className="mt-2 text-sm text-neutral-500">Loading Google Maps...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapInteractive;
