import { getRuntimePlatform } from "mainnet-js";

import { default as ES } from "eventsource";

let EventSource;
if (getRuntimePlatform() != "node") {
  EventSource = globalThis.EventSource;
} else {
  EventSource = ES;
}

export default EventSource;
