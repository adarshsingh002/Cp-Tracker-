import { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './ProblemWorkspace.css';

// ── Default boilerplate ───────────────────────────────────────────────────────
const DEFAULT_CODE = `def solution(nums, target):
    """
    Two Sum — find indices of two numbers that add up to target.
    :param nums: List[int]
    :param target: int
    :return: List[int]
    """
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []

# ── Test your solution ──────────────────────────────────────────────────────
if __name__ == "__main__":
    print(solution([2, 7, 11, 15], 9))   # Expected: [0, 1]
    print(solution([3, 2, 4], 6))         # Expected: [1, 2]
`;

// ── Difficulty colours ────────────────────────────────────────────────────────
const DIFF_CLASS = { Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' };

// ── Language options ──────────────────────────────────────────────────────────
const LANGUAGES = [
  { value: 'python',     label: 'Python 3',   monacoLang: 'python' },
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { value: 'cpp',        label: 'C++',        monacoLang: 'cpp' },
  { value: 'java',       label: 'Java',       monacoLang: 'java' },
];

// ── Demo problem data ─────────────────────────────────────────────────────────
const DEMO_PROBLEM = {
  id: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  tags: ['Array', 'Hash Table'],
  acceptanceRate: '49.4%',
  description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers* such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
    },
  ],
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
    'Only one valid answer exists.',
  ],
};

