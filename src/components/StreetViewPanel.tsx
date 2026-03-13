import React, { useEffect, useRef, useState } from "react";
import { MdOutlineStreetview } from "react-icons/md";

interface StreetViewPanelProps {
  /** GPS latitude — required for the interactive Street View panorama */
  latitude?: number;
  /** GPS longitude — required for the interactive Street View panorama */
  longitude?: number;
  /**
   * Fallback address string used when lat/lng are missing (0 or undefined).
   * Renders an embedded Google Maps Street View iframe centred on the address.
   */
  addressFallback?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  heightClassName?: string;
}

const StreetViewPanel: React.FC<StreetViewPanelProps> = ({
  latitude,
  longitude,
  addressFallback,
  title = "Street View",
  subtitle = "Preview the billboard context from street level.",
  className = "",
  heightClassName = "h-[320px]",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [statusMessage, setStatusMessage] = useState("Loading street view...");
  const [hasStreetView, setHasStreetView] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Determine if we have usable GPS coordinates
  const hasGps = typeof latitude === "number" && typeof longitude === "number"
    && latitude !== 0 && longitude !== 0;

  // Address-based embedded iframe URL
  const iframeSrc = !hasGps && addressFallback
    ? `https://www.google.com/maps?q=${encodeURIComponent(addressFallback)}&layer=c&output=embed`
    : null;

  // Wait for the keyless Google Maps script to populate window.google (only needed for GPS mode)
  useEffect(() => {
    if (!hasGps) return;
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
  }, [hasGps]);

  useEffect(() => {
    if (!hasGps || !isReady || !containerRef.current) {
      return;
    }

    containerRef.current.innerHTML = "";

    const googleApi = (window as any).google;

    setStatusMessage("Checking street-level imagery...");

    const streetViewService = new googleApi.maps.StreetViewService();
    streetViewService.getPanorama(
      {
        location: { lat: latitude, lng: longitude },
        radius: 80,
        source: googleApi.maps.StreetViewSource.OUTDOOR,
      },
      (data: any, status: string) => {
        if (
          status === googleApi.maps.StreetViewStatus.OK &&
          data?.location?.pano &&
          containerRef.current
        ) {
          new googleApi.maps.StreetViewPanorama(containerRef.current, {
            pano: data.location.pano,
            pov: {
              heading: 0,
              pitch: 0,
            },
            zoom: 1,
            addressControl: false,
            linksControl: true,
            panControl: true,
            enableCloseButton: false,
            fullscreenControl: true,
            motionTracking: false,
          });
          setHasStreetView(true);
          return;
        }

        setHasStreetView(false);
        setStatusMessage(
          "Street view imagery is not available for this exact point yet. The map location is still accurate.",
        );
      },
    );
  }, [hasGps, isReady, latitude, longitude]);

  // ── Address-based iframe fallback ─────────────────────────────────────────
  if (iframeSrc) {
    return (
      <div className={`rounded-2xl border border-neutral-200 bg-white overflow-hidden ${className}`}>
        <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
            <MdOutlineStreetview size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
            <p className="text-xs text-neutral-500">Showing street-level view based on address</p>
          </div>
        </div>
        <div className={`relative w-full ${heightClassName}`}>
          <iframe
            title="Street View"
            src={iframeSrc}
            className="h-full w-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    );
  }

  // ── GPS interactive Street View ───────────────────────────────────────────
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white ${className}`}>
      <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
          <MdOutlineStreetview size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
      </div>

      <div className={`relative w-full ${heightClassName}`}>
        <div
          ref={containerRef}
          className="h-full w-full"
        />

        {!hasStreetView && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 px-5 text-center">
            <div>
              <p className="text-sm font-medium text-neutral-800">Street view unavailable</p>
              <p className="mt-2 text-sm text-neutral-500">{statusMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreetViewPanel;