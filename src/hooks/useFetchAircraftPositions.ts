import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { OpenSkyResponse, StateVector } from "@/types/opensky";
import { Ensure } from "@/types/utils";

type DisplayableVector = Ensure<
  StateVector,
  "longitude" | "latitude" | "geo_altitude" | "true_track"
>;

export type AircraftPositions = Pick<OpenSkyResponse, "time"> & {
  states: DisplayableVector[];
};

// TODO: move cleaning to backend/MSW after deciding what to do with undefined/null values
// TODO: find a cleaner way to express non-null/undefined values -- the values could be 0, which is allowed
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

function useFetchAircraftPosiions(): AircraftPositions {
  // TODO: Remember to replace prod API endpoint with wss:// for SSL
  const socketUrl = "ws://localhost:3000";
  const [data, setData] = useState<AircraftPositions>({
    time: -1,
    states: [],
  });
  const { lastMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage) {
      const parsedStates = JSON.parse(lastMessage.data) as OpenSkyResponse;
      const cleanedStates = parsedStates.states.filter(
        cleanStateVectors,
      ) as DisplayableVector[];

      setData({
        time: parsedStates.time,
        states: cleanedStates,
      });
    }
  }, [lastMessage]);

  return {
    time: data.time,
    states: data.states,
  };
}

export { useFetchAircraftPosiions };
