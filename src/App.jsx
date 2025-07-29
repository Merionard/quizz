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

  if (checkingAuth)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium text-lg">Chargement...</p>
        </div>
      </div>
    );

  return user ? (
    <Quiz />
  ) : (
    <Login
      onLogin={(u) => {
        setUser(u);
      }}
    />
  );
}

export default App;
