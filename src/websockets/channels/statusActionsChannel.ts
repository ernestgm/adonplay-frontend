import { useEffect } from "react";
import cable from "@/websockets/actionCable";

const SYNC_INTERVAL_MS = 15_000;

export function useStatusActionsChannel(
    deviceId: string | number,
    onReceived: (data: unknown) => void,
    onDisconnect: () => void,
) {
    useEffect(() => {
        if (!cable) return;

        let isConnected = false;
        let syncTimer: ReturnType<typeof setInterval> | undefined;

        const clearSyncTimer = () => {
            if (syncTimer) {
                clearInterval(syncTimer);
                syncTimer = undefined;
            }
        };

        const subscription = cable.subscriptions.create(
            { channel: "StatusActionsChannel" },
            {
                received(data: unknown) {
                    console.log("📡 Acción recibida:", data);
                    if (onReceived) onReceived(data);
                },
                connected() {
                    console.log("✅ Conectado a StatusActionsChannel");
                    isConnected = true;
                    safeSend({ type: "sync" });
                    clearSyncTimer();
                    syncTimer = setInterval(() => {
                        safeSend({ type: "sync" });
                    }, SYNC_INTERVAL_MS);
                },
                disconnected() {
                    console.log("❌ Desconectado de StatusActionsChannel");
                    isConnected = false;
                    clearSyncTimer();
                    onDisconnect?.();
                },
                rejected() {
                    isConnected = false;
                    clearSyncTimer();
                }
            }
        );

        function safeSend(data: unknown) {
            if (!isConnected) return;
            subscription.send(data);
        }

        return () => {
            console.log("🧹 Limpiando suscripción para el dispositivo:", deviceId);
            isConnected = false;
            clearSyncTimer();
            subscription.unsubscribe();
        };
    }, [deviceId]);
}
