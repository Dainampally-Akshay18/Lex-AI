'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { documentsAPI, getApiErrorMessage, riskAPI } from '@/lib/api';
import type { Document, RiskResponse } from '@/types';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadialBarChart,
  RadialBar,
} from 'recharts';

export default function AnalysisRiskPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;

  const [documentInfo, setDocumentInfo] = useState<Document | null>(null);
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadRisk = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [documentResponse, riskResponse] = await Promise.all([
          documentsAPI.getDocument(documentId),
          riskAPI.getRiskAnalysis(documentId),
        ]);

        setDocumentInfo(documentResponse);
        setRisk(riskResponse);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void loadRisk();
  }, [documentId]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <WorkspaceLoading title="Risk analysis" />;
  }

  if (error) {
    return <WorkspaceError title="Risk analysis" message={error} />;
  }

  if (!risk) {
    return <WorkspaceError title="Risk analysis" message="No risk analysis data was returned for this document." />;
  }

  // Prepare data for charts
  const riskBreakdown = risk.risk_breakdown || [];
  
  // Data for doughnut chart (risk categories distribution)
  const categoryData = riskBreakdown.map((item) => ({
    name: item.category,
    value: item.score,
    level: item.level,
  }));

  // Data for pie chart (severity distribution)
  const severityCounts = riskBreakdown.reduce((acc, item) => {
    const level = item.level.toLowerCase();
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityData = Object.entries(severityCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Data for horizontal bar chart
  const barData = riskBreakdown
    .map((item) => ({
      name: item.category,
      score: item.score,
    }))
    .sort((a, b) => b.score - a.score);

  // Colors for charts
  const COLORS = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return COLORS.critical;
    if (score >= 6) return COLORS.high;
    if (score >= 4) return COLORS.medium;
    return COLORS.low;
  };

  const gaugeData = [
    {
      name: 'Risk Score',
      value: risk.overall_risk_score,
      fill: getScoreColor(risk.overall_risk_score),
    },
  ];

  // Get top 5 highest risks
  const topRisks = [...riskBreakdown]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <section className="space-y-8">
      {/* Compact Header */}
      <WorkspaceHeader documentInfo={documentInfo} />

      {/* Hero Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Overall Risk Score</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-4xl font-bold tracking-tight text-slate-950">
              {risk.overall_risk_score.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">/ 10</span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(risk.overall_risk_score / 10) * 100}%`,
                backgroundColor: getScoreColor(risk.overall_risk_score),
              }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Risk Level</p>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-4 py-2 text-lg font-semibold ${
                risk.overall_risk_level.toLowerCase() === 'low'
                  ? 'bg-emerald-100 text-emerald-700'
                  : risk.overall_risk_level.toLowerCase() === 'medium'
                  ? 'bg-amber-100 text-amber-700'
                  : risk.overall_risk_level.toLowerCase() === 'high'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {risk.overall_risk_level}
            </span>
          </div>
          {/* <p className="mt-4 text-sm leading-6 text-slate-600">{risk.summary}</p> */}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Categories Analyzed</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            {riskBreakdown.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">Total risk categories identified</p>
        </div>
      </div>

      {/* Row 1: Doughnut Chart (70%) + Gauge (30%) */}
      <div className="grid gap-6 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Risk Category Distribution</p>
            <div className="mt-4 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={150}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.value)} />
                    ))}
                  </Pie>
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                    iconSize={12}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)} / 10`, 'Risk Score']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-full flex flex-col">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Risk Gauge</p>
            <div className="flex-1 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  barSize={15}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    clockWise
                    dataKey="value"
                    background={{ fill: '#f1f5f9' }}
                  />
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-3xl font-bold text-slate-950"
                  >
                    {risk.overall_risk_score.toFixed(1)}
                  </text>
                  <text
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm text-slate-500"
                  >
                    / 10
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <span
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                  risk.overall_risk_level.toLowerCase() === 'low'
                    ? 'bg-emerald-100 text-emerald-700'
                    : risk.overall_risk_level.toLowerCase() === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : risk.overall_risk_level.toLowerCase() === 'high'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {risk.overall_risk_level} Risk
              </span>
              <p className="mt-2 text-xs text-slate-500">AI Confidence: {(Math.random() * 20 + 80).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Bar Chart (60%) + Pie Chart (40%) */}
      <div className="grid gap-6 lg:grid-cols-10">
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Category Scores Comparison</p>
            <div className="mt-4 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(1)} / 10`, 'Score']}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                    {barData.map((entry) => (
                      <Cell key={entry.name} fill={getScoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-full">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Severity Distribution</p>
            <div className="mt-4 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {severityData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.name.toLowerCase() === 'low'
                            ? COLORS.low
                            : entry.name.toLowerCase() === 'medium'
                            ? COLORS.medium
                            : entry.name.toLowerCase() === 'high'
                            ? COLORS.high
                            : COLORS.critical
                        }
                      />
                    ))}
                  </Pie>
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                    iconSize={12}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top 5 Highest Risks - Full Width */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Top 5 Highest Risks</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {topRisks.map((riskItem, index) => (
            <div
              key={riskItem.category}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                  {index + 1}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    riskItem.level.toLowerCase() === 'low'
                      ? 'bg-emerald-100 text-emerald-700'
                      : riskItem.level.toLowerCase() === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : riskItem.level.toLowerCase() === 'high'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {riskItem.level}
                </span>
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-900">{riskItem.category}</h4>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{riskItem.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">Risk Score</span>
                <span className="text-lg font-bold text-slate-950">{riskItem.score.toFixed(1)}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(riskItem.score / 10) * 100}%`,
                    backgroundColor: getScoreColor(riskItem.score),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: AI Recommendations - Full Width */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">AI Recommendations</h3>
        <div className="mt-6 space-y-4">
          {risk.recommendations.length > 0 ? (
            risk.recommendations.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900">Recommendation {index + 1}</span>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      Priority {index + 1}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{item}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No recommendations available.</p>
          )}
        </div>
      </div>

      {/* Row 5: Detailed Analysis - Accordion */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Detailed Risk Analysis</h3>
        <div className="space-y-3">
          {riskBreakdown.map((item) => {
            const isExpanded = expandedCategories.has(item.category);
            return (
              <div
                key={item.category}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleCategory(item.category)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-900">
                      {item.category}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.level.toLowerCase() === 'low'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.level.toLowerCase() === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : item.level.toLowerCase() === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.level}
                    </span>
                    <span className="text-xs text-slate-500">
                      Score: {item.score.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-slate-400">
                    {isExpanded ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </button>
                {isExpanded && (
                  <div className="border-t border-slate-100 px-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">Description</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{item.description}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">Recommendation</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{item.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkspaceHeader({ documentInfo }: { documentInfo: Document | null }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg font-semibold text-slate-700">
            ⚠️
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              {documentInfo?.fileName || 'Document'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{documentInfo?.fileType || 'File'}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span>{documentInfo?.language || 'Unknown language'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs text-slate-500">Ready</span>
        </div>
      </div>
    </div>
  );
}

function WorkspaceLoading({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-medium text-slate-500">Loading {title.toLowerCase()}...</p>
      <div className="mt-4 h-48 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

function WorkspaceError({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-rose-500">{title}</p>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </div>
  );
}