import React, { useEffect, useRef, useState } from "react";
import { MdDirections, MdLocationOn } from "react-icons/md";

interface GoogleMapPanelProps {
  latitude: number;
  longitude: number;
  title?: string;
  subtitle?: string;
  className?: string;
  heightClassName?: string;
}

const GoogleMapPanel: React.FC<GoogleMapPanelProps> = ({
  latitude,
  longitude,
  title = "Map Preview",
  subtitle = "Review the precise billboard location on Google Maps.",
  className = "",
  heightClassName = "h-[320px]",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`;

  // Wait for the keyless Google Maps script to populate window.google
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
    const center = { lat: latitude, lng: longitude };
    const map = new google.maps.Map(containerRef.current, {
      center,
      zoom: 16,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
    });
    new google.maps.Marker({ position: center, map });
  }, [isReady, latitude, longitude]);

  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white ${className}`}>
      <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
          <MdLocationOn size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Open Google Maps directions"
        >
          <MdDirections size={16} />
          Directions
        </a>
      </div>

      <div className={`relative w-full ${heightClassName}`}>
        <div ref={containerRef} className="h-full w-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 px-5 text-center">
            <div>
              <p className="text-sm font-medium text-neutral-800">Map unavailable</p>
              <p className="mt-2 text-sm text-neutral-500">Loading Google Maps...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapPanel;
