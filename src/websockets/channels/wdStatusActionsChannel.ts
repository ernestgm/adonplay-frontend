import { useEffect } from "react";
import cable from "@/websockets/actionCable";

export function useWdStatusActionsChannel(
    deviceId: string | number,
    onReceived: (data: unknown) => void,
    onDisconnect: () => void,
) {
    useEffect(() => {
        if (!deviceId) return;
        if (!cable) return;

        const subscription = cable.subscriptions.create(
            { channel: "WdStatusActionsChannel" },
            {
                received(data: unknown) {
                    console.log("📡 Datos:", data);
                    if (onReceived) onReceived(data);
                },
                connected() {
                    console.log("✅ Conectado a WdStatusActionsChannel");
                },
                disconnected() {
                    console.log("❌ Desconectado de WdStatusActionsChannel");
                    onDisconnect()
                }
            }
        );

        return () => {
            console.log("🧹 Limpiando WdStatusActionsChannel suscripción para el dispositivo:", deviceId);
            if (subscription) {
                subscription.unsubscribe();
                // Opcional: Si quieres forzar la desconexión total del socket
                // cable.disconnect();
            }
        };
    }, [deviceId]);
}
