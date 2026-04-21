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
import styles from "./dashboard.module.css";

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
    <div className={styles.dashboardLayout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <Image
              src="/logo1.png"
              alt="Arte Capital"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div className={styles.sidebarLogoText}>
              <span className={styles.sidebarBrand}>Arte Capital</span>
              <span className={styles.sidebarVersion}>Precisión Creativa</span>
            </div>
          </div>
          <button
            className={styles.sidebarCloseBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <div key={item.label} className={styles.navGroup}>
              {item.children ? (
                <>
                  <button
                    className={`${styles.navItem} ${styles.navParent} ${
                      isActive(item.href) ? styles.navActive : ""
                    }`}
                    onClick={() => toggleExpanded(item.label)}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`${styles.navChevron} ${
                        expandedItems.includes(item.label) ? styles.navChevronOpen : ""
                      }`}
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
                    <div className={`${styles.navChildren} animate-fade-in`}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`${styles.navItem} ${styles.navChild} ${
                            isActive(child.href) ? styles.navActive : ""
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className={styles.navIcon}>{child.icon}</span>
                          <span className={styles.navLabel}>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${
                    isActive(item.href) ? styles.navActive : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarUserInfo}>
            <div className={styles.sidebarAvatar}>
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className={styles.sidebarUserDetails}>
              <span className={styles.sidebarUserName}>
                {session?.user?.name || "Admin"}
              </span>
              <span className={styles.sidebarUserRole}>
                {(session?.user as { role?: string })?.role || "ADMIN"}
              </span>
            </div>
          </div>
          <button
            className={styles.sidebarLogout}
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.mainContent}>
        {/* Top bar */}
        <header className={styles.topBar}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <div className={styles.topBarBreadcrumb}>
            <Wrench size={14} />
            <span>{getBreadcrumb(pathname)}</span>
          </div>
          <div className={styles.topBarRight}>
            <span className={styles.topBarGreeting}>
              Hola, {session?.user?.name?.split(" ")[0] || "Admin"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}
