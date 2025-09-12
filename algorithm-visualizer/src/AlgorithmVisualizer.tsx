import React, { useEffect, useMemo, useState } from "react";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function recordSteps<T>(arr: T[], steps: T[][]) { steps.push([...arr]); }

function bubbleSortSteps(arr: number[]) {
  const a = [...arr]; const steps: number[][] = []; recordSteps(a, steps);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
      recordSteps(a, steps);
    }
  } return steps;
}
function insertionSortSteps(arr: number[]) {
  const a = [...arr]; const steps: number[][] = []; recordSteps(a, steps);
  for (let i = 1; i < a.length; i++) {
    const key = a[i]; let j = i - 1;
    while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; recordSteps(a, steps); }
    a[j + 1] = key; recordSteps(a, steps);
  } return steps;
}
function selectionSortSteps(arr: number[]) {
  const a = [...arr]; const steps: number[][] = []; recordSteps(a, steps);
  for (let i = 0; i < a.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) { if (a[j] < a[minIdx]) minIdx = j; recordSteps(a, steps); }
    [a[i], a[minIdx]] = [a[minIdx], a[i]]; recordSteps(a, steps);
  } return steps;
}
function mergeSortSteps(arr: number[]) {
  const steps: number[][] = []; const a = [...arr]; recordSteps(a, steps);
  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) a[k++] = left[i++]; else a[k++] = right[j++];
      recordSteps(a, steps);
    }
    while (i < left.length) { a[k++] = left[i++]; recordSteps(a, steps); }
    while (j < right.length) { a[k++] = right[j++]; recordSteps(a, steps); }
  }
  function sort(lo: number, hi: number) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid); sort(mid + 1, hi); merge(lo, mid, hi);
  }
  sort(0, a.length - 1); return steps;
}
function quickSortSteps(arr: number[]) {
  const a = [...arr]; const steps: number[][] = []; recordSteps(a, steps);
  function qs(lo: number, hi: number) {
    if (lo >= hi) return;
    const pivot = a[hi]; let i = lo;
    for (let j = lo; j < hi; j++) { if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; } recordSteps(a, steps); }
    [a[i], a[hi]] = [a[hi], a[i]]; recordSteps(a, steps);
    qs(lo, i - 1); qs(i + 1, hi);
  }
  qs(0, a.length - 1); return steps;
}
const SORTERS: Record<string, (a: number[]) => number[][]> = {
  Bubble: bubbleSortSteps, Insertion: insertionSortSteps, Selection: selectionSortSteps,
  Merge: mergeSortSteps, Quick: quickSortSteps,
};

class TreeNode { value: number; left: TreeNode | null = null; right: TreeNode | null = null; x=0; y=0; constructor(v:number){this.value=v;} }
function insert(root: TreeNode | null, v: number): TreeNode { if (!root) return new TreeNode(v); if (v < root.value) root.left = insert(root.left, v); else root.right = insert(root.right, v); return root; }
function layout(root: TreeNode | null, depth = 0, x = 0, spread = 120): TreeNode | null {
  if (!root) return null; root.x = x; root.y = depth * 80;
  layout(root.left, depth + 1, x - spread / (depth + 1), spread);
  layout(root.right, depth + 1, x + spread / (depth + 1), spread);
  return root;
}

