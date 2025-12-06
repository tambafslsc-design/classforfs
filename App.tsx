import React, { useState, useEffect, useCallback } from 'react';
import { Category, LedgerAccount, AnswerHistory } from './types';
import { ACCOUNTS, shuffleAccounts } from './data/accounts';
import QuizButton from './components/QuizButton';
import Results from './components/Results';
import { Brain, CheckCircle2, XCircle, AlertTriangle, Timer } from 'lucide-react';

// Color mappings for buttons
const CATEGORY_COLORS: Record<Category, string> = {
  [Category.IS_SALES]: "bg-emerald-500",
  [Category.IS_COGS]: "bg-rose-500",
  [Category.IS_OTHER_REV]: "bg-emerald-600",
  [Category.IS_EXPENSES]: "bg-rose-600",
  [Category.SFP_NCA]: "bg-blue-600",
  [Category.SFP_CA]: "bg-blue-500",
  [Category.SFP_CAPITAL]: "bg-purple-600",
  [Category.SFP_NCL]: "bg-amber-600",
  [Category.SFP_CL]: "bg-amber-500",
};

type QuizLevel = 'FORM3' | 'DSE';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const App: React.FC = () => {
  const [questions, setQuestions] = useState<LedgerAccount[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [history, setHistory] = useState<AnswerHistory[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message?: string } | null>(null);
  const [autoNextTimer, setAutoNextTimer] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Level Selection State
  const [quizLevel, setQuizLevel] = useState<QuizLevel>('DSE');
  const [pendingLevel, setPendingLevel] = useState<QuizLevel | null>(null);
  const [showLevelConfirm, setShowLevelConfirm] = useState(false);

  // Initialize game on load (default to all accounts just in case, though user starts via button)
  useEffect(() => {
    setQuestions(shuffleAccounts(ACCOUNTS));
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    // Only count if game started AND no feedback is currently shown (i.e. user is thinking)
    if (gameStarted && !feedback) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, feedback]);

  const initiateLevelSelection = (level: QuizLevel) => {
    setPendingLevel(level);
    setShowLevelConfirm(true);
  };

  const confirmLevelSelection = () => {
    if (pendingLevel) {
      handleStart(pendingLevel);
      setShowLevelConfirm(false);
      setPendingLevel(null);
    }
  };

  const cancelLevelSelection = () => {
    setShowLevelConfirm(false);
    setPendingLevel(null);
  };

  const handleStart = (level?: QuizLevel) => {
    // If level is passed, update state, otherwise use existing state (for restart)
    const targetLevel = level || quizLevel;
    setQuizLevel(targetLevel);

    let pool = ACCOUNTS;
    if (targetLevel === 'FORM3') {
      pool = ACCOUNTS.filter(account => !account.excludeFromForm3);
    }

    setQuestions(shuffleAccounts(pool));
    setCurrentIdx(0);
    setHistory([]);
    setGameStarted(true);
    setFeedback(null);
    setElapsedTime(0);
    setAutoNextTimer(null);
  };

  const handleNext = useCallback(() => {
    setFeedback(null);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setGameStarted(false); // End game
    }
  }, [currentIdx, questions.length]);

  // Auto-advance timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (feedback) {
      // 2 seconds for correct answer (quick), 5 seconds for incorrect (time to read)
      const duration = feedback.isCorrect ? 2 : 5;
      setAutoNextTimer(duration);
      
      interval = setInterval(() => {
        setAutoNextTimer(prev => {
          if (prev === null) return null;
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
    } else {
      setAutoNextTimer(null);
    }
    return () => clearInterval(interval);
  }, [feedback]);

  // Trigger next when timer hits 0
  useEffect(() => {
    // Only trigger if timer is exactly 0 AND feedback is still present.
    // This prevents double-triggering because handleNext() sets feedback to null immediately.
    if (autoNextTimer === 0 && feedback) {
      handleNext();
    }
  }, [autoNextTimer, handleNext, feedback]);

  const handleAnswer = (category: Category) => {
    if (feedback) return; // Prevent double clicking

    const currentQuestion = questions[currentIdx];
    const isCorrect = currentQuestion.category === category;
    
    setHistory(prev => [...prev, {
      account: currentQuestion,
      userSelected: category,
      isCorrect,
      timestamp: Date.now()
    }]);

    setFeedback({
      isCorrect,
      message: isCorrect ? "Correct!" : `Incorrect. The correct classification is \n${currentQuestion.category}.`
    });
  };

  const currentQuestion = questions[currentIdx];
  const isFinished = !gameStarted && history.length > 0;
  // Use (currentIdx + 1) to show progress including the current question
  const progress = questions.length > 0 ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;
  
  const mistakes = history.filter(h => !h.isCorrect);

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <Results history={history} onRestart={() => handleStart()} totalTime={elapsedTime} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      
      {/* Level Confirmation Popup */}
      {showLevelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Confirm Level</h3>
              <p className="text-slate-600">
                Are you sure you want to start the <span className="font-bold text-indigo-600">{pendingLevel === 'FORM3' ? 'Form 3' : 'DSE Level'}</span> quiz?
              </p>
              
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={cancelLevelSelection}
                  className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLevelSelection}
                  className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Yes, Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-2 px-4 shadow-sm flex items-center justify-between sticky top-0 z-50 h-16">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Brain size={20} />
          </div>
          <h1 className="font-bold text-slate-800 text-lg hidden md:block">Mastering Classification of Accounts</h1>
          <h1 className="font-bold text-slate-800 text-lg md:hidden">HKDSE</h1>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-none flex justify-center w-auto px-2">
          {gameStarted && (
             <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap w-12 text-right">
                  {currentIdx + 1} / {questions.length}
                </span>
                <div className="w-24 md:w-40 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
             </div>
          )}
        </div>

        {/* Right: Timer */}
        <div className="flex items-center justify-end flex-1 gap-2">
          {gameStarted && (
            <div className="flex items-center gap-2 text-slate-600 font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg">
               <Timer size={18} />
               {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col justify-start pt-8">
        {!gameStarted ? (
          <div className="text-center max-w-lg mx-auto space-y-6 animate-fade-in-up mt-10">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Mastering Account Classifications in Financial Statements</h2>
            <p className="text-lg text-slate-600">
              Prepare for your exam by mastering the I/S and S/FP classifications for year ended 31 December 2025.
            </p>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
               <ul className="text-left space-y-3 text-slate-600 mb-6">
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18}/> 50+ Real HKDSE Accounts</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18}/> Performance Analytics</li>
               </ul>
               
               <div className="flex flex-col md:flex-row gap-4">
                 <button 
                  onClick={() => initiateLevelSelection('FORM3')}
                  className="flex-1 py-4 bg-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-600 hover:shadow-indigo-200/50 transition-all active:scale-95"
                >
                  Start Quiz<br/><span className="text-sm opacity-90 font-normal">for Form 3</span>
                </button>
                <button 
                  onClick={() => initiateLevelSelection('DSE')}
                  className="flex-1 py-4 bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-800 hover:shadow-indigo-200/50 transition-all active:scale-95"
                >
                   Start Quiz<br/><span className="text-sm opacity-90 font-normal">for DSE Level</span>
                </button>
               </div>
               
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            
            <p className="text-left text-slate-600 font-medium text-lg leading-relaxed max-w-3xl mx-auto">
              You are preparing the Income Statement for the year ended 31 December 2025<br />
              and the Statement of Financial Position as at the same date.
            </p>

            <p className="text-left text-slate-600 font-medium text-lg leading-relaxed max-w-3xl mx-auto">
              State the correct position of the following account:
            </p>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 text-center relative overflow-hidden min-h-[100px] flex flex-col items-center justify-center">
                 <h2 className="text-3xl md:text-4xl font-black text-slate-800 break-words max-w-full">
                {currentQuestion.name}
              </h2>
              {currentQuestion.hint && !feedback && (
                 <p className="text-slate-400 text-sm mt-3 italic">Hint: {currentQuestion.hint}</p>
              )}
              
              {/* Feedback Overlay */}
              {feedback && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-8 py-2 animate-fade-in z-20">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full shrink-0 ${feedback.isCorrect ? 'bg-emerald-50 text-emerald-400' : 'bg-rose-50 text-rose-400'}`}>
                      {feedback.isCorrect ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold whitespace-pre-line text-left ${feedback.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {feedback.message}
                    </h3>
                  </div>
                  
                  {/* Auto-advance Timer Information */}
                  <div className="flex flex-col items-center justify-center min-w-[80px] text-center px-4">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Next in</span>
                     <span className="text-3xl font-black text-indigo-600 leading-none">{autoNextTimer}s</span>
                  </div>
                </div>
              )}
            </div>

            {/* Answer Groups */}
            <div className="space-y-6">
              {/* Income Statement Group - 30% Height */}
              <div>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Income Statement</div>
                 <div className="grid grid-cols-4 gap-2">
                    <QuizButton className="h-8 md:h-10 p-1" category={Category.IS_SALES} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.IS_SALES]} />
                    <QuizButton className="h-8 md:h-10 p-1" category={Category.IS_COGS} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.IS_COGS]} />
                    <QuizButton className="h-8 md:h-10 p-1" category={Category.IS_OTHER_REV} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.IS_OTHER_REV]} />
                    <QuizButton className="h-8 md:h-10 p-1" category={Category.IS_EXPENSES} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.IS_EXPENSES]} />
                 </div>
              </div>

              {/* S/FP Group - 50% Height */}
              <div>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Statement of Financial Position</div>
                 <div className="grid grid-cols-5 gap-2">
                    <QuizButton className="h-12 md:h-16 p-1" category={Category.SFP_NCA} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.SFP_NCA]} />
                    <QuizButton className="h-12 md:h-16 p-1" category={Category.SFP_CA} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.SFP_CA]} />
                    <QuizButton className="h-12 md:h-16 p-1" category={Category.SFP_CAPITAL} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.SFP_CAPITAL]} />
                    <QuizButton className="h-12 md:h-16 p-1" category={Category.SFP_NCL} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.SFP_NCL]} />
                    <QuizButton className="h-12 md:h-16 p-1" category={Category.SFP_CL} onClick={handleAnswer} disabled={!!feedback} colorClass={CATEGORY_COLORS[Category.SFP_CL]} />
                 </div>
              </div>

              {/* Mistake Log */}
              {mistakes.length > 0 && (
                <div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Mistake Log</div>
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="grid grid-cols-2 bg-slate-100 p-3 border-b border-slate-200 font-bold text-xs text-slate-600 uppercase">
                        <div>Account Name</div>
                        <div>Correct Position</div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {mistakes.map((m, idx) => (
                           <div key={idx} className="grid grid-cols-2 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 text-sm">
                              <div className="font-semibold text-slate-700 pr-4">{m.account.name}</div>
                              <div className="text-rose-600 font-medium flex items-center">{m.account.category}</div>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© 2025 HKDSE Accounting Helper</p>
      </footer>
    </div>
  );
};

export default App;