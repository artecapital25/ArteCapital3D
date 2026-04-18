"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background effects */}
      <div className="login-bg-pattern" />
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />
      <div className="login-bg-glow login-bg-glow-3" />

      <div className="login-card animate-scale-in">
        {/* Logo / Header */}
        <div className="login-header">
          <div className="login-logo">
            <Image
              src="/logo.png"
              alt="Arte Capital - Precisión Creativa"
              width={120}
              height={120}
              priority
              style={{ objectFit: "contain", filter: "drop-shadow(0 0 15px rgba(0, 180, 216, 0.3))" }}
            />
          </div>
          <h1 className="login-title">Arte Capital</h1>
          <p className="login-subtitle">Precisión Creativa — Panel de Administración</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error animate-fade-in">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zM8 11a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-email" className="login-label">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@artecapital.com"
              className="login-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <p className="login-footer">
          Arte Capital — Sistema de Administración v1.0
        </p>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 1rem;
        }

        .login-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(0, 180, 216, 0.06) 1px, transparent 1px);
          background-size: 30px 30px;
          z-index: 0;
        }

        .login-bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 0;
        }

        .login-bg-glow-1 {
          width: 400px;
          height: 400px;
          background: rgba(0, 180, 216, 0.25);
          top: -100px;
          right: -100px;
        }

        .login-bg-glow-2 {
          width: 350px;
          height: 350px;
          background: rgba(233, 30, 140, 0.2);
          bottom: -80px;
          left: -80px;
        }

        .login-bg-glow-3 {
          width: 200px;
          height: 200px;
          background: rgba(247, 127, 0, 0.15);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: linear-gradient(135deg, rgba(21, 21, 37, 0.95), rgba(14, 14, 26, 0.98));
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          display: inline-flex;
          margin-bottom: 0.75rem;
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: 0.8125rem;
          margin-top: 0.25rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #fca5a5;
          font-size: 0.875rem;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .login-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.9375rem;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .login-input::placeholder {
          color: var(--text-muted);
        }

        .login-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.15);
        }

        .login-button {
          width: 100%;
          padding: 0.875rem;
          background: var(--gradient-primary);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          margin-top: 0.5rem;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3), 0 4px 15px rgba(233, 30, 140, 0.2);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