export default function AlgorithmVisualizer() {
  const [data, setData] = useState<number[]>(() => Array.from({ length: 30 }, () => randInt(5, 100)));
  const [size, setSize] = useState(30);
  const [speed, setSpeed] = useState(40);
  const [algo, setAlgo] = useState<keyof typeof SORTERS>("Merge");
  const [running, setRunning] = useState(false);
  const [bst, setBst] = useState<TreeNode | null>(null);
  const [bstInput, setBstInput] = useState<string>("");

  React.useEffect(() => { regenerate(); /* on size change */ }, [size]);

  function regenerate() { setData(Array.from({ length: size }, () => randInt(5, 100))); }
  async function runSort() {
    if (running) return; setRunning(True as any); // TS quick hack in plain text
    const steps = SORTERS[algo](data);
    for (let i = 0; i < steps.length; i++) { setData(steps[i]); await sleep(speed); }
    setRunning(false);
  }
  function addBstValues() {
    const values = bstInput.split(/[,\s]+/).map((v) => parseInt(v, 10)).filter((v) => !Number.isNaN(v));
    let root = bst; for (const v of values) root = insert(root, v);
    setBst(layout(root));
  }
  function clearBst(){ setBst(null); setBstInput(""); }

  const maxVal = useMemo(() => Math.max(...data), [data]);

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>
          <p className="text-sm opacity-70">Sorting + Binary Search Tree</p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl shadow bg-white">
            <h2 className="text-xl font-semibold mb-3">Sorting Controls</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm">
                Algorithm
                <select className="ml-2 border rounded px-2 py-1" value={algo} onChange={(e) => setAlgo(e.target.value as any)}>
                  {Object.keys(SORTERS).map((k) => (<option key={k} value={k}>{k}</option>))}
                </select>
              </label>
              <label className="text-sm">
                Size
                <input type="range" min={10} max={100} value={size} onChange={(e) => setSize(parseInt((e.target as any).value))} className="ml-2" />
                <span className="ml-2 text-xs">{size}</span>
              </label>
              <label className="text-sm">
                Speed (ms)
                <input type="range" min={5} max={200} value={speed} onChange={(e) => setSpeed(parseInt((e.target as any).value))} className="ml-2" />
                <span className="ml-2 text-xs">{speed}</span>
              </label>
              <button onClick={regenerate} className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200" disabled={running}>Regenerate</button>
              <button onClick={runSort} className="px-3 py-1 rounded-xl bg-black text-white hover:bg-gray-800" disabled={running}>{running ? "Running..." : "Run"}</button>
            </div>
            <div className="mt-4 h-64 flex items-end gap-[2px] border rounded-xl p-2 bg-gray-50">
              {data.map((v, i) => (
                <div key={i} className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${(v / maxVal) * 100}%` }} title={`${v}`} />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">Tip: Increase speed for faster animations; decrease for step-by-step.</p>
          </div>

          <div className="p-4 rounded-2xl shadow bg-white">
            <h2 className="text-xl font-semibold mb-3">Binary Search Tree (BST)</h2>
            <div className="flex flex-wrap items-center gap-3">
              <input className="border rounded px-3 py-1 w-60" placeholder="Enter numbers e.g. 8,3,10,1,6,14,4,7,13" value={bstInput} onChange={(e) => setBstInput((e.target as any).value)} />
              <button onClick={addBstValues} className="px-3 py-1 rounded-xl bg-black text-white hover:bg-gray-800">Insert</button>
              <button onClick={clearBst} className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200">Clear</button>
            </div>
            <div className="mt-4 border rounded-xl p-2 bg-gray-50 overflow-x-auto">
              <svg viewBox="-300 -20 600 360" className="w-full h-[360px]">
                {bst && (
                  <g>
                    {(() => {
                      const edges: JSX.Element[] = [];
                      function walk(n: TreeNode | null) {
                        if (!n) return;
                        if (n.left) edges.push(<line key={`e-${n.value}-L`} x1={n.x} y1={n.y} x2={n.left.x} y2={n.left.y} stroke="#CBD5E1" strokeWidth={2} />);
                        if (n.right) edges.push(<line key={`e-${n.value}-R`} x1={n.x} y1={n.y} x2={n.right.x} y2={n.right.y} stroke="#CBD5E1" strokeWidth={2} />);
                        walk(n.left); walk(n.right);
                      }
                      walk(bst); return edges;
                    })()}
                    {(() => {
                      const nodes: JSX.Element[] = [];
                      function walk(n: TreeNode | null) {
                        if (!n) return;
                        nodes.push(
                          <g key={`n-${n.value}`} transform={`translate(${n.x}, ${n.y})`}>
                            <circle r={16} fill="#6366F1" />
                            <text textAnchor="middle" dy="5" fontSize="12" fill="white">{n.value}</text>
                          </g>
                        );
                        walk(n.left); walk(n.right);
                      }
                      walk(bst); return nodes;
                    })()}
                  </g>
                )}
              </svg>
            </div>
            <p className="mt-2 text-xs text-gray-500">Enter comma-separated integers and click Insert.</p>
          </div>
        </section>
        <footer className="text-xs text-gray-500">Built with React + Tailwind.</footer>
      </div>
    </div>
  );
}