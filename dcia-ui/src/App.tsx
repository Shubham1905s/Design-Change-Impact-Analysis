// src/App.tsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  Search, 
  Settings, 
  Cpu, 
  DollarSign, 
  AlertCircle, 
  History, 
  MessageSquare, 
  Send,
  Loader2,
  ChevronRight,
  Info,
  ShieldAlert,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API = "http://localhost:8000/api";

const SEVERITY_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  HIGH: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  MEDIUM: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  LOW: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
};

type ImpactResult = {
  intent: any;
  impacts: {
    name: string;
    discipline: string;
    hops: number;
    severity: string;
    cascade_reasons: string[];
  }[];
  class_rules: {
    society: string;
    clause: string;
    description: string;
    system: string;
  }[];
  historical: {
    id: string;
    description: string;
    summary: string;
    cost_actual_usd: number;
    delay_days: number;
  }[];
  cost_estimate: {
    total_p10_usd: number;
    total_p50_usd: number;
    total_p90_usd: number;
    confidence: string;
    note: string;
  };
  report: string;
};

export default function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImpactResult | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const submit = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/chat`, { message });
      setResult(res.data);
      // Wait for animation frame then scroll
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (e: any) {
      setError("API Error: " + (e.response?.data?.detail || e.message || "Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const costData = result ? [
    { name: "P10 (Optimistic)", value: result.cost_estimate.total_p10_usd },
    { name: "P50 (Likely)", value: result.cost_estimate.total_p50_usd },
    { name: "P90 (Pessimistic)", value: result.cost_estimate.total_p90_usd },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-morphism border-b border-slate-200 py-4 px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Cpu size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">DCIA</h1>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-none mt-0.5">Design Change Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment</span>
            <span className="text-xs font-semibold text-slate-700">PoC · MDL Shipbuilding</span>
          </span>
          <div className="h-8 w-px bg-slate-200" />
          <Settings className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" size={20} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {/* Hero Section / Input */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900">What design change are you evaluating?</h2>
              <p className="text-slate-500 max-w-2xl">Use AI-driven insights to analyze impacts on systems, cost, and compliance across your entire design graph.</p>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-300"></div>
              <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-sm border border-slate-200">
                <Search className="ml-4 text-slate-400" size={20} />
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder='E.g. "Increase main engine power by 15%. What systems are affected?"'
                  className="w-full py-4 px-4 text-lg bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 outline-none"
                />
                <button 
                  onClick={submit} 
                  disabled={loading || !message.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-100"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  {loading ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "Increase main engine power by 15% for improved speed",
                "Replace the shaft generator with a new 3MW unit",
                "Add structural stiffening for a new weapons mount",
                "Increase fuel tank capacity by 20%"
              ].map(p => (
                <button 
                  key={p} 
                  onClick={() => setMessage(p)}
                  className="px-4 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
                >
                  <History size={12} className="text-slate-400" />
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700"
          >
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div className="text-sm font-medium">{error}</div>
          </motion.div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div 
              ref={resultRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Main Report Card */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <MessageSquare size={20} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Impact Assessment Report</h3>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> Conf: {result.cost_estimate.confidence}
                    </span>
                  </div>
                </div>
                <div className="px-8 py-8">
                   <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                     {result.report}
                   </p>
                   <div className="mt-8 flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 italic text-[11px] text-slate-500">
                     <Info size={14} className="shrink-0" />
                     Generated via Neo4j graph traversal + LLM synthesis based on PS-1 & PS-2 specifications.
                   </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cost Estimate Section */}
                <div className="lg:col-span-2 space-y-8">
                  <section className="card bg-gradient-to-br from-white to-slate-50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-emerald-600" size={20} />
                        <h3 className="font-bold text-slate-800">Cost Estimate Projection</h3>
                      </div>
                      <div className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">USD</div>
                    </div>
                    
                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costData} layout="vertical" margin={{ left: 20 }}>
                          <XAxis 
                            type="number" 
                            tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} 
                            fontSize={11} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            width={110} 
                            fontSize={12} 
                            fontWeight={600}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Estimated Total"]}
                          />
                          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                            {costData.map((_, i) => (
                              <Cell 
                                key={i} 
                                fill={["#10b981", "#6366f1", "#f43f5e"][i]} 
                                fillOpacity={0.9}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-xs text-slate-500 flex items-start gap-2 bg-white/50 p-3 rounded-lg border border-slate-100">
                      <Info size={14} className="mt-0.5 shrink-0 text-indigo-400" />
                      {result.cost_estimate.note}
                    </p>
                  </section>

                  {/* Systems Table */}
                  <section className="card">
                    <div className="flex items-center gap-2 mb-6">
                      <ShieldAlert className="text-indigo-600" size={20} />
                      <h3 className="font-bold text-slate-800">Affected Systems ({result.impacts.length})</h3>
                    </div>
                    <div className="overflow-x-auto -mx-6">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Hops</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {result.impacts.map((imp, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{imp.name}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{imp.discipline}</div>
                                <div className="text-xs text-slate-400 mt-2 italic group-hover:text-slate-600">
                                  "{imp.cascade_reasons?.[imp.cascade_reasons.length - 1] || "Direct impact"}"
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-full text-[10px] font-extrabold border tracking-wider",
                                  SEVERITY_COLORS[imp.severity]?.bg || "bg-slate-50",
                                  SEVERITY_COLORS[imp.severity]?.text || "text-slate-500",
                                  SEVERITY_COLORS[imp.severity]?.border || "border-slate-200"
                                )}>
                                  {imp.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right pr-10">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold tabular-nums">
                                  {imp.hops}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                {/* Sidebar sections */}
                <div className="space-y-8">
                  {/* Class Rules */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="text-amber-600" size={18} />
                      <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Class Rule Flags</h3>
                    </div>
                    <div className="space-y-4">
                      {result.class_rules.length > 0 ? result.class_rules.map((cr, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="p-4 border-l-4 border-amber-500 bg-white shadow-sm rounded-r-xl"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-amber-700 uppercase">{cr.society}</span>
                            <span className="text-[10px] font-bold text-slate-400">{cr.clause}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 mb-2 leading-snug">{cr.description}</p>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Trigger: <span className="font-bold text-slate-700">{cr.system}</span>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs text-center">
                          No regulatory flags detected.
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Historical Analogues */}
                  {result.historical.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <History className="text-blue-600" size={18} />
                        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Historical Insights</h3>
                      </div>
                      <div className="space-y-4">
                        {result.historical.map((h, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            key={i} 
                            className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.id}</span>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                <ArrowRight size={10} /> Case Study
                              </div>
                            </div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">
                              {h.description}
                            </p>
                            <div className="flex items-center gap-4 border-t border-slate-50 pt-2 mt-2">
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase">Actual Cost</div>
                                <div className="text-xs font-bold text-slate-700">${(h.cost_actual_usd / 1e3).toFixed(0)}k</div>
                              </div>
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase">Delay</div>
                                <div className="text-xs font-bold text-slate-700">{h.delay_days} days</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {!result && !loading && (
        <footer className="fixed bottom-8 left-0 right-0 pointer-events-none">
          <div className="max-w-5xl mx-auto px-6 opacity-40 text-[10px] text-center font-bold text-slate-400 uppercase tracking-[0.2em]">
            Proprietary Knowledge Engine · Internal Use Only · MDL Systems Group
          </div>
        </footer>
      )}
    </div>
  );
}