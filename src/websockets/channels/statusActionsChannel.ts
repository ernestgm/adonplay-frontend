import { useEffect } from "react";
import cable from "@/websockets/actionCable";

export function useStatusActionsChannel(
    deviceId: string | number,
    onReceived: (data: unknown) => void,
    onDisconnect: () => void,
) {
    useEffect(() => {
        if (!cable) return;
        const subscription = cable.subscriptions.create(
            { channel: "StatusActionsChannel" },
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
                    onDisconnect()
                }
            }
        );

        return () => {
            console.log("🧹 Limpiando suscripción para el dispositivo:", deviceId);
            if (subscription) {
                subscription.unsubscribe();
                // Opcional: Si quieres forzar la desconexión total del socket
                // cable.disconnect();
            }
        };
    }, [deviceId]);
}
