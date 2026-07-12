"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Tema = "light" | "dark";

interface ThemeContextValue {
  readonly tema: Tema;
  readonly alternarTema: () => void;
}

interface ThemeProviderProps {
  readonly children: ReactNode;
}

const CHAVE_TEMA = "vroom-autostore-tema";

const ThemeContext =
  createContext<ThemeContextValue | null>(null);

function obterTemaDocumento(): Tema {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.classList.contains(
    "dark",
  )
    ? "dark"
    : "light";
}

export default function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [tema, setTema] =
    useState<Tema>("light");

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setTema(obterTemaDocumento());
    }, 0);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, []);

  const alternarTema = useCallback((): void => {
    setTema((temaAtual) => {
      const novoTema: Tema =
        temaAtual === "light"
          ? "dark"
          : "light";

      document.documentElement.classList.toggle(
        "dark",
        novoTema === "dark",
      );

      document.documentElement.style.colorScheme =
        novoTema;

      window.localStorage.setItem(
        CHAVE_TEMA,
        novoTema,
      );

      return novoTema;
    });
  }, []);

  const valorContexto = useMemo(
    () => ({
      tema,
      alternarTema,
    }),
    [tema, alternarTema],
  );

  return (
    <ThemeContext.Provider value={valorContexto}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const contexto = useContext(ThemeContext);

  if (!contexto) {
    throw new Error(
      "useTheme deve ser utilizado dentro de ThemeProvider.",
    );
  }

  return contexto;
}