import type { CalculatorStatus } from "../hooks/useCalculator";

interface ScreenProps {
  status: CalculatorStatus;
  display: string;
  isLoading: boolean;
}

export function Screen({ status, display, isLoading }: ScreenProps) {
  return (
    <div className={`screen screen--${status}`}>
      <div className="screen__text">{isLoading ? "..." : display}</div>
    </div>
  );
}
