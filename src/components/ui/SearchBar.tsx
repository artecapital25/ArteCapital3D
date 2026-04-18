"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  paramName?: string;
}

export default function SearchBar({
  placeholder = "Buscar...",
  paramName = "q",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get(paramName) || "");

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set(paramName, value.trim());
      } else {
        params.delete(paramName);
      }
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams, paramName]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, updateSearch]);

  return (
    <div className="search-bar">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label="Buscar"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="search-clear"
          aria-label="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}

      <style jsx>{`
        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          max-width: 320px;
          width: 100%;
        }

        .search-bar :global(.search-icon) {
          position: absolute;
          left: 0.75rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 2rem 0.5rem 2.25rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.8125rem;
          font-family: inherit;
          transition: all 0.2s;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.12);
        }

        .search-clear {
          position: absolute;
          right: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          border-radius: 50%;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .search-clear:hover {
          background: rgba(255, 255, 255, 0.12);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
