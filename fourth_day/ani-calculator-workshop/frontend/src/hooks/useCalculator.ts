import { useEffect, useState } from "react";
import { calculate } from "../calculatorApi";

export type CalculatorStatus = "idle" | "result" | "error";

const OPERATORS = ["+", "-", "*", "/"];

const KEY_TO_LABEL: Record<string, string> = {
  Enter: "=",
  "=": "=",
  Backspace: "⌫",
  Escape: "C"
};

export function useCalculator() {
  const [formula, setFormula] = useState("");
  const [display, setDisplay] = useState("0");
  const [status, setStatus] = useState<CalculatorStatus>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);

  function startFresh(token: string) {
    setFormula(token);
    setDisplay(token);
    setStatus("idle");
    setLastResult(null);
  }

  function continueFromResult(token: string) {
    const next = `${lastResult}${token}`;
    setFormula(next);
    setDisplay(next);
    setStatus("idle");
    setLastResult(null);
  }

  function appendToken(token: string) {
    if (status === "result" && OPERATORS.includes(token) && lastResult !== null) {
      continueFromResult(token);
      return;
    }
    if (status !== "idle") {
      startFresh(token);
      return;
    }
    const next = formula + token;
    setFormula(next);
    setDisplay(next);
  }

  function clear() {
    setFormula("");
    setDisplay("0");
    setStatus("idle");
    setLastResult(null);
  }

  function backspace() {
    if (status !== "idle") {
      clear();
      return;
    }
    const next = formula.slice(0, -1);
    setFormula(next);
    setDisplay(next || "0");
  }

  async function equals() {
    if (!formula.trim() || isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await calculate(formula);
      setDisplay(response.formattedExpression);
      setStatus("result");
      setLastResult(response.result);
    } catch (error) {
      setDisplay(error instanceof Error ? error.message : "The request could not be processed.");
      setStatus("error");
      setLastResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  function press(label: string) {
    if (label === "C") {
      clear();
      return;
    }
    if (label === "⌫") {
      backspace();
      return;
    }
    if (label === "=") {
      void equals();
      return;
    }
    appendToken(label);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const label = KEY_TO_LABEL[event.key] ?? (/^[0-9+\-*/()]$/.test(event.key) ? event.key : null);
      if (!label) {
        return;
      }
      event.preventDefault();
      press(label);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return { display, status, isLoading, press };
}
