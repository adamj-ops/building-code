"use client"

import { useCallback, useState, useId, useEffect } from "react"
import MapGL, { Source, Layer, Popup, NavigationControl } from "react-map-gl"
import type { MapLayerMouseEvent, FillLayer, LineLayer } from "react-map-gl"
import { useRouter } from "next/navigation"
import { MapPopup } from "./map-popup"
import "mapbox-gl/dist/mapbox-gl.css"

export interface CountyData {
  id: string
  name: string
  cities: number
  dataStatus: "complete" | "partial" | "state_only"
  lastUpdated: string
}

interface JurisdictionMapProps {
  counties: CountyData[]
  onCountyClick?: (countyId: string) => void
}

// Color mapping for data status
const STATUS_COLORS = {
  complete: "#34d399",    // emerald-400
  partial: "#fbbf24",     // amber-400
  state_only: "#a1a1aa",  // zinc-400
}

// Fill layer style
const countyFillLayer: FillLayer = {
  id: "county-fill",
  type: "fill",
  source: "counties",
  paint: {
    "fill-color": [
      "match",
      ["get", "dataStatus"],
      "complete", STATUS_COLORS.complete,
      "partial", STATUS_COLORS.partial,
      "state_only", STATUS_COLORS.state_only,
      STATUS_COLORS.state_only // default
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.6,
      0.3
    ]
  }
}

// Border layer style
const countyLineLayer: LineLayer = {
  id: "county-line",
  type: "line",
  source: "counties",
  paint: {
    "line-color": [
      "match",
      ["get", "dataStatus"],
      "complete", STATUS_COLORS.complete,
      "partial", STATUS_COLORS.partial,
      "state_only", STATUS_COLORS.state_only,
      STATUS_COLORS.state_only
    ],
    "line-width": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      2,
      1
    ],
    "line-opacity": 0.8
  }
}

// Minnesota Twin Cities metro area center
const INITIAL_VIEW_STATE = {
  longitude: -93.2,
  latitude: 44.95,
  zoom: 8.5
}

export function JurisdictionMap({ counties, onCountyClick }: JurisdictionMapProps) {
  const router = useRouter()
  const sourceId = useId()
  const [hoveredCounty, setHoveredCounty] = useState<CountyData | null>(null)
  const [popupCoords, setPopupCoords] = useState<{ lng: number; lat: number } | null>(null)
  const [geojsonData, setGeojsonData] = useState<GeoJSON.FeatureCollection | null>(null)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  // Load GeoJSON data
  useEffect(() => {
    fetch("/data/mn-metro-counties.geojson")
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error("Failed to load county boundaries:", err))
  }, [])

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (feature?.properties) {
      const county = counties.find(c => c.id === feature.properties?.id)
      if (county) {
        setHoveredCounty(county)
        setPopupCoords({ lng: event.lngLat.lng, lat: event.lngLat.lat })
      }
    } else {
      setHoveredCounty(null)
      setPopupCoords(null)
    }
  }, [counties])

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (feature?.properties?.id) {
      const countyId = feature.properties.id as string
      if (onCountyClick) {
        onCountyClick(countyId)
      } else {
        // Navigate to first city in the county, or just use county id for now
        router.push(`/jurisdictions/${countyId}`)
      }
    }
  }, [onCountyClick, router])

  // Fallback if no token
  if (!mapboxToken) {
    return (
      <div className="h-[600px] bg-surface-2 flex items-center justify-center rounded-lg border border-border">
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-2">
            Mapbox token not configured.
          </p>
          <p className="text-xs text-muted-foreground">
            Add <code className="bg-surface-3 px-1 rounded">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to your environment.
          </p>
        </div>
      </div>
    )
  }

  // Create unique layer IDs using the component's unique ID
  const fillLayerId = `county-fill-${sourceId}`
  const lineLayerId = `county-line-${sourceId}`
  const sourceIdUnique = `counties-${sourceId}`

  const fillLayer: FillLayer = {
    ...countyFillLayer,
    id: fillLayerId,
    source: sourceIdUnique
  }

  const lineLayer: LineLayer = {
    ...countyLineLayer,
    id: lineLayerId,
    source: sourceIdUnique
  }

  return (
    <div className="h-[600px] rounded-lg overflow-hidden border border-border">
      <MapGL
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={[fillLayerId]}
        onMouseMove={onHover}
        onMouseLeave={() => {
          setHoveredCounty(null)
          setPopupCoords(null)
        }}
        onClick={onClick}
        cursor={hoveredCounty ? "pointer" : "grab"}
      >
        <NavigationControl position="top-right" />
        
        {geojsonData && (
          <Source id={sourceIdUnique} type="geojson" data={geojsonData}>
            <Layer {...fillLayer} />
            <Layer {...lineLayer} />
          </Source>
        )}

        {hoveredCounty && popupCoords && (
          <Popup
            longitude={popupCoords.lng}
            latitude={popupCoords.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={10}
          >
            <MapPopup county={hoveredCounty} />
          </Popup>
        )}
      </MapGL>
    </div>
  )
}
