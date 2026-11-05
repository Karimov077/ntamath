import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { Modal } from '../../components/Modal';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  initialQuestion?: Question | null;
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
}) => {
  const [text, setText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialQuestion) {
      setText(initialQuestion.text);
      setOptionA(initialQuestion.options[0] || '');
      setOptionB(initialQuestion.options[1] || '');
      setOptionC(initialQuestion.options[2] || '');
      setOptionD(initialQuestion.options[3] || '');
      setCorrectIndex(initialQuestion.correctOptionIndex);
      setExplanation(initialQuestion.explanation || '');
    } else {
      setText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectIndex(0);
      setExplanation('');
    }
    setError('');
  }, [initialQuestion, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Savol matnini kiriting!');
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError('Barcha 4 ta (A, B, C, D) variantlarni to\'ldiring!');
      return;
    }

    const question: Question = {
      id: initialQuestion ? initialQuestion.id : `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text: text.trim(),
      options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
      correctOptionIndex: correctIndex,
      explanation: explanation.trim() || undefined,
    };

    onSave(question);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialQuestion ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Savol matni
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Matematik savol yoki ifodani yozing..."
            className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Variantlar va To'g'ri javobni belgilash
          </label>

          {[
            { label: 'A', value: optionA, setter: setOptionA, index: 0 },
            { label: 'B', value: optionB, setter: setOptionB, index: 1 },
            { label: 'C', value: optionC, setter: setOptionC, index: 2 },
            { label: 'D', value: optionD, setter: setOptionD, index: 3 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectIndex(item.index)}
                className={`w-9 h-9 rounded-xl font-black text-xs shrink-0 flex items-center justify-center transition border ${
                  correctIndex === item.index
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
                title="To'g'ri variant sifatida belgilash"
              >
                {item.label}
              </button>
              <input
                type="text"
                value={item.value}
                onChange={(e) => item.setter(e.target.value)}
                placeholder={`${item.label} varianti javobi`}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          ))}
          <p className="text-[11px] text-slate-400">
            * To'g'ri variantni tanlash uchun chapdagi A, B, C yoki D harfli doiracha ustiga bosing (yashil rang to'g'ri javobni bildiradi).
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Tushuntirish / Yechim (Ixtiyoriy)
          </label>
          <input
            type="text"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="O'quvchi natijani ko'rganda chiqadigan qisqa izoh..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  );
};

