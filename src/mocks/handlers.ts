import { RequestHandler, WebSocketHandler, ws } from "msw";
import { OpenSkyResponse } from "@/api/opensky";
import flightJson from "./aircraftdata-clean.json";

const vectors = flightJson as { data: OpenSkyResponse[] };
export const sock = ws.link("ws://localhost:3000"); //TODO: replace with env variable

export const handlers: Array<RequestHandler | WebSocketHandler> = [
  sock.on("connection", ({ client }) => {
    let i = 0;
    const len = vectors.data.length;

    const send = () => {
      client.send(JSON.stringify(vectors.data[i]));
      i++;
    };

    if (i < len) {
      send();
      const interval = setInterval(() => {
        send();
        if (i >= len) {
          console.log("Mock data finished, reload");
          clearInterval(interval);
        }
      }, 2000);
    }
  }),
];
