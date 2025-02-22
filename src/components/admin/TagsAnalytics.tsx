'use client';

import { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

// 注册所有需要的 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface QuestionData {
  PK: string;
  question: string;
  questionId: string;
  tags: string[];
  timestamp: string;
}

interface TagCount {
  tag: string;
  count: number;
}

export default function TagsAnalytics() {
  const [tagStats, setTagStats] = useState<{ [key: string]: number }>({});
  const [timeStats, setTimeStats] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTagStats();
  }, []);

  const fetchTagStats = async () => {
    try {
      const response = await fetch('/api/admin/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      const questions: QuestionData[] = data.questions;

      // 统计标签出现次数
      const stats: { [key: string]: number } = {};
      const timeData: { [key: string]: number } = {};

      questions.forEach(question => {
        // 处理标签统计
        question.tags.forEach(tag => {
          stats[tag] = (stats[tag] || 0) + 1;
        });

        // 处理时间统计
        const date = new Date(question.timestamp).toLocaleDateString();
        timeData[date] = (timeData[date] || 0) + 1;
      });

      setTagStats(stats);
      setTimeStats(timeData);
    } catch (error) {
      console.error('Error fetching tag stats:', error);
      setError('Failed to load tag statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const processTagData = (stats: { [key: string]: number }): { 
    labels: string[], 
    data: number[],
    originalCount: number 
  } => {
    // 转换为数组并排序
    const sortedTags: TagCount[] = Object.entries(stats)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // 只获取前10个标签
    const top10Tags = sortedTags.slice(0, 10);
    
    return { 
      labels: top10Tags.map(item => item.tag),
      data: top10Tags.map(item => item.count),
      originalCount: sortedTags.length 
    };
  };

  const { labels, data, originalCount } = processTagData(tagStats);

  // 统一的颜色方案
  const colorPalette = [
    'rgba(99, 102, 241, 0.7)',   // Indigo
    'rgba(59, 130, 246, 0.7)',   // Blue
    'rgba(14, 165, 233, 0.7)',   // Sky
    'rgba(6, 182, 212, 0.7)',    // Cyan
    'rgba(20, 184, 166, 0.7)',   // Teal
    'rgba(16, 185, 129, 0.7)',   // Emerald
    'rgba(52, 211, 153, 0.7)',   // Green
    'rgba(132, 204, 22, 0.7)',   // Lime
    'rgba(250, 204, 21, 0.7)',   // Yellow
    'rgba(245, 158, 11, 0.7)',   // Amber
  ];

  // 统一的图表配置基础
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const barChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Frequency',
        data: data,
        backgroundColor: colorPalette,
        borderWidth: 0,  // 移除边框
        borderRadius: 6, // 添加圆角
      },
    ],
  };

  const pieChartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: colorPalette,
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const timeChartData = {
    labels: Object.keys(timeStats).sort(),
    datasets: [
      {
        label: 'Questions per Day',
        data: Object.keys(timeStats).sort().map(date => timeStats[date]),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 0.7)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(99, 102, 241, 0.7)',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 20,
        top: 20,
        bottom: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          font: {
            size: 11,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label: string, i: number) => ({
              text: `${label.substring(0, 20)}${label.length > 20 ? '...' : ''} (${datasets[0].data[i]})`,
              fillStyle: colorPalette[i],
              index: i,
              datasetIndex: 0,
            }));
          },
        },
      },
      title: {
        display: true,
        text: 'Tag Distribution',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  const timeChartOptions = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        ...baseChartOptions.plugins.title,
        text: 'Daily Question Trends',
      },
    },
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        ticks: {
          ...baseChartOptions.scales.y.ticks,
          callback: (value: number) => Math.floor(value),
        },
      },
    },
  };

  if (isLoading) return <div>Loading tag statistics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* 顶部统计卡片 - 使用统一的颜色 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-indigo-500">
          <h3 className="text-lg font-medium text-gray-900">Total Questions</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">
            {Object.values(timeStats).reduce((a, b) => a + b, 0)}
          </p>
          <p className="mt-1 text-sm text-gray-500">All time questions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-900">Unique Tags</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {originalCount}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Showing top 10 of {originalCount} categories
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-sky-500">
          <h3 className="text-lg font-medium text-gray-900">Today's Questions</h3>
          <p className="mt-2 text-3xl font-semibold text-sky-600">
            {timeStats[new Date().toLocaleDateString()] || 0}
          </p>
          <p className="mt-1 text-sm text-gray-500">Questions asked today</p>
        </div>
      </div>

      {/* 图表网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 柱状图 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Most Popular Tags</h2>
          <div className="h-[400px] relative">
            <Bar 
              data={barChartData} 
              options={baseChartOptions}
            />
          </div>
        </div>

        {/* 饼图 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tags Distribution</h2>
          <div className="h-[400px] relative">
            <Pie 
              data={pieChartData} 
              options={pieChartOptions} 
            />
          </div>
        </div>

        {/* 时间趋势图 - 跨越整行 */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Questions Trend</h2>
          <div className="h-[300px] relative">
            <Line 
              data={timeChartData} 
              options={timeChartOptions} 
            />
          </div>
        </div>
      </div>
    </div>
  );
} 