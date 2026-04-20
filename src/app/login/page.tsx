"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./login.module.css";

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
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (!result) {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
        return;
      }

      if (result.error) {
        // Mapeamos errores técnicos a mensajes amigables
        const errorMessages: Record<string, string> = {
          CredentialsSignin: "Email o contraseña incorrectos.",
          "No se encontró el usuario": "Email o contraseña incorrectos.",
          "Contraseña incorrecta": "Email o contraseña incorrectos.",
        };
        setError(errorMessages[result.error] ?? "Error al iniciar sesión. Intenta de nuevo.");
        return;
      }

      if (result.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Error de conexión. Verifica tu red e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Background effects */}
      <div className={styles.loginBgPattern} />
      <div className={`${styles.loginBgGlow} ${styles.loginBgGlow1}`} />
      <div className={`${styles.loginBgGlow} ${styles.loginBgGlow2}`} />
      <div className={`${styles.loginBgGlow} ${styles.loginBgGlow3}`} />

      <div className={`${styles.loginCard} ${styles.animateScaleIn}`}>
        {/* Logo / Header */}
        <div className={styles.loginHeader}>
          <div className={styles.loginLogo}>
            <Image
              src="/logo.png"
              alt="Arte Capital - Precisión Creativa"
              width={120}
              height={120}
              priority
              style={{ objectFit: "contain", filter: "drop-shadow(0 0 15px rgba(0, 180, 216, 0.3))" }}
            />
          </div>
          <h1 className={styles.loginTitle}>Arte Capital</h1>
          <p className={styles.loginSubtitle}>Precisión Creativa — Panel de Administración</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
          {error && (
            <div className={`${styles.loginError} ${styles.animateFadeIn}`} role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zM8 11a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              {error}
            </div>
          )}

          <div className={styles.loginField}>
            <label htmlFor="login-email" className={styles.loginLabel}>
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@artecapital.com"
              className={styles.loginInput}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className={styles.loginField}>
            <label htmlFor="login-password" className={styles.loginLabel}>
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={styles.loginInput}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.loginButton}
            id="btn-login-submit"
          >
            {loading ? (
              <span className={styles.loginSpinner} aria-label="Cargando..." />
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <p className={styles.loginFooter}>
          Arte Capital — Sistema de Administración v1.0
        </p>
      </div>
    </div>
  );
}
