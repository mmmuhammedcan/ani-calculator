const BUTTON_ROWS: string[][] = [
  ["(", ")", "C", "⌫"],
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", "=", "+"]
];

function buttonKind(label: string): string {
  if (label === "=") return "equals";
  if (label === "C" || label === "⌫") return "action";
  if (["+", "-", "*", "/", "(", ")"].includes(label)) return "operator";
  return "digit";
}

interface KeypadProps {
  onPress: (label: string) => void;
  disabled: boolean;
}

export function Keypad({ onPress, disabled }: KeypadProps) {
  return (
    <div className="pad">
      {BUTTON_ROWS.map((row) =>
        row.map((label) => (
          <button
            key={label}
            type="button"
            className={`pixel-button pixel-button--${buttonKind(label)}${
              label === "0" ? " pixel-button--wide" : ""
            }`}
            onClick={() => onPress(label)}
            disabled={disabled}
          >
            {label}
          </button>
        ))
      )}
    </div>
  );
}
