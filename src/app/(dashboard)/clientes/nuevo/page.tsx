"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import { crearCliente } from "@/app/actions/clientes";

export default function ClienteNuevoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError("");

    const formData = new FormData(e.currentTarget);
    const result = await crearCliente(formData);

    if (result.success) {
      router.push("/clientes");
      router.refresh();
    } else {
      if (result.errors) setErrors(result.errors);
      if (result.message) setGeneralError(result.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/clientes" className="back-link">
        <ArrowLeft size={16} />
        Volver a clientes
      </Link>

      <h1 className="page-title">Nuevo Cliente</h1>
      <p className="page-subtitle">
        Completa la información para registrar un nuevo cliente
      </p>

      <div className="form-card">
        {generalError && (
          <div className="form-general-error animate-fade-in">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormField
              label="Código"
              name="codigo"
              placeholder="CLI-004"
              required
              error={errors.codigo}
              helpText="Identificador único del cliente"
            />
            <FormField
              label="Nombre"
              name="nombre"
              placeholder="Nombre completo o razón social"
              required
              error={errors.nombre}
            />
            <FormField
              label="NIT"
              name="nit"
              placeholder="900123456-7"
              error={errors.nit}
            />
            <FormField
              label="Teléfono"
              name="telefono"
              type="tel"
              placeholder="3001234567"
              error={errors.telefono}
            />
            <FormField
              label="Correo electrónico"
              name="correo"
              type="email"
              placeholder="contacto@ejemplo.com"
              error={errors.correo}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <FormField
              label="Información adicional"
              name="informacion"
              type="textarea"
              placeholder="Notas sobre el cliente, preferencias, etc."
              error={errors.informacion}
            />
          </div>

          <div className="form-actions">
            <SubmitButton
              loading={loading}
              text="Crear cliente"
              loadingText="Creando..."
              fullWidth={false}
            />
          </div>
        </form>
      </div>

      <style jsx>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.8125rem;
          font-weight: 500;
          margin-bottom: 1rem;
          transition: color 0.15s;
        }
        .back-link:hover {
          color: var(--accent-primary);
        }
        .page-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-top: 0.25rem;
          margin-bottom: 1.5rem;
        }
        .form-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          max-width: 720px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
        .form-actions {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }
        .form-general-error {
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #fca5a5;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
