import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Users,
  Clock,
  Bot,
  UserCheck,
  AlertCircle,
  Calendar,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { getMessageStatistics } from '../../lib/api/whatsappMessages';

interface AnalyticsDashboardProps {
  companyId: string;
  dateRange?: { start: string; end: string };
}

export default function AnalyticsDashboard({ companyId, dateRange }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadStatistics();
  }, [companyId, timeFilter]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let start: Date;

      if (timeFilter === 'today') {
        start = new Date(now.setHours(0, 0, 0, 0));
      } else if (timeFilter === 'week') {
        start = new Date(now.setDate(now.getDate() - 7));
      } else {
        start = new Date(now.setMonth(now.getMonth() - 1));
      }

      const data = await getMessageStatistics(companyId, {
        start: start.toISOString(),
        end: new Date().toISOString()
      });

      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">No data available</p>
      </div>
    );
  }

  const responseRate = stats.total > 0
    ? ((stats.bot + stats.agent) / stats.customer * 100).toFixed(1)
    : '0';

  const automationRate = (stats.bot + stats.agent) > 0
    ? (stats.bot / (stats.bot + stats.agent) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTimeFilter('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === 'today'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-secondary/50 text-muted hover:bg-secondary'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeFilter('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === 'week'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-secondary/50 text-muted hover:bg-secondary'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeFilter('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === 'month'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-secondary/50 text-muted hover:bg-secondary'
          }`}
        >
          Last 30 Days
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Messages */}
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.total.toLocaleString()}</p>
          <p className="text-sm text-muted">Total Messages</p>
        </div>

        {/* Customer Messages */}
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.customer.toLocaleString()}</p>
          <p className="text-sm text-muted">Customer Messages</p>
        </div>

        {/* Bot Responses */}
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-purple-400 font-medium">{automationRate}%</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.bot.toLocaleString()}</p>
          <p className="text-sm text-muted">AI Responses</p>
        </div>

        {/* Agent Responses */}
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400 font-medium">{responseRate}%</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.agent.toLocaleString()}</p>
          <p className="text-sm text-muted">Agent Responses</p>
        </div>
      </div>

      {/* Message Type Breakdown */}
      <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6">Message Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.by_type).map(([type, count]: [string, any]) => (
            <div key={type} className="text-center p-4 bg-secondary/30 rounded-lg">
              <p className="text-2xl font-bold text-white mb-1">{count}</p>
              <p className="text-xs text-muted capitalize">{type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6">Customer Sentiment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Positive */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Smile className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted mb-1">Positive</p>
              <p className="text-2xl font-bold text-white">
                {stats.by_sentiment.positive || 0}
              </p>
              <div className="w-full bg-secondary/50 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.total > 0 ? ((stats.by_sentiment.positive || 0) / stats.customer * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Neutral */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-500/20 rounded-lg">
              <Meh className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted mb-1">Neutral</p>
              <p className="text-2xl font-bold text-white">
                {stats.by_sentiment.neutral || 0}
              </p>
              <div className="w-full bg-secondary/50 rounded-full h-2 mt-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.total > 0 ? ((stats.by_sentiment.neutral || 0) / stats.customer * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Negative */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Frown className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted mb-1">Negative</p>
              <p className="text-2xl font-bold text-white">
                {stats.by_sentiment.negative || 0}
              </p>
              <div className="w-full bg-secondary/50 rounded-full h-2 mt-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.total > 0 ? ((stats.by_sentiment.negative || 0) / stats.customer * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Response Rate */}
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Response Rate</h3>
            <Clock className="w-5 h-5 text-muted" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-white">{responseRate}%</p>
            <p className="text-sm text-green-400 mb-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Good
            </p>
          </div>
          <p className="text-xs text-muted mt-2">
            Percentage of customer messages that received a response
          </p>
        </div>

        {/* Automation Rate */}
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Automation Rate</h3>
            <Bot className="w-5 h-5 text-muted" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-white">{automationRate}%</p>
            <p className="text-sm text-purple-400 mb-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Efficient
            </p>
          </div>
          <p className="text-xs text-muted mt-2">
            Percentage of responses handled by AI vs human agents
          </p>
        </div>
      </div>
    </div>
  );
}
