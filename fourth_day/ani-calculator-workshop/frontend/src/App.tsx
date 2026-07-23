import "./App.css";
import { Keypad } from "./components/Keypad";
import { Screen } from "./components/Screen";
import { useCalculator } from "./hooks/useCalculator";

function App() {
  const { display, status, isLoading, press } = useCalculator();

  return (
    <div className="pixel-frame">
      <Screen status={status} display={display} isLoading={isLoading} />
      <Keypad onPress={press} disabled={isLoading} />
    </div>
  );
}

export default App;
