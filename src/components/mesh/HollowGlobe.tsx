import { useMemo } from "react";
import { FeatureCollection, GeoJsonProperties } from "geojson";
import Globe, { GlobeProps } from "react-globe.gl";
import { DoubleSide, MeshLambertMaterial } from "three";
import * as topoJson from "topojson-client";
import { Topology, Objects } from "topojson-specification";
import * as landJson from "world-atlas/land-110m.json";

function HollowGlobe(props: GlobeProps) {
  // memoize since we aren't retexturing the globe
  const { landPolygons, polygonsMaterial } = useMemo(() => {
    const landFeatures = topoJson.feature(
      landJson as unknown as Topology<Objects<GeoJsonProperties>>,
      //@ts-expect-error String literal union expected
      landJson.objects.land,
    ) as unknown as FeatureCollection;

    const landPolygons = landFeatures.features;
    const polygonsMaterial = new MeshLambertMaterial({
      color: "white",
      side: DoubleSide,
    });

    return { landPolygons, polygonsMaterial };
  }, []);

  return (
    <Globe
      backgroundColor="black" // TODO: theme this later
      showGlobe={false}
      showAtmosphere={false}
      polygonsData={landPolygons}
      polygonCapMaterial={polygonsMaterial}
      polygonSideColor={() => "rgba(0, 0, 0, 0)"}
      {...props}
    />
  );
}

export { HollowGlobe };
