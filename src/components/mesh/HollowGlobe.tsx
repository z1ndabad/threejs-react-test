import { FeatureCollection, GeoJsonProperties } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods, GlobeProps } from "react-globe.gl";
import {
  CircleGeometry,
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  OctahedronGeometry,
} from "three";
import * as topoJson from "topojson-client";
import { Topology, Objects } from "topojson-specification";
import * as landJson from "world-atlas/land-110m.json";
import { GlobePoint, useAircraftPaths } from "@/hooks/useAircraftPaths";

function calculateDisplayAltitude(alt: number) {
  const EARTH_RADIUS_KM = 6371;
  const KM_IN_M = 0.001;
  const ALTITUDE_SCALE_FACTOR = 10;
  return (alt * KM_IN_M * ALTITUDE_SCALE_FACTOR) / EARTH_RADIUS_KM;
}

// TODO:
// - Increase scroll sensitivity for zoom -- takes too long to zoom in
// - Update path lines and plane markers to be prettier
function HollowGlobe(props: GlobeProps) {
  // Ref to actual Globe element for debugging
  const globeRef = useRef<GlobeMethods>();

  // Globe materials
  const globeMaterial = useMemo(
    () =>
      new MeshPhongMaterial({
        color: "black",
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );

  // Landmass drawings
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

  // Aircraft drawings
  const aircraftMarker = useMemo(() => {
    // TODO: scale these based on initial globe size (in case container grows/shrinks)
    const aircraftGeometry = new OctahedronGeometry(0.25);
    const aircraftMaterial = new MeshLambertMaterial({ color: "red" });
    return new Mesh(aircraftGeometry, aircraftMaterial);
  }, []);

  // Aircraft position data retrieval & processing
  const { time, paths } = useAircraftPaths();
  const displayPaths = Object.values(paths);
  const currentPositions = displayPaths.map((path) => path[path.length - 1]);

  return (
    <Globe
      ref={globeRef}
      backgroundColor="black" // TODO: theme this later
      showGlobe={true}
      globeMaterial={globeMaterial}
      showAtmosphere={false}
      polygonsData={landPolygons}
      polygonCapMaterial={polygonsMaterial}
      polygonSideColor={() => "rgba(0, 0, 0, 0)"}
      polygonAltitude={0.01} // defaults to 0.01 -- marker altitude needs to be adjusted when using a nonzero value
      objectsData={currentPositions}
      // TODO: theming for accessors
      objectLabel={(d) =>
        `<div style='color: red'>${(d as GlobePoint).label}</div>`
      }
      objectLat={"latitude"}
      objectLng={"longitude"}
      // TODO: figure out correct altitude calculations--passing it directly draws markers in the wrong positons
      objectAltitude={(d) =>
        calculateDisplayAltitude((d as GlobePoint).altitude)
      }
      objectThreeObject={aircraftMarker}
      pathsData={displayPaths}
      pathPoints={(d) => {
        // console.log("ACCESSOR");
        // console.log(d);
        return (d as GlobePoint[]).map((pt) => {
          return [pt.latitude, pt.longitude, pt.altitude];
        });
      }}
      pathPointAlt={(pnt) => calculateDisplayAltitude(pnt[2])}
      {...props}
    />
  );
}

export { HollowGlobe };
