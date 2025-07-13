'use client';
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Users, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrafficData {
  hour: string;
  visitors: number;
  rsvp: number;
  trend: 'up' | 'down' | 'stable';
}

interface DailyStats {
  date: string;
  totalVisitors: number;
  totalRSVP: number;
  peakHour: string;
  conversionRate: number;
}

const TemporaryTraffic = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from your analytics API
  const hourlyTraffic: TrafficData[] = [
    { hour: '00:00', visitors: 12, rsvp: 2, trend: 'stable' },
    { hour: '01:00', visitors: 8, rsvp: 1, trend: 'down' },
    { hour: '02:00', visitors: 5, rsvp: 0, trend: 'down' },
    { hour: '03:00', visitors: 3, rsvp: 0, trend: 'down' },
    { hour: '04:00', visitors: 7, rsvp: 1, trend: 'up' },
    { hour: '05:00', visitors: 15, rsvp: 3, trend: 'up' },
    { hour: '06:00', visitors: 28, rsvp: 5, trend: 'up' },
    { hour: '07:00', visitors: 45, rsvp: 8, trend: 'up' },
    { hour: '08:00', visitors: 68, rsvp: 12, trend: 'up' },
    { hour: '09:00', visitors: 92, rsvp: 18, trend: 'up' },
    { hour: '10:00', visitors: 85, rsvp: 15, trend: 'down' },
    { hour: '11:00', visitors: 78, rsvp: 14, trend: 'down' },
    { hour: '12:00', visitors: 95, rsvp: 22, trend: 'up' },
    { hour: '13:00', visitors: 88, rsvp: 19, trend: 'down' },
    { hour: '14:00', visitors: 82, rsvp: 16, trend: 'down' },
    { hour: '15:00', visitors: 76, rsvp: 14, trend: 'down' },
    { hour: '16:00', visitors: 89, rsvp: 17, trend: 'up' },
    { hour: '17:00', visitors: 94, rsvp: 21, trend: 'up' },
    { hour: '18:00', visitors: 102, rsvp: 25, trend: 'up' },
    { hour: '19:00', visitors: 87, rsvp: 18, trend: 'down' },
    { hour: '20:00', visitors: 73, rsvp: 14, trend: 'down' },
    { hour: '21:00', visitors: 56, rsvp: 10, trend: 'down' },
    { hour: '22:00', visitors: 42, rsvp: 7, trend: 'down' },
    { hour: '23:00', visitors: 28, rsvp: 4, trend: 'down' },
  ];

  const weeklyStats: DailyStats[] = [
    { date: 'Monday', totalVisitors: 1245, totalRSVP: 234, peakHour: '18:00', conversionRate: 18.8 },
    { date: 'Tuesday', totalVisitors: 1156, totalRSVP: 198, peakHour: '17:00', conversionRate: 17.1 },
    { date: 'Wednesday', totalVisitors: 1398, totalRSVP: 267, peakHour: '19:00', conversionRate: 19.1 },
    { date: 'Thursday', totalVisitors: 1523, totalRSVP: 298, peakHour: '18:00', conversionRate: 19.6 },
    { date: 'Friday', totalVisitors: 1789, totalRSVP: 356, peakHour: '17:00', conversionRate: 19.9 },
    { date: 'Saturday', totalVisitors: 2134, totalRSVP: 445, peakHour: '15:00', conversionRate: 20.8 },
    { date: 'Sunday', totalVisitors: 1876, totalRSVP: 378, peakHour: '14:00', conversionRate: 20.2 },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const currentHour = new Date().getHours();
  const todayData = hourlyTraffic.slice(0, currentHour + 1);
  const totalTodayVisitors = todayData.reduce((sum, data) => sum + data.visitors, 0);
  const totalTodayRSVP = todayData.reduce((sum, data) => sum + data.rsvp, 0);
  const conversionRate = totalTodayVisitors > 0 ? (totalTodayRSVP / totalTodayVisitors * 100) : 0;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3 h-3 text-green-600" />;
      case 'down': return <ArrowDown className="w-3 h-3 text-red-600" />;
      default: return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading traffic data...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Traffic Analytics</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Visitors</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalTodayVisitors.toLocaleString()}</p>
            </div>
            <Users className="w-5 h-5 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">RSVP Count</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalTodayRSVP}</p>
            </div>
            <Calendar className="w-5 h-5 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Conversion Rate</p>
              <p className="text-2xl sm:text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Peak Hour</p>
              <p className="text-2xl sm:text-3xl font-bold">18:00</p>
            </div>
            <Clock className="w-5 h-5 opacity-80" />
          </div>
        </div>
      </div>

      {/* Hourly Traffic */}
      {selectedPeriod === 'today' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Hourly Traffic (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {todayData.map((data, index) => (
                <div key={data.hour} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{data.hour}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(data.trend)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Visitors:</span>
                      <span className="font-medium">{data.visitors}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">RSVP:</span>
                      <span className="font-medium text-green-600">{data.rsvp}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate:</span>
                      <span className={`font-medium ${getTrendColor(data.trend)}`}>
                        {data.visitors > 0 ? ((data.rsvp / data.visitors) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Summary */}
      {selectedPeriod === 'week' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyStats.map((day, index) => (
                <div key={day.date} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{day.date}</h3>
                    <Badge variant="outline" className="text-xs">
                      Peak: {day.peakHour}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Visitors</p>
                      <p className="text-xl font-bold text-blue-600">{day.totalVisitors.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">RSVP</p>
                      <p className="text-xl font-bold text-green-600">{day.totalRSVP}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Rate</p>
                      <p className="text-xl font-bold text-purple-600">{day.conversionRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm">New visitor viewed invitation page</span>
              </div>
              <span className="text-xs text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Guest confirmed attendance</span>
              </div>
              <span className="text-xs text-gray-500">5 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Invitation shared via WhatsApp</span>
              </div>
              <span className="text-xs text-gray-500">8 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Peak traffic hour detected</span>
              </div>
              <span className="text-xs text-gray-500">12 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemporaryTraffic; 