// src/utils/actionCable.js (O donde manejes tu lógica de Action Cable)
import { createConsumer } from "@rails/actioncable";

let consumer: any = null;

export const initializeActionCable = (deviceId: any) => {
    if (typeof window === "undefined") {
        // Evitar ejecutar en el lado del servidor durante la renderización de Next.js
        return;
    }

    // Si ya tenemos un consumidor, lo cerramos y creamos uno nuevo
    // para asegurarnos de que la conexión tenga el nuevo app_id.
    if (consumer) {
        consumer.disconnect();
    }

    // Conectar a la URL del WebSocket incluyendo el app_id como parámetro
    // Asegúrate de que la URL base sea correcta para tu entorno (desarrollo/producción)
    const cableUrl = `${process.env.NEXT_PUBLIC_RAILS_ACTION_CABLE_URL}?device_id=${deviceId}` || `ws://ws-adonplay.local/cable?device_id=${deviceId}`;
    consumer = createConsumer(cableUrl);

    // Solo forzar reintento en desarrollo
    if (process.env.NODE_ENV === "development") {
        console.log("En develop");
        const originalDisconnected = consumer.connection.disconnected;

        consumer.connection.disconnected = function (...args: any[]) {
            console.log("Cable desconectado (dev mode), reintentando...");
            setTimeout(() => {
                consumer.connect();
            }, 2000);

            if (typeof originalDisconnected === "function") {
                originalDisconnected.apply(this, args);
            }
        };
    }

    return consumer;
};
