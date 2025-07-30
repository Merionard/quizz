import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import questionsData from "../data/questions.json";
import { jaccardSimilarity } from "../utils/compare";

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
  const [totalCount, setTotalCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(1);

  useEffect(() => {
    const shuffled = [...questionsData].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrent(shuffled[0]);
    setTotalCount(shuffled.length);
    setCurrentIndex(1);
  }, []);

  function proceedToNext(questionsList, incorrectList, isCorrect) {
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
      if (isCorrect) {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      setCompleted(true);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!current) return;

    const isCorrect =
      current.type === "multiple"
        ? answer === current.answer
        : isAnswerCloseEnough(answer, current.answer);

    let newIncorrectQueue = [...incorrectQueue];
    let newQuestions = [...questions];

    if (isCorrect) {
      setFeedback({ type: "correct", text: "✅ Bonne réponse !" });
      newIncorrectQueue = newIncorrectQueue.filter(
        (q) => q.question !== current.question
      );
      newQuestions = newQuestions.filter(
        (q) => q.question !== current.question
      );
      setIncorrectQueue(newIncorrectQueue);
      setQuestions(newQuestions);
      setTimeout(() => {
        proceedToNext(newQuestions, newIncorrectQueue, isCorrect);
      }, 1500);
    } else {
      setFeedback({
        type: "incorrect",
        text: `❌ Mauvaise réponse. La bonne réponse était : ${current.answer}`,
      });

      if (!newIncorrectQueue.some((q) => q.question === current.question)) {
        newIncorrectQueue.push(current);
      }

      newQuestions = newQuestions.filter(
        (q) => q.question !== current.question
      );
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
      setCurrentIndex(1);
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

  const answeredCount = totalCount - questions.length - incorrectQueue.length;
  const progress = Math.min(answeredCount / totalCount, 1);

  return (
    <motion.section
      key={current?.question}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6"
    >
      <div className="w-full sm:max-w-xl bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
        {/* Compteur + Progression */}
        <div className="space-y-2">
          <div className="text-right text-sm text-gray-500">
            Question {currentIndex} / {totalCount}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          📝 Question :
        </h2>

        <div className="text-base sm:text-lg font-medium text-gray-900">
          {current?.question}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {current?.type === "multiple" ? (
            <div className="space-y-2">
              {current?.choices.map((choice) => (
                <label
                  key={choice}
                  className={`block border p-3 rounded-lg cursor-pointer ${
                    answer === choice
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={choice}
                    checked={answer === choice}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="hidden"
                  />
                  {choice}
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Votre réponse..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              autoFocus
            />
          )}

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
                className="w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
              >
                Continuer
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
