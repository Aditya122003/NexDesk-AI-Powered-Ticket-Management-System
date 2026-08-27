import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import StatusPieChart from '../components/Charts/StatusPieChart';
import PriorityBarChart from '../components/Charts/PriorityBarChart';
import CategoryChart from '../components/Charts/CategoryChart';
import TrendLineChart from '../components/Charts/TrendLineChart';
import ChartHeaderMenu from '../components/Charts/ChartHeaderMenu';
import ClassificationLogsModal from '../components/ClassificationLogsModal';
import LoadingSpinner from '../components/LoadingSpinner';
import html2canvas from 'html2canvas';
import {
  BarChart3, TrendingUp, CheckCircle, Clock, Users, ArrowLeft, RefreshCw,
  Sparkles, Shield, Zap, Activity, Award, Filter, LineChart as LineIcon,
  Layers, BarChart as BarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(() => Date.now());
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Chart Cards Element Refs
  const pieCardRef = useRef(null);
  const prioCardRef = useRef(null);
  const catCardRef = useRef(null);
  const trendCardRef = useRef(null);

  // Individual Label Toggle States (Default ON)
  const [pieLabels, setPieLabels] = useState(true);
  const [prioLabels, setPrioLabels] = useState(true);
  const [catLabels, setCatLabels] = useState(true);
  const [trendLabels, setTrendLabels] = useState(true);

  // Timeline Filters & Chart Mode Switcher State
  const [timelineRange, setTimelineRange] = useState('7D'); // '1D' | '7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area' | 'line'

  const handleDownloadChart = async (elementRef, fileName) => {
    if (!elementRef || !elementRef.current) return;
    try {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `${fileName}_NexDesk.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('[Analytics Download] Failed to export chart image:', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.error('[Analytics] Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setAnimKey(Date.now());
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    setAnimKey(Date.now());
  }, [timelineRange, chartType]);

  if (loading) {
    return <LoadingSpinner message="Generating NexDesk System Analytics & AI Triage Insights..." fullPage={true} />;
  }

  const { metrics, statusBreakdown, priorityBreakdown, categoryBreakdown, timelineData } = analytics || {};

  return (
    <div className="page-wrapper" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        @keyframes chartCardSlideUp {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-chart-card {
          animation: chartCardSlideUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            onClick={() => navigate('/admin')}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '0.5rem'
            }}
          >
            <ArrowLeft size={14} /> Back to Command Center
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              System Analytics Hub
            </h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🟢 Live Stream Active
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchAnalytics}
            style={{
              backgroundColor: '#032d1f',
              color: '#a3e635',
              fontWeight: 800,
              fontSize: '0.875rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={16} /> Refresh Metrics
          </button>
        </div>
      </div>

      {/* Top Key Metrics Strip - Moved to Top with Shortened Labels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Metric 1: Created */}
        <div
          className="animate-chart-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            animationDelay: '0ms'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Created
            </span>
            <div style={{ backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '8px', padding: '6px' }}>
              <BarChart3 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
            {metrics?.totalTickets !== undefined ? metrics.totalTickets.toLocaleString() : '0'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total tickets raised</span>
        </div>

        {/* Metric 2: Resolved */}
        <div
          className="animate-chart-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #a7f3d0',
            boxShadow: '0 4px 12px rgba(4, 120, 87, 0.04)',
            animationDelay: '50ms'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resolved
            </span>
            <div style={{ backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '8px', padding: '6px' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#047857' }}>
            {metrics?.resolvedTickets !== undefined ? metrics.resolvedTickets.toLocaleString() : '0'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>
            {metrics?.totalTickets ? Math.round((metrics.resolvedTickets / metrics.totalTickets) * 100) : 0}% resolved rate
          </span>
        </div>

        {/* Metric 3: In Progress */}
        <div
          className="animate-chart-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #fde68a',
            boxShadow: '0 4px 12px rgba(180, 83, 9, 0.04)',
            animationDelay: '100ms'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              In Progress
            </span>
            <div style={{ backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px', padding: '6px' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#b45309' }}>
            {metrics?.inProgressTickets !== undefined ? metrics.inProgressTickets.toLocaleString() : '0'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>Active in queue</span>
        </div>

        {/* Metric 4: Open */}
        <div
          className="animate-chart-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #bfdbfe',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.04)',
            animationDelay: '150ms'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Open
            </span>
            <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', padding: '6px' }}>
              <Zap size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1d4ed8' }}>
            {metrics?.openTickets !== undefined ? metrics.openTickets.toLocaleString() : '0'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700 }}>Awaiting action</span>
        </div>
      </div>

      {/* Hero Analytics Overview Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        {/* HERO CARD 1: System Breakdown Progress */}
        <div
          className="animate-chart-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: '200ms'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🎫 Ticket Volume Ratio
            </span>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
              Ratio ▾
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            {metrics?.totalTickets !== undefined ? metrics.totalTickets.toLocaleString() : '0'} <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 700 }}>Total</span>
          </div>

          {/* Multi Color Gradient Progress Bar */}
          {(() => {
            const total = metrics?.totalTickets || 1;
            const resolved = metrics?.resolvedTickets || 0;
            const inProgress = metrics?.inProgressTickets || 0;
            const open = metrics?.openTickets || 0;
            const resPct = Math.round((resolved / total) * 100) || 0;
            const progPct = Math.round((inProgress / total) * 100) || 0;
            const openPct = Math.min(100 - resPct - progPct, Math.round((open / total) * 100)) || 0;

            return (
              <>
                <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#f1f5f9', display: 'flex', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{ width: `${resPct}%`, backgroundColor: '#047857' }} title={`Resolved (${resPct}%)`}></div>
                  <div style={{ width: `${progPct}%`, backgroundColor: '#b45309' }} title={`In Progress (${progPct}%)`}></div>
                  <div style={{ width: `${openPct}%`, backgroundColor: '#1d4ed8' }} title={`Open (${openPct}%)`}></div>
                </div>

                {/* Color Pills & Gain Badges */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 800, backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    ● Resolved {resPct}%
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 800, backgroundColor: '#fffbeb', padding: '3px 10px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    ● In Progress {progPct}%
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 800, backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    ● Open {openPct}%
                  </span>
                </div>
              </>
            );
          })()}
        </div>

        {/* HERO CARD 2: Groq AI Triage Index */}
        <div
          className="animate-chart-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
            animationDelay: '250ms'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} style={{ color: '#7e22ce' }} />
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Groq AI Auto-Triage Status
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#f3e8ff', color: '#7e22ce', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
              Groq Llama 3 ▾
            </span>
          </div>

          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#7e22ce', marginBottom: '0.75rem' }}>
            100% <span style={{ fontSize: '1rem', color: '#15803d', fontWeight: 800, backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '8px' }}>Active</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0', fontWeight: 600 }}>
            Automated category prediction & priority tagging active for 100% of customer support requests.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsLogsModalOpen(true)}
              style={{
                backgroundColor: '#f3e8ff',
                color: '#7e22ce',
                fontWeight: 800,
                border: '1.5px solid #d8b4fe',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 10px rgba(126, 34, 206, 0.12)',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={15} /> View Classification Logs
            </button>
          </div>
        </div>
      </div>

      {/* RESOLUTION TIMELINE CHART CARD (PLACED IN MIDDLE) */}
      <div
        ref={trendCardRef}
        className="animate-chart-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.75rem',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
          marginBottom: '2rem',
          animationDelay: '200ms'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Resolution Timeline & Ticket Creation Trends
              </h3>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Total Stream Volume: <strong>{metrics?.totalTickets || 0} Tickets</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>Real-time synced</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* CHART TYPE MODE SWITCHER CONTROLS */}
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '9999px', padding: '3px', border: '1.5px solid #cbd5e1' }}>
              <button
                onClick={() => setChartType('area')}
                style={{
                  backgroundColor: chartType === 'area' ? '#047857' : 'transparent',
                  color: chartType === 'area' ? '#ffffff' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Layers size={13} /> Area Wave
              </button>

              <button
                onClick={() => setChartType('bar')}
                style={{
                  backgroundColor: chartType === 'bar' ? '#047857' : 'transparent',
                  color: chartType === 'bar' ? '#ffffff' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <BarIcon size={13} /> Bar Columns
              </button>

              <button
                onClick={() => setChartType('line')}
                style={{
                  backgroundColor: chartType === 'line' ? '#047857' : 'transparent',
                  color: chartType === 'line' ? '#ffffff' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <LineIcon size={13} /> Line Graph
              </button>
            </div>

            {/* TIMELINE RANGE FILTER PILLS */}
            <div style={{ display: 'flex', gap: '3px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '9999px', border: '1px solid #cbd5e1' }}>
              {['1D', '7D', '1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimelineRange(range)}
                  style={{
                    backgroundColor: timelineRange === range ? '#ffffff' : 'transparent',
                    color: timelineRange === range ? '#0f172a' : '#64748b',
                    fontWeight: timelineRange === range ? 900 : 700,
                    boxShadow: timelineRange === range ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Chart Action Dropdown Menu */}
            <ChartHeaderMenu
              showLabels={trendLabels}
              onToggleLabels={() => setTrendLabels(!trendLabels)}
              onDownload={() => handleDownloadChart(trendCardRef, 'Resolution_Timeline')}
            />
          </div>
        </div>

        {/* Dynamic Recharts Visualization Component */}
        <TrendLineChart key={`trend-${animKey}`} data={timelineData} chartType={chartType} showLabels={trendLabels} />
      </div>

      {/* Grid of 3 Detailed Visual Analytics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* CARD 1: Status Donut Chart */}
        <div ref={pieCardRef} className="animate-chart-card" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #cbd5e1', boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)', animationDelay: '300ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Ticket Status Distribution
            </h3>
            <ChartHeaderMenu
              showLabels={pieLabels}
              onToggleLabels={() => setPieLabels(!pieLabels)}
              onDownload={() => handleDownloadChart(pieCardRef, 'Status_Distribution')}
            />
          </div>
          <StatusPieChart key={`pie-${animKey}`} data={statusBreakdown} showLabels={pieLabels} />
        </div>

        {/* CARD 2: Priority Bottleneck Breakdown */}
        <div ref={prioCardRef} className="animate-chart-card" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #cbd5e1', boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)', animationDelay: '400ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Priority Bottlenecks
            </h3>
            <ChartHeaderMenu
              showLabels={prioLabels}
              onToggleLabels={() => setPrioLabels(!prioLabels)}
              onDownload={() => handleDownloadChart(prioCardRef, 'Priority_Bottlenecks')}
            />
          </div>
          <PriorityBarChart key={`prio-${animKey}`} data={priorityBreakdown} showLabels={prioLabels} />
        </div>

        {/* CARD 3: Support Category Distribution */}
        <div ref={catCardRef} className="animate-chart-card" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1.5px solid #cbd5e1', boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)', animationDelay: '500ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Category Breakdown
            </h3>
            <ChartHeaderMenu
              showLabels={catLabels}
              onToggleLabels={() => setCatLabels(!catLabels)}
              onDownload={() => handleDownloadChart(catCardRef, 'Category_Breakdown')}
            />
          </div>
          <CategoryChart key={`cat-${animKey}`} data={categoryBreakdown} showLabels={catLabels} />
        </div>
      </div>

      {/* AI Classification Logs Modal */}
      <ClassificationLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={analytics?.classificationLogs || []}
      />
    </div>
  );
};

export default AdminAnalyticsPage;
