import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Ensure } from "@/util/types";
import { OpenSkyResponse, StateVector } from "./opensky";

type DisplayableVector = Ensure<
  StateVector,
  "longitude" | "latitude" | "geo_altitude"
>;

export type AircraftPositions = Pick<OpenSkyResponse, "time"> & {
  states: DisplayableVector[];
  paths: { [key: string]: DisplayableVector[] };
};

// TODO: move cleaning to backend/MSW after deciding what to do with undefined/null values
function cleanStateVectors(vec: StateVector): boolean {
  return (
    vec.longitude !== null &&
    vec.longitude !== undefined &&
    vec.latitude !== null &&
    vec.latitude !== undefined &&
    vec.geo_altitude !== null &&
    vec.geo_altitude !== undefined
  );
}

function useAircraftPositions(): AircraftPositions {
  // TODO: Remember to replace prod API endpoint with wss:// for SSL
  const socketUrl = "ws://localhost:3000";
  const [data, setData] = useState<AircraftPositions>({
    time: -1,
    states: [],
    paths: {},
  });
  const { lastMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage) {
      const parsedStates = JSON.parse(lastMessage.data) as OpenSkyResponse;
      const cleanedStates = parsedStates.states.filter(
        cleanStateVectors,
      ) as DisplayableVector[];

      // TODO: move paths to backend/MSW -- client-side is a bad idea, no persistence
      const newPaths = cleanedStates.reduce(
        (acc, curr) => {
          const old = data.paths[curr.icao24];
          if (old) {
            acc[curr.icao24] = [...old, curr];
          } else {
            acc[curr.icao24] = [curr];
          }
          return acc;
        },
        {} as AircraftPositions["paths"],
      );

      setData({
        time: parsedStates.time,
        states: cleanedStates,
        paths: newPaths,
      });
    }
  }, [lastMessage]);

  return {
    time: data.time,
    states: data.states,
    paths: data.paths,
  };
}

export { useAircraftPositions };
