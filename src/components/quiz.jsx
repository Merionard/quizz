// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import questionsData from "../data/questions.json";
import { jaccardSimilarity } from "../utils/compare"; // Tes questions au format [{ question: "", answer: "" }]

function isAnswerCloseEnough(input, correct, threshold = 0.6) {
  return jaccardSimilarity(input, correct) >= threshold;
}

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [incorrectQueue, setIncorrectQueue] = useState([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const shuffled = [...questionsData].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrent(shuffled[0]);
  }, []);

  function proceedToNext(questionsList, incorrectList) {
    let next = null;

    if (questionsList.length > 0) {
      next = questionsList[0];
    } else if (incorrectList.length > 0) {
      next = incorrectList[0];
      incorrectList = incorrectList.slice(1);
      setIncorrectQueue(incorrectList);
    }

    if (next) {
      setCurrent(next);
      setAnswer("");
      setFeedback(null);
    } else {
      setCompleted(true);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!current) return;

    const isCorrect = isAnswerCloseEnough(answer, current.answer);
    let newIncorrectQueue = [...incorrectQueue];
    let newQuestions = [...questions];

    if (isCorrect) {
      setFeedback({ type: "correct", text: "✅ Bonne réponse !" });

      // Supprime de la file des incorrectes si présente
      newIncorrectQueue = newIncorrectQueue.filter(
        (q) => q.question !== current.question
      );

      // Met à jour les files immédiatement
      newQuestions = newQuestions.filter(
        (q) => q.question !== current.question
      );
      setIncorrectQueue(newIncorrectQueue);
      setQuestions(newQuestions);

      // Avancer automatiquement après 1,5 sec
      setTimeout(() => {
        proceedToNext(newQuestions, newIncorrectQueue);
      }, 1500);
    } else {
      setFeedback({
        type: "incorrect",
        text: `❌ Mauvaise réponse. La bonne réponse était : ${current.answer}`,
      });

      // Ajouter à la file si pas déjà dedans
      if (!newIncorrectQueue.some((q) => q.question === current.question)) {
        newIncorrectQueue.push(current);
      }

      // Supprimer la question du tableau principal (elle sera réutilisée)
      newQuestions = newQuestions.filter(
        (q) => q.question !== current.question
      );

      // Mise à jour des queues
      setIncorrectQueue(newIncorrectQueue);
      setQuestions(newQuestions);
    }
  }

  if (completed) {
    function restartQuiz() {
      const reshuffled = [...questionsData].sort(() => Math.random() - 0.5);
      setQuestions(reshuffled);
      setCurrent(reshuffled[0]);
      setIncorrectQueue([]);
      setCompleted(false);
      setFeedback(null);
      setAnswer("");
    }
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 text-center bg-green-50 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-green-700 mb-4">🎉 Bravo !</h2>
        <p className="text-gray-700 text-lg">
          Vous avez bien répondu à toutes les questions.
        </p>
        <button
          onClick={restartQuiz}
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          🔄 Recommencer le quiz
        </button>
      </div>
    );
  }

  return (
    <motion.div
      key={current?.question}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">📝 Question :</h2>

      <div className="text-lg font-medium text-gray-900">
        {current?.question}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Votre réponse..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Valider
        </button>
      </form>

      {feedback && (
        <motion.div
          key={feedback.text}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl font-medium space-y-4 transition ${
            feedback.type === "correct"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <p>{feedback.text}</p>

          {feedback.type === "incorrect" && (
            <button
              onClick={() => proceedToNext(questions, incorrectQueue)}
              className="mt-2 w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
            >
              Continuer
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
