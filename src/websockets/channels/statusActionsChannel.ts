import { useEffect } from "react";
import {initializeActionCable} from "@/websockets/actionCable";

export function useStatusActionsChannel(deviceId: any, onReceived: any) {
    useEffect(() => {
        if (!deviceId) return;
        const cable = initializeActionCable(deviceId)
        const subscription = cable.subscriptions.create(
            { channel: "StatusActionsChannel", device_id: deviceId },
            {
                received(data: any) {
                    console.log("📡 Acción recibida:", data);
                    if (onReceived) onReceived(data);
                },
                connected() {
                    console.log("✅ Conectado a LoginActionsChannel");
                },
                disconnected() {
                    console.log("❌ Desconectado de LoginActionsChannel");
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [deviceId]);
}
