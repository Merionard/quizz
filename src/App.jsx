import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Login from "./components/login";
import Quiz from "./components/quiz";
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (checkingAuth) return <div>Chargement...</div>;

  return user ? (
    <Quiz onLogout={() => setUser(null)} />
  ) : (
    <Login
      onLogin={(u) => {
        setUser(u);
      }}
    />
  );
}

export default App;
