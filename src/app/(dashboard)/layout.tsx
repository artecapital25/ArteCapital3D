"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Truck,
  ShoppingCart,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Printer,
  Beaker,
  Wrench,
  UserCog,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: <Users size={20} />,
  },
  {
    label: "Inventario",
    href: "/inventario",
    icon: <Package size={20} />,
    children: [
      { label: "Resinas", href: "/inventario/resinas", icon: <Beaker size={18} /> },
      { label: "Insumos", href: "/inventario/insumos", icon: <Package size={18} /> },
    ],
  },
  {
    label: "Cotizaciones",
    href: "/cotizaciones",
    icon: <FileText size={20} />,
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: <Truck size={20} />,
  },
  {
    label: "Órdenes de Compra",
    href: "/ordenes-compra",
    icon: <ShoppingCart size={20} />,
  },
  {
    label: "Maestros",
    href: "/maestros",
    icon: <Settings size={20} />,
    children: [
      { label: "Maquinaria", href: "/maestros/maquinaria", icon: <Printer size={18} /> },
      { label: "Personal", href: "/maestros/personal", icon: <UserCog size={18} /> },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Image
              src="/logo.png"
              alt="Arte Capital"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
            <div className="sidebar-logo-text">
              <span className="sidebar-brand">Arte Capital</span>
              <span className="sidebar-version">Precisión Creativa</span>
            </div>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.label} className="nav-group">
              {item.children ? (
                <>
                  <button
                    className={`nav-item nav-parent ${
                      isActive(item.href) ? "nav-active" : ""
                    }`}
                    onClick={() => toggleExpanded(item.label)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`nav-chevron ${
                        expandedItems.includes(item.label) ? "nav-chevron-open" : ""
                      }`}
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
                    <div className="nav-children animate-fade-in">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`nav-item nav-child ${
                            isActive(child.href) ? "nav-active" : ""
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="nav-icon">{child.icon}</span>
                          <span className="nav-label">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`nav-item ${
                    isActive(item.href) ? "nav-active" : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">
                {session?.user?.name || "Admin"}
              </span>
              <span className="sidebar-user-role">
                {(session?.user as { role?: string })?.role || "ADMIN"}
              </span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={() => signOut()} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <div className="top-bar-breadcrumb">
            <Wrench size={14} />
            <span>{getBreadcrumb(pathname)}</span>
          </div>
          <div className="top-bar-right">
            <span className="top-bar-greeting">
              Hola, {session?.user?.name?.split(" ")[0] || "Admin"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">{children}</div>
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        /* ========== SIDEBAR ========== */
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-overlay {
          display: none;
        }

        .sidebar-close-btn {
          display: none;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 40;
          }
          .sidebar-close-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: var(--radius-sm);
          }
          .sidebar-close-btn:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.05);
          }
        }

        .sidebar-header {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-logo-text {
          display: flex;
          flex-direction: column;
        }

        .sidebar-brand {
          font-size: 1.125rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .sidebar-version {
          font-size: 0.625rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* ========== NAVIGATION ========== */
        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.15s ease;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          font-family: inherit;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
        }

        .nav-active {
          background: rgba(0, 180, 216, 0.1) !important;
          color: var(--accent-primary) !important;
        }

        .nav-active .nav-icon {
          color: var(--accent-primary);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          color: var(--text-muted);
          transition: color 0.15s ease;
        }

        .nav-label {
          flex: 1;
        }

        .nav-chevron {
          transition: transform 0.2s ease;
          color: var(--text-muted);
        }

        .nav-chevron-open {
          transform: rotate(180deg);
        }

        .nav-children {
          padding-left: 0.5rem;
        }

        .nav-child {
          padding-left: 2.25rem;
          font-size: 0.8125rem;
        }

        /* ========== USER SECTION ========== */
        .sidebar-user {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          color: white;
        }

        .sidebar-user-details {
          display: flex;
          flex-direction: column;
        }

        .sidebar-user-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .sidebar-user-role {
          font-size: 0.6875rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }

        .sidebar-logout:hover {
          color: var(--accent-danger);
          background: rgba(239, 68, 68, 0.1);
        }

        /* ========== MAIN CONTENT ========== */
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0;
          }
        }

        .top-bar {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.5rem;
          background: rgba(8, 8, 16, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
        }

        .mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
        }

        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: flex;
          }
        }

        .mobile-menu-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .top-bar-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .top-bar-greeting {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .page-content {
          flex: 1;
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

function getBreadcrumb(pathname: string): string {
  const segments: Record<string, string> = {
    "/": "Dashboard",
    "/clientes": "Clientes",
    "/inventario": "Inventario",
    "/inventario/resinas": "Inventario / Resinas",
    "/inventario/insumos": "Inventario / Insumos",
    "/cotizaciones": "Cotizaciones",
    "/pedidos": "Pedidos",
    "/ordenes-compra": "Órdenes de Compra",
    "/maestros": "Maestros",
    "/maestros/maquinaria": "Maestros / Maquinaria",
    "/maestros/personal": "Maestros / Personal",
  };
  return segments[pathname] || "Arte Capital";
}