// ── Terminal line component ───────────────────────────────────────────────────
function TerminalLine({ line }) {
  const isError = line.type === 'error';
  const isSystem = line.type === 'system';
  const isSuccess = line.type === 'success';
  return (
    <div
      className={`terminal-line ${isError ? 'terminal-error' : ''} ${isSystem ? 'terminal-system' : ''} ${isSuccess ? 'terminal-success' : ''}`}
    >
      {line.text}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProblemWorkspace() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState([
    { type: 'system', text: '▶  Click "Run Code" to execute your solution.' },
  ]);
  const [panelHeight, setPanelHeight] = useState(220);
  const [leftWidth, setLeftWidth] = useState(38); // percent
  const editorRef = useRef(null);
  const isDraggingV = useRef(false);
  const isDraggingH = useRef(false);

  // ── Editor mount ────────────────────────────────────────────────
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  // ── Run code ────────────────────────────────────────────────────
  const runCode = useCallback(async () => {
    setIsRunning(true);
    setTerminalLines([{ type: 'system', text: `⏳  Running (${language.label})…` }]);

    try {
      const { data } = await axios.post('/api/execute', {
        code,
        language: language.value,
      });

      const lines = [];

      if (data.status) {
        const isAccepted = data.status.toLowerCase().includes('accepted');
        lines.push({
          type: isAccepted ? 'success' : 'system',
          text: `●  Status: ${data.status}${data.time ? `  |  Time: ${data.time}s` : ''}${data.memory ? `  |  Mem: ${data.memory} KB` : ''}`,
        });
      }

      if (data.stdout) {
        data.stdout
          .trimEnd()
          .split('\n')
          .forEach((l) => lines.push({ type: 'output', text: l }));
      }

      if (data.stderr) {
        lines.push({ type: 'error', text: '── Runtime Error ──────────────────────────' });
        data.stderr
          .trimEnd()
          .split('\n')
          .forEach((l) => lines.push({ type: 'error', text: l }));
      }

      if (!data.stdout && !data.stderr) {
        lines.push({ type: 'system', text: '(No output)' });
      }

      setTerminalLines(lines);
    } catch (err) {
      setTerminalLines([
        { type: 'error', text: '── Connection Error ───────────────────────' },
        {
          type: 'error',
          text: err.response?.data?.error || err.message || 'Failed to reach execution server.',
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  // ── Vertical drag (terminal height) ─────────────────────────────
  const startVerticalDrag = (e) => {
    e.preventDefault();
    isDraggingV.current = true;
    const startY = e.clientY;
    const startH = panelHeight;

    const onMove = (ev) => {
      if (!isDraggingV.current) return;
      const delta = startY - ev.clientY;
      setPanelHeight(Math.max(80, Math.min(500, startH + delta)));
    };
    const onUp = () => {
      isDraggingV.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── Horizontal drag (left panel width) ──────────────────────────
  const startHorizontalDrag = (e) => {
    e.preventDefault();
    isDraggingH.current = true;
    const startX = e.clientX;
    const startW = leftWidth;
    const containerW = e.currentTarget.parentElement.getBoundingClientRect().width;

    const onMove = (ev) => {
      if (!isDraggingH.current) return;
      const delta = ev.clientX - startX;
      const newPct = startW + (delta / containerW) * 100;
      setLeftWidth(Math.max(20, Math.min(60, newPct)));
    };
    const onUp = () => {
      isDraggingH.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── Clear terminal ───────────────────────────────────────────────
  const clearTerminal = () =>
    setTerminalLines([{ type: 'system', text: 'Terminal cleared.' }]);

  // ── Render ───────────────────────────────────────────────────────
  const monacoLang = language.monacoLang;

  return (
    <div className="workspace-root">
      {/* ── Top toolbar ─────────────────────────────────────────── */}
      <div className="workspace-toolbar glass">
        <div className="workspace-toolbar-left">
          <span className="workspace-logo">⚙</span>
          <span className="workspace-title">Practice Workspace</span>
          <span className={`badge ${DIFF_CLASS[DEMO_PROBLEM.difficulty]}`}>
            {DEMO_PROBLEM.difficulty}
          </span>
          <span className="workspace-problem-title">{DEMO_PROBLEM.id}. {DEMO_PROBLEM.title}</span>
        </div>

        <div className="workspace-toolbar-right">
          {/* Language selector */}
          <div className="lang-selector">
            <span className="lang-selector-icon">🐍</span>
            <select
              id="language-select"
              className="form-select lang-select-input"
              value={language.value}
              onChange={(e) => setLanguage(LANGUAGES.find((l) => l.value === e.target.value))}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Run button */}
          <button
            id="run-code-btn"
            className={`btn btn-primary run-btn ${isRunning ? 'running' : ''}`}
            onClick={runCode}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <span className="run-spinner" />
                Running…
              </>
            ) : (
              <>▶ Run Code</>
            )}
          </button>
        </div>
      </div>

      {/* ── Main split area ──────────────────────────────────────── */}
      <div className="workspace-main">
        {/* Left: Problem panel */}
        <div className="workspace-left" style={{ width: `${leftWidth}%` }}>
          <ProblemPanel problem={DEMO_PROBLEM} />
        </div>

        {/* Horizontal resizer */}
        <div
          className="workspace-h-resizer"
          onMouseDown={startHorizontalDrag}
          title="Drag to resize"
        />

        {/* Right: Editor + Terminal */}
        <div className="workspace-right" style={{ width: `${100 - leftWidth}%` }}>
          <div className="editor-pane">
            <Editor
              height="100%"
              language={monacoLang}
              value={code}
              onChange={(val) => setCode(val ?? '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          {/* Vertical resizer */}
          <div
            className="workspace-v-resizer"
            onMouseDown={startVerticalDrag}
            title="Drag to resize terminal"
          />

          {/* Terminal */}
          <div className="terminal-pane glass" style={{ height: `${panelHeight}px` }}>
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="terminal-label">Output Terminal</span>
              <button
                id="clear-terminal-btn"
                className="btn btn-ghost btn-sm terminal-clear"
                onClick={clearTerminal}
              >
                Clear
              </button>
            </div>
            <div className="terminal-body">
              {terminalLines.map((line, i) => (
                <TerminalLine key={i} line={line} />
              ))}
              {isRunning && <div className="terminal-cursor" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Problem Description Panel ─────────────────────────────────────────────────
function ProblemPanel({ problem }) {
  const [tab, setTab] = useState('description');

  return (
    <div className="problem-panel glass">
      {/* Tabs */}
      <div className="problem-tabs">
        {['description', 'examples', 'constraints'].map((t) => (
          <button
            key={t}
            id={`tab-${t}`}
            className={`problem-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="problem-content">
        {tab === 'description' && (
          <div className="animate-fade-in">
            <div className="problem-meta">
              {problem.tags.map((tag) => (
                <span key={tag} className="badge badge-violet">{tag}</span>
              ))}
              <span className="problem-acceptance">✓ {problem.acceptanceRate}</span>
            </div>
            <p className="problem-desc">{problem.description}</p>
          </div>
        )}

        {tab === 'examples' && (
          <div className="animate-fade-in">
            {problem.examples.map((ex, i) => (
              <div key={i} className="example-block">
                <div className="example-label">Example {i + 1}</div>
                <div className="example-io">
                  <div className="example-row">
                    <span className="io-label">Input:</span>
                    <code className="io-val mono">{ex.input}</code>
                  </div>
                  <div className="example-row">
                    <span className="io-label">Output:</span>
                    <code className="io-val mono">{ex.output}</code>
                  </div>
                  {ex.explanation && (
                    <div className="example-explanation">{ex.explanation}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'constraints' && (
          <div className="animate-fade-in">
            <ul className="constraints-list">
              {problem.constraints.map((c, i) => (
                <li key={i} className="constraint-item mono">{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
