import React, { useState, useEffect } from 'react';
import { DetailedPlan, IncomeIdea } from '../types';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PlanPDFDocument } from './PlanPDFDocument';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import {
  Target, ChevronLeft, Share2, ThumbsUp, ThumbsDown,
  Heart, FileText, CheckSquare, Square, PieChart,
  Loader2, TrendingUp, BarChart2
} from 'lucide-react';

interface PlanDetailProps {
  plan: DetailedPlan;
  idea: IncomeIdea;
  isFavorite: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onShowToast: (msg: string) => void;
}

const PlanDetail: React.FC<PlanDetailProps> = ({
  plan, idea, isFavorite, onBack, onShare, onToggleFavorite, onShowToast
}) => {
  const [rated, setRated] = useState<'up' | 'down' | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [chartMode, setChartMode] = useState<'growth' | 'breakdown'>('growth');

  useEffect(() => {
    const saved = localStorage.getItem(`pg_progress_${idea.id}`);
    if (saved) setCompletedTasks(JSON.parse(saved));
  }, [idea.id]);

  useEffect(() => {
    localStorage.setItem(`pg_progress_${idea.id}`, JSON.stringify(completedTasks));
  }, [completedTasks, idea.id]);

  const handleRate = (type: 'up' | 'down') => {
    setRated(type);
    onShowToast('Thanks for your feedback!');
  };

  const toggleTask = (phaseIdx: number, taskIdx: number) => {
    const key = `${phaseIdx}-${taskIdx}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateProgress = () => {
    let total = 0, done = 0;
    plan.steps.forEach((step, pIdx) => {
      step.tasks.forEach((_, tIdx) => {
        total++;
        if (completedTasks[`${pIdx}-${tIdx}`]) done++;
      });
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const totalProfit = plan.projections.reduce((acc, curr) => acc + curr.profit, 0);
  const totalRevenue = plan.projections.reduce((acc, curr) => acc + curr.revenue, 0);
  const avgMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
  const firstProfitMonth = plan.projections.find(p => p.profit > 0)?.month || "N/A";

  return (
    <div className="flex flex-col h-full bg-gray-50 animate-in slide-in-from-right duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:text-brand-600 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="ml-2">
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Business Plan</h2>
            <h1 className="text-sm font-bold text-gray-900 leading-none truncate w-40 sm:w-64">{idea.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleFavorite} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Heart size={20} className={`transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
          <button onClick={onShare} className="p-2 text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {/* Progress Bar */}
        <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between text-xs mb-1 font-medium text-gray-600">
            <span>Execution Progress</span>
            <span>{calculateProgress()}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${calculateProgress()}%` }} />
          </div>
        </div>

        {/* Overview Section */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
            <Target className="w-5 h-5 mr-2 text-brand-500" /> Executive Summary
          </h3>
          <p className="text-gray-600 leading-relaxed text-sm">{plan.overview}</p>
        </section>

        {/* Financial Section */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Financial Forecast</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setChartMode('growth')} className={`p-1.5 rounded-md transition-all ${chartMode === 'growth' ? 'bg-white shadow text-brand-600' : 'text-gray-400'}`}><TrendingUp size={16} /></button>
              <button onClick={() => setChartMode('breakdown')} className={`p-1.5 rounded-md transition-all ${chartMode === 'breakdown' ? 'bg-white shadow text-brand-600' : 'text-gray-400'}`}><BarChart2 size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-brand-50 p-3 rounded-lg text-center">
              <p className="text-[10px] text-brand-600 font-bold uppercase">Profit</p>
              <p className="text-brand-700 font-bold text-lg">${totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-[10px] text-green-600 font-bold uppercase">Margin</p>
              <p className="text-green-700 font-bold text-lg">{avgMargin}%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-[10px] text-purple-600 font-bold uppercase">First Profit</p>
              <p className="text-purple-700 font-bold text-lg">{firstProfitMonth}</p>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'growth' ? (
                <AreaChart data={plan.projections} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={10} tick={{ fill: '#9ca3af' }} />
                  <YAxis fontSize={10} tick={{ fill: '#9ca3af' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              ) : (
                <BarChart data={plan.projections} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={10} tick={{ fill: '#9ca3af' }} />
                  <YAxis fontSize={10} tick={{ fill: '#9ca3af' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="revenue" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" stackId="b" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Roadmap */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 ml-1">Execution Roadmap</h3>
          {plan.steps.map((step, pIdx) => (
            <div key={pIdx} className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 font-semibold text-gray-800 flex items-center">
                <span className="bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">{pIdx + 1}</span>
                {step.phase}
              </div>
              <div className="p-5 space-y-3">
                {step.tasks.map((task, tIdx) => (
                  <div key={tIdx} onClick={() => toggleTask(pIdx, tIdx)} className={`flex items-start text-sm cursor-pointer transition-all ${completedTasks[`${pIdx}-${tIdx}`] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    <CheckSquare size={18} className={`mr-3 mt-0.5 ${completedTasks[`${pIdx}-${tIdx}`] ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* PDF Export Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <PDFDownloadLink
          document={<PlanPDFDocument plan={plan} ideaTitle={idea.title} />}
          fileName={`PassiveGenius_${idea.title.replace(/\s+/g, '_')}.pdf`}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-[0.98]"
        >
          {({ loading }) => (
            <>
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
              {loading ? 'Preparing Report...' : 'Download Full PDF Strategy'}
            </>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default PlanDetail;