import { useEffect } from "react";
import cable from "@/websockets/actionCable";

export function useStatusActionsChannel(
    deviceId: string | number,
    onReceived: (data: unknown) => void
) {
    useEffect(() => {
        if (!deviceId) return;
        if (!cable) return;
        const subscription = cable.subscriptions.create(
            { channel: "StatusActionsChannel", device_id: deviceId },
            {
                received(data: unknown) {
                    console.log("📡 Acción recibida:", data);
                    if (onReceived) onReceived(data);
                },
                connected() {
                    console.log("✅ Conectado a StatusActionsChannel");
                },
                disconnected() {
                    console.log("❌ Desconectado de StatusActionsChannel");
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [deviceId]);
}
