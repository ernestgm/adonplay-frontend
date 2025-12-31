import { useEffect } from "react";
import {initializeActionCable} from "@/websockets/actionCable";

export function useWdStatusActionsChannel(
    deviceId: string | number,
    onReceived: (data: unknown) => void
) {
    useEffect(() => {
        if (!deviceId) return;
        const cable = initializeActionCable(deviceId)
        if (!cable) return;
        const subscription = cable.subscriptions.create(
            { channel: "WdStatusActionsChannel", device_id: deviceId },
            {
                received(data: unknown) {
                    console.log("📡 Acción recibida:", data);
                    if (onReceived) onReceived(data);
                },
                connected() {
                    console.log("✅ Conectado a WdStatusActionsChannel");
                },
                disconnected() {
                    console.log("❌ Desconectado de WdStatusActionsChannel");
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [deviceId, onReceived]);
}
