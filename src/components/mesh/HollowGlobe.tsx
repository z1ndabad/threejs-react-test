import { FeatureCollection, GeoJsonProperties } from "geojson";
import { useMemo } from "react";
import Globe, { GlobeProps } from "react-globe.gl";
import {
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  OctahedronGeometry,
} from "three";
import * as topoJson from "topojson-client";
import { Topology, Objects } from "topojson-specification";
import * as landJson from "world-atlas/land-110m.json";
import { OpenSkyResponse } from "@/api/opensky";
import { useAircraftPositions } from "@/api/socket";

function HollowGlobe(props: GlobeProps) {
  const landFeatures = useMemo(() => {
    return topoJson.feature(
      landJson as unknown as Topology<Objects<GeoJsonProperties>>,
      //@ts-expect-error String literal union expected
      landJson.objects.land,
    ) as unknown as FeatureCollection;
  }, []);

  const landPolygons = landFeatures.features;
  const polygonsMaterial = new MeshLambertMaterial({
    color: "white",
    side: DoubleSide,
  });

  const planeMarker = useMemo(() => {
    // TODO: scale these based on initial globe size (in case container grows/shrinks)
    const planeGeometry = new OctahedronGeometry(1);
    const planeMaterial = new MeshLambertMaterial({ color: "red" });
    return new Mesh(planeGeometry, planeMaterial);
  }, []);

  const { aircraftData } = useAircraftPositions();
  // TODO: add persisent labels layer?
  // TODO: positions are not reliable -- when a plane leaves the array, we should assume it keeps going the same directions
  // also, why are they not really moving? Do I need a longer monitoring window?
  const positions = aircraftData?.states.map(
    ({ icao24, latitude, longitude, baro_altitude }) => {
      return {
        label: icao24,
        lat: latitude,
        lng: longitude,
        alt: baro_altitude,
      };
    },
  );
  console.log(aircraftData);

  return (
    <Globe
      /* ref={globeRef} */
      backgroundColor="black" // TODO: theme this later
      showGlobe={false}
      showAtmosphere={false}
      polygonsData={landPolygons}
      polygonCapMaterial={polygonsMaterial}
      polygonSideColor={() => "rgba(0, 0, 0, 0)"}
      objectsData={positions}
      objectLabel="label"
      objectLat="lat"
      objectLng="lng"
      objectAltitude="alt"
      objectThreeObject={planeMarker}
      {...props}
    />
  );
}

export { HollowGlobe };
