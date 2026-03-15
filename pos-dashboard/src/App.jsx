import { useState } from "react";
import POSDashboard from "./POSDashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [view, setView] = useState("admin");

  return view === "pos" ? (
    <POSDashboard onNavigate={setView} />
  ) : (
    <AdminDashboard onNavigate={setView} />
  );
}

export default App;
