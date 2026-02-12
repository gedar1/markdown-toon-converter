import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { ParseError, ParseWarning } from "@app-types/parser.types";

interface AppState {
  content: string;
  previewMode: "toon" | "html" | "json";
  validationErrors: ParseError[];
  validationWarnings: ParseWarning[];
  tableCount: number;
}

interface AppContextType extends AppState {
  setContent: (content: string) => void;
  setPreviewMode: (mode: "toon" | "html" | "json") => void;
  setValidation: (
    errors: ParseError[],
    warnings: ParseWarning[],
    tableCount: number,
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    content: "",
    previewMode: "toon",
    validationErrors: [],
    validationWarnings: [],
    tableCount: 0,
  });

  const setContent = useCallback((content: string) => {
    setState((prev) => ({ ...prev, content }));
  }, []);

  const setPreviewMode = useCallback((mode: "toon" | "html" | "json") => {
    setState((prev) => ({ ...prev, previewMode: mode }));
  }, []);

  const setValidation = useCallback(
    (errors: ParseError[], warnings: ParseWarning[], tableCount: number) => {
      setState((prev) => ({
        ...prev,
        validationErrors: errors,
        validationWarnings: warnings,
        tableCount,
      }));
    },
    [],
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        setContent,
        setPreviewMode,
        setValidation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
