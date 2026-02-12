/**
 * Services Context
 * Provides singleton instances of parsers, converters, and services
 * to all components in the application.
 */

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { ToonParserImpl } from '../shared/parsers/ToonParserImpl';
import { MarkdownParserImpl } from '../shared/parsers/MarkdownParserImpl';
import { ConverterImpl } from '../shared/converters/ConverterImpl';
import { TokenMetricsServiceImpl } from '../services/TokenMetricsServiceImpl';
import type { ToonParser } from '../shared/parsers/ToonParser';
import type { MarkdownParser } from '../shared/parsers/MarkdownParser';
import type { Converter } from '../shared/converters/Converter';
import type { TokenMetricsService } from '../services/TokenMetrics';

interface Services {
  toonParser: ToonParser;
  markdownParser: MarkdownParser;
  converter: Converter;
  tokenMetricsService: TokenMetricsService;
}

const ServicesContext = createContext<Services | null>(null);

interface ServicesProviderProps {
  children: ReactNode;
}

export const ServicesProvider = ({ children }: ServicesProviderProps) => {
  // Create singleton instances once
  const services = useMemo<Services>(() => ({
    toonParser: new ToonParserImpl(),
    markdownParser: new MarkdownParserImpl(),
    converter: new ConverterImpl(),
    tokenMetricsService: new TokenMetricsServiceImpl(),
  }), []);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export const useServices = (): Services => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};
