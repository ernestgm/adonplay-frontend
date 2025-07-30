// components/GlobalLoadingIndicator.jsx
'use client'; // Esto lo convierte en un Client Component

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'; // Importa desde next/navigation

export default function GlobalLoadingIndicator() {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setLoading(true); // Se activa al inicio de la navegación

        // Un pequeño delay para asegurar que el loading se muestre incluso en cargas rápidas
        const timer = setTimeout(() => {
            setLoading(false); // Se desactiva una vez que la ruta (y sus datos) se han cargado
        }, 100); // Ajusta este valor si es necesario

        return () => clearTimeout(timer);
    }, [pathname, searchParams]); // Se ejecuta cada vez que la ruta o los parámetros cambian

    if (!loading) return null;

    return (
        <div style={{
        position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px', // Una barra de progreso fina
            backgroundColor: '#465fff',
            zIndex: 100000,
            animation: 'progress 1s infinite linear' // Una animación simple
    }}>
    {/* Puedes agregar un spinner o cualquier otra UI de carga */}
    <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
);
}