import { KokoroComponent } from "@/lib/main";
import Header from "./Header";

function App() {
  const workerScriptUrl = new URL("./worker.js", import.meta.url).href;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
      <Header />

      <KokoroComponent workerUrl={workerScriptUrl} />
    </div>
  );
}

export default App;
