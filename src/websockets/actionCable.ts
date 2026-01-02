// src/utils/actionCable.js (O donde manejes tu lógica de Action Cable)
import { createConsumer, logger } from "@rails/actioncable";

// Opción A: Desactivar los logs internos de la librería
logger.enabled = false;

const cableUrl = `${process.env.NEXT_PUBLIC_RAILS_ACTION_CABLE_URL}?device_id=frontend` || `ws://ws-adonplay.local/cable?device_id=frontend`;
const cable = createConsumer(cableUrl);
export default cable;
