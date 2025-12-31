import { useEffect } from "react";
import cable from "@/websockets/actionCable";

export function useWdStatusActionsChannel(
    deviceId: string | number,
    onReceived: (data: unknown) => void
) {
    useEffect(() => {
        if (!deviceId) return;
        if (!cable) return;
        const isDev = process.env.NODE_ENV === 'development';
        const subscription = cable.subscriptions.create(
            { channel: "WdStatusActionsChannel", device_id: deviceId },
            {
                received(data: unknown) {
                    if (isDev) console.log("📡 Datos:", data);
                    if (onReceived) onReceived(data);
                },
                connected() {
                    if (isDev) console.log("✅ Conectado a WdStatusActionsChannel");
                },
                disconnected() {
                    if (isDev) console.log("❌ Desconectado de WdStatusActionsChannel");
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [deviceId, onReceived]);
}
