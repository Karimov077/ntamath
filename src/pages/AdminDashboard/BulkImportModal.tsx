import React, { useState } from 'react';
import { Question } from '../../types';
import { Modal } from '../../components/Modal';
import { FileText, Code2, Check, AlertCircle, Sparkles } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: Question[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [importMode, setImportMode] = useState<'text' | 'json'>('text');
  const [rawContent, setRawContent] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [parseError, setParseError] = useState('');

  const sampleText = `1. 15 + 25 yig'indisi nechaga teng?
A) 30
B) 40
C) 50
D) 60
Javob: B

2. To'g'ri to'rtburchakning yuzi qaysi formula bilan topiladi?
A) S = a * b
B) P = 2 * (a + b)
C) S = a^2
D) S = (a + b) / 2
Javob: A

3. 81 ning kvadrat ildizini toping:
A) 7
B) 8
C) 9
D) 10
Javob: C`;

  const sampleJson = `[
  {
    "text": "15 + 25 yig'indisi nechaga teng?",
    "options": ["30", "40", "50", "60"],
    "correctOptionIndex": 1,
    "explanation": "15 + 25 = 40"
  },
  {
    "text": "To'g'ri to'rtburchakning yuzi qaysi formula bilan topiladi?",
    "options": ["S = a * b", "P = 2 * (a + b)", "S = a^2", "S = (a + b) / 2"],
    "correctOptionIndex": 0
  }
]`;

  const handleParse = () => {
    setParseError('');
    setParsedQuestions([]);

    if (!rawContent.trim()) {
      setParseError('Iltimos, avval matn yoki JSON ma\'lumotlarini kiriting!');
      return;
    }

    if (importMode === 'json') {
      try {
        const data = JSON.parse(rawContent);
        if (!Array.isArray(data)) {
          setParseError('JSON formatida savollar ro\'yxati ([...]) bo\'lishi kerak!');
          return;
        }

        const validQuestions: Question[] = data.map((item, index) => {
          if (!item.text || !Array.isArray(item.options) || item.options.length < 2) {
            throw new Error(`${index + 1}-savol strukturasi noto'g'ri!`);
          }

          const options = item.options.slice(0, 4);
          while (options.length < 4) {
            options.push(`Variant ${options.length + 1}`);
          }

          let correctIdx = 0;
          if (typeof item.correctOptionIndex === 'number') {
            correctIdx = item.correctOptionIndex;
          } else if (typeof item.answer === 'string') {
            const letter = item.answer.trim().toUpperCase();
            correctIdx = letter === 'B' ? 1 : letter === 'C' ? 2 : letter === 'D' ? 3 : 0;
          }

          return {
            id: `q-bulk-${Date.now()}-${index}`,
            text: item.text,
            options: options as [string, string, string, string],
            correctOptionIndex: correctIdx,
            explanation: item.explanation,
          };
        });

        setParsedQuestions(validQuestions);
      } catch (err: any) {
        setParseError(`JSON o'qishda xatolik: ${err.message}`);
      }
    } else {
      // TEXT MODE PARSER
      try {
        const blocks = rawContent.split(/\n\s*\n+/);
        const questions: Question[] = [];

        blocks.forEach((block, bIdx) => {
          const lines = block
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

          if (lines.length < 5) return; // Must have question + A, B, C, D + Answer

          // 1. Question text is line 0 (strip leading numbering like "1.", "1)")
          let questionText = lines[0].replace(/^(\d+[\.\)]\s*)/, '').trim();

          let optA = '';
          let optB = '';
          let optC = '';
          let optD = '';
          let correctLetter = 'A';

          lines.slice(1).forEach((line) => {
            if (/^[Aa][\)\.]\s*/.test(line)) {
              optA = line.replace(/^[Aa][\)\.]\s*/, '').trim();
            } else if (/^[Bb][\)\.]\s*/.test(line)) {
              optB = line.replace(/^[Bb][\)\.]\s*/, '').trim();
            } else if (/^[Cc][\)\.]\s*/.test(line)) {
              optC = line.replace(/^[Cc][\)\.]\s*/, '').trim();
            } else if (/^[Dd][\)\.]\s*/.test(line)) {
              optD = line.replace(/^[Dd][\)\.]\s*/, '').trim();
            } else if (/^(Javob|Javobi|To'g'ri|Answer)\s*:\s*([A-Da-d])/i.test(line)) {
              const match = line.match(/([A-Da-d])/i);
              if (match) correctLetter = match[1].toUpperCase();
            }
          });

          if (questionText && optA && optB) {
            const correctOptionIndex =
              correctLetter === 'B' ? 1 : correctLetter === 'C' ? 2 : correctLetter === 'D' ? 3 : 0;

            questions.push({
              id: `q-text-${Date.now()}-${bIdx}`,
              text: questionText,
              options: [optA, optB, optC || 'Noma\'lum', optD || 'Noma\'lum'],
              correctOptionIndex,
            });
          }
        });

        if (questions.length === 0) {
          setParseError('Matndan savollar topilmadi. Iltimos namunaviy formatga mos keltiring.');
        } else {
          setParsedQuestions(questions);
        }
      } catch (err: any) {
        setParseError(`Matnni tahlil qilishda xatolik: ${err.message}`);
      }
    }
  };

  const handleApply = () => {
    if (parsedQuestions.length > 0) {
      onImport(parsedQuestions);
      onClose();
      setRawContent('');
      setParsedQuestions([]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Savollarni ommaviy yuklash (Bulk Import)"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Format Selector tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setImportMode('text');
                setParseError('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                importMode === 'text'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Matn formati (A, B, C, D)</span>
            </button>
            <button
              onClick={() => {
                setImportMode('json');
                setParseError('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                importMode === 'json'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>JSON formati</span>
            </button>
          </div>

          <button
            onClick={() => setRawContent(importMode === 'text' ? sampleText : sampleJson)}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Namunani qo'yish</span>
          </button>
        </div>

        {/* Text Area */}
        <div>
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            rows={10}
            placeholder={
              importMode === 'text'
                ? `1. Savol matni?\nA) Variant 1\nB) Variant 2\nC) Variant 3\nD) Variant 4\nJavob: A\n\n(Savollar oralig'ida bo'sh qator qoldiring)`
                : `[\n  {\n    "text": "Savol matni",\n    "options": ["A", "B", "C", "D"],\n    "correctOptionIndex": 0\n  }\n]`
            }
            className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {parseError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleParse}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Tekshirish va Tahlil qilish
          </button>

          <div className="flex items-center gap-2">
            {parsedQuestions.length > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-2">
                ✅ {parsedQuestions.length} ta savol tayyor!
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={parsedQuestions.length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Darsga qo'shish ({parsedQuestions.length})</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

