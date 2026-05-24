import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {LayoutDashboard, Calendar, BookOpen, Users, Package, FileText, Building2, UserCog, LogOut, Menu, X, ChevronRight} from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth";
import { tienePermiso, puedeGestionarUsuarios } from "../utils/permisos";

const MENU_ITEMS = [
    {
        ruta: "/dashboard",
        etiqueta: "Dashboard",
        icono: LayoutDashboard,
        siempre: true,
    },
    {
        ruta: "/reservas",
        etiqueta: "Reservas",
        icono: BookOpen,
        permiso: { modulo: "reservas", accion: "ver" },
    },
    {
        ruta: "/clientes",
        etiqueta: "Clientes",
        icono: Users,
        permiso: { modulo: "clientes", accion: "ver" },
    },
    {
        ruta: "/propiedades",
        etiqueta: "Propiedades",
        icono: Building2,
        permiso: { modulo: "propiedades", accion: "ver" },
    },
    {
        ruta: "/inventario",
        etiqueta: "Inventario",
        icono: Package,
        permiso: { modulo: "inventario", accion: "ver" },
    },
    {
        ruta: "/reportes",
        etiqueta: "Reportes",
        icono: FileText,
        permiso: { modulo: "reportes", accion: "ver" },
    },
    {
        ruta: "/calendario",
        etiqueta: "Calendario",
        icono: Calendar,
        siempre: true,
    },
    {
        ruta: "/usuarios",
        etiqueta: "Usuarios",
        icono: UserCog,
        soloGestor: true,
    },
];

export default function Layout({ children }) {
    const { usuario, logout } = useAuth();
    const navegar = useNavigate();
    const ubicacion = useLocation();
    const [menuMovil, setMenuMovil] = useState(false);

    const itemsVisibles = MENU_ITEMS.filter(item => {
        if (item.siempre) return true;
        if (item.soloGestor) return puedeGestionarUsuarios(usuario);
        if (item.permiso) return tienePermiso(usuario, item.permiso.modulo, item.permiso.accion);
        return false;
    });

    const cerrarSesion = () => {
        logout();
        navegar("/");
    };

    const SidebarContenido = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
                <img
                    src="/logo.png"
                    alt="Villa Yaiza"
                    className="w-9 h-9 object-contain rounded-lg"
                />
                <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">
                        Villa Yaiza
                    </p>
                    <p className="text-xs text-gray-400">Gestión</p>
                </div>
            </div>

            {/* Info usuario */}
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FFFBEB]">
                    <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center
                                    justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                            {usuario?.username?.[0]?.toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                            {usuario?.first_name || usuario?.username}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                            {usuario?.rol}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {itemsVisibles.map(item => {
                    const Icono = item.icono;
                    const activo = ubicacion.pathname === item.ruta ||
                        (item.ruta !== "/dashboard" &&
                            ubicacion.pathname.startsWith(item.ruta));

                    return (
                        <button
                            key={item.ruta}
                            onClick={() => {
                                navegar(item.ruta);
                                setMenuMovil(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                text-sm font-medium transition-all duration-150
                                ${activo
                                    ? "bg-[#F5A623] text-[#1A1A1A] shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                        >
                            <Icono className={`w-4 h-4 flex-shrink-0
                                ${activo ? "text-[#1A1A1A]" : "text-gray-400"}`} />
                            <span className="flex-1 text-left">{item.etiqueta}</span>
                            {activo && (
                                <ChevronRight className="w-3.5 h-3.5 text-[#1A1A1A]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Cerrar sesión */}
            <div className="px-3 py-4 border-t border-gray-100">
                <button
                    onClick={cerrarSesion}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                               text-sm font-medium text-red-500 hover:bg-red-50
                               transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* Sidebar desktop */}
            <aside className="hidden lg:flex w-56 bg-white border-r border-gray-100
                              flex-col flex-shrink-0">
                <SidebarContenido />
            </aside>

            {/* Sidebar móvil */}
            <AnimatePresence>
                {menuMovil && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuMovil(false)}
                            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -224 }}
                            animate={{ x: 0 }}
                            exit={{ x: -224 }}
                            transition={{ type: "tween", duration: 0.25 }}
                            className="fixed left-0 top-0 bottom-0 z-50 w-56 bg-white
                                       shadow-xl lg:hidden"
                        >
                            <SidebarContenido />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header móvil */}
                <header className="lg:hidden flex items-center gap-3 px-4 py-3
                                   bg-white border-b border-gray-100">
                    <button
                        onClick={() => setMenuMovil(true)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <img src="/logo.png" alt="Villa Yaiza"
                        className="w-7 h-7 object-contain" />
                    <span className="font-bold text-gray-800 text-sm">Villa Yaiza</span>
                    <button
                        onClick={() => setMenuMovil(false)}
                        className="ml-auto p-2 rounded-xl hover:bg-gray-100"
                    >
                        {menuMovil
                            ? <X className="w-5 h-5 text-gray-600" />
                            : null}
                    </button>
                </header>

                {/* Área de scroll */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};