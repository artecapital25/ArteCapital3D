# Arte Capital Admin System

<p align="center">
  <strong>Sistema de Gestión de Impresión 3D</strong>
</p>

## Descripción del Proyecto

Arte Capital Admin System es una aplicación web Full-Stack moderna diseñada para gestionar de manera integral el negocio de impresión 3D. Este proyecto representa la evolución del manejo de datos pasando de hojas de cálculo (Google Sheets) a una plataforma de administración robusta y escalable construida con **Next.js**.

El sistema se encarga de la gestión de inventario, seguimiento de clientes, control de datos maestros y reportes financieros, presentando un panel de control intuitivo con métricas en tiempo real.

## Características Principales

- 📊 **Dashboard y KPIs:** Visualización de métricas en tiempo real mediante gráficos interactivos con `Recharts`.
- 🗄️ **Gestión de CRUD Completa:** Módulos para administrar clientes, inventarios y datos maestros apoyados por validación fuerte utilizando `Zod`.
- 🔐 **Seguridad y Autenticación:** Sistema de acceso protegido mediante `NextAuth.js`, encriptación de contraseñas con `bcryptjs` y protección de rutas.
- 📄 **Exportación de Reportes:** Generación de facturas/reportes en formato PDF (`@react-pdf/renderer`) y exportables directamente a Excel (`xlsx`).
- 📱 **Progressive Web App (PWA):** Interfaz optimizada e instalable en dispositivos móviles para facilitar el fácil acceso.
- 📧 **Notificaciones/Correos:** Integración de notificaciones transaccionales usando `Resend`.

## Tecnologías Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) y componentes modernos (React 19).
- **Base de Datos:** PostgreSQL (alojada en Neon) controlada mediante el ORM [Prisma](https://www.prisma.io/).
- **Componentes UI/Iconos:** [Lucide React](https://lucide.dev/), `@tanstack/react-table` (para tablas de datos).

## Requisitos Previos

Asegúrate de tener instalados los siguientes requerimientos en tu entorno:

- Node.js (v18.x o superior)
- npm, yarn, pnpm o bun
- Una base de datos PostgreSQL (ej. Neon Tech)

## Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd admin-3d
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar el Entorno**
   Crea un archivo `.env` en la raíz del proyecto. Este archivo debe contener variables fundamentales como:
   ```env
   # Configuración de Base de Datos
   DATABASE_URL="postgresql://user:password@host/dbname?schema=public"

   # Secretos de NextAuth
   NEXTAUTH_SECRET="tu_secreto_super_seguro"
   NEXTAUTH_URL="http://localhost:3000"

   # Claves API
   RESEND_API_KEY="re_..."
   ```

4. **Configurar la Base de Datos (Prisma)**
   Genera el cliente y aplica las migraciones a tu base de datos:
   ```bash
   npm run db:push
   # o
   npm run db:migrate
   ```
   *Opcional*: Para popular la base de datos con información semilla:
   ```bash
   npm run db:seed
   ```

5. **Levantar el Servidor de Desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Comandos Útiles

- `npm run dev`: Inicia el servidor en modo desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor en modo producción.
- `npm run db:studio`: Abre una interfaz gráfica para administrar la base de datos Prisma.

## Despliegue

Este proyecto está optimizado para su despliegue a través de plataformas como **Vercel** o directamente utilizando proveedores de VPS. Asegúrate de configurar todas las variables de entorno (`.env`) en tu entorno de producción y ejecutar las migraciones de base de datos antes de hacer el *build*.
