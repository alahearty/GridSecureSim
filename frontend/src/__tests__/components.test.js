import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import CircuitBreaker from '../components/CircuitBreaker';
import ErrorBoundary from '../ErrorBoundary';

const theme = createTheme({ palette: { mode: 'dark' } });

function wrap(ui) {
  return (
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
}

const STATS = {
  totalAlerts: 5, activeAlerts: 2, totalTrades: 10, dailyVolume: '1500.0',
  highSeverityAlerts: 1, mediumSeverityAlerts: 2, lowSeverityAlerts: 2,
  completedTrades: 8, pendingTrades: 1, failedTrades: 1,
  averageTradeSize: '150.0', averagePrice: '12.5', totalGasUsed: '210000',
  networkHealth: 'Good', lastUpdate: new Date().toISOString(),
};

// ── Navigation ──────────────────────────────────────────────────────

describe('Navigation', () => {
  it('renders app title', () => {
    render(wrap(<Navigation circuitBreakerState="Normal" stats={STATS} />));
    expect(screen.getByText('GridSecureSim')).toBeInTheDocument();
  });

  it('renders all menu items', () => {
    render(wrap(<Navigation circuitBreakerState="Normal" stats={STATS} />));
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('Trades')).toBeInTheDocument();
    expect(screen.getByText('Circuit Breaker')).toBeInTheDocument();
  });

  it('shows circuit breaker state chip', () => {
    render(wrap(<Navigation circuitBreakerState="Emergency" stats={STATS} />));
    expect(screen.getByText('Emergency')).toBeInTheDocument();
  });
});

// ── Dashboard ───────────────────────────────────────────────────────

describe('Dashboard', () => {
  it('renders stat cards', () => {
    render(wrap(<Dashboard alerts={[]} trades={[]} stats={STATS} />));
    expect(screen.getByText('Total Alerts')).toBeInTheDocument();
    expect(screen.getByText('Total Trades')).toBeInTheDocument();
  });

  it('shows empty chart message when no trades', () => {
    render(wrap(<Dashboard alerts={[]} trades={[]} stats={STATS} />));
    expect(screen.getByText(/no trading data/i)).toBeInTheDocument();
  });
});

// ── CircuitBreaker ──────────────────────────────────────────────────

describe('CircuitBreaker', () => {
  it('displays current state', () => {
    render(wrap(<CircuitBreaker state="Normal" onTrigger={jest.fn()} stats={STATS} />));
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('renders action button', () => {
    render(wrap(<CircuitBreaker state="Normal" onTrigger={jest.fn()} stats={STATS} />));
    expect(screen.getByRole('button', { name: /trigger/i })).toBeInTheDocument();
  });
});

// ── ErrorBoundary ───────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  const Bomb = () => { throw new Error('boom'); };

  beforeEach(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { console.error.mockRestore(); });

  it('renders children when no error', () => {
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary><div>OK</div></ErrorBoundary>
      </ThemeProvider>
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('catches errors and shows fallback UI', () => {
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary><Bomb /></ErrorBoundary>
      </ThemeProvider>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
