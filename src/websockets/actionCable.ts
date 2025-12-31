// src/utils/actionCable.js (O donde manejes tu lógica de Action Cable)
import { createConsumer, type Consumer } from "@rails/actioncable";

const cableUrl = `${process.env.NEXT_PUBLIC_RAILS_ACTION_CABLE_URL}?device_id=frontend` || `ws://ws-adonplay.local/cable?device_id=frontend`;
const cable = createConsumer(cableUrl);
export default cable;
