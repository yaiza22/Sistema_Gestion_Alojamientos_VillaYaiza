import RutasApp from "./router/RutasApp";
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <RutasApp />
    </AuthProvider>
  );
}

export default App;