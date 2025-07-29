import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { questions as allQuestions } from "../data/questions";
import { auth, db } from "../firebase";
import { jaccardSimilarity } from "../utils/compare";

export default function Quiz({ onLogout }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Tirage aléatoire des questions (ex: toutes ou 10 au hasard)
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 20));
  }, []);

  function handleChange(e, id) {
    setAnswers({ ...answers, [id]: e.target.value });
  }

  async function handleSubmit() {
    setLoading(true);
    // Calcul score basé sur similarité > 0.5
    let correctCount = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id] || "";
      if (jaccardSimilarity(userAnswer, q.answer) > 0.5) correctCount++;
    });
    setScore(correctCount);

    // Sauvegarder dans Firestore
    try {
      await addDoc(collection(db, "results"), {
        userId: auth.currentUser.uid,
        answers,
        score: correctCount,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Erreur sauvegarde :", e);
    }
    setLoading(false);
  }

  if (score !== null) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4">Résultat</h2>
        <p>
          Tu as obtenu {score} / {questions.length} bonnes réponses.
        </p>
        <button
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Recommencer
        </button>
        <button
          className="ml-4 mt-4 bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => auth.signOut().then(() => onLogout())}
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Quiz</h2>
      {questions.map((q, i) => (
        <div key={q.id} className="mb-6">
          <p className="font-semibold">
            {i + 1}. {q.question}
          </p>
          <input
            type="text"
            className="border p-2 w-full rounded mt-1"
            onChange={(e) => handleChange(e, q.id)}
            value={answers[q.id] || ""}
            placeholder="Tape ta réponse ici"
          />
        </div>
      ))}
      <button
        disabled={loading}
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? "Envoi..." : "Soumettre"}
      </button>
      <button
        className="ml-4 bg-red-600 text-white px-4 py-2 rounded"
        onClick={() => auth.signOut().then(() => onLogout())}
      >
        Déconnexion
      </button>
    </div>
  );
}
