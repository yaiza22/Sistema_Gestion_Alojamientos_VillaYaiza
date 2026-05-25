import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
    const navegar = useNavigate();
    const { login } = useAuth();
    const procesado = useRef(false); // evita doble ejecución

    useEffect(() => {
        if (procesado.current) return;
        procesado.current = true;
        const procesar = async () => {
            const params = new URLSearchParams(window.location.search);
            const access = params.get("access");
            const refresh = params.get("refresh");

            if (!access || !refresh) {
                navegar("/", { replace: true });
                return;
            }

            // Guardar tokens primero
            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);

            // Luego llamar login del contexto
            await login(access, refresh, true);

            // Navegar limpiando la URL
            navegar("/dashboard", { replace: true });
        };
        procesar();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin w-8 h-8 border-4 border-[#F5A623]
                                border-t-transparent rounded-full" />
                <p className="text-gray-500 text-sm">
                    Iniciando sesión con Google...
                </p>
            </div>
        </div>
    );
}


/*
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
    const navegar = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const access = params.get("access");
        const refresh = params.get("refresh");
        const error = params.get("error");

        if (error || !access || !refresh) {
            navegar("/?error=google");
            return;
        }

        // Guarda los tokens — Google login no tiene "recordarme",
        // usamos localStorage por defecto para que persista
        login(access, refresh, true);
        navegar("/dashboard");
    }, [login, navegar]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-[#F5A623] border-t-transparent rounded-full" />
                <p className="text-gray-500 text-sm">Iniciando sesión con Google...</p>
            </div>
        </div>
    );
}
    */