import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data states
  const [platformStats, setPlatformStats] = useState(null);
  const [tripStats, setTripStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);
  const [topDrivers, setTopDrivers] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  
  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [interval, setInterval] = useState('month');
  
  useEffect(() => {
    // Check if user has appropriate permissions
    if (!user || !['admin'].includes(user.role)) {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Replace getAccessToken with direct access to localStorage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      // Fetch all required data in parallel
      const [
        platformStatsRes,
        tripStatsRes,
        userGrowthRes,
        revenueStatsRes,
        topDriversRes,
        popularRoutesRes
      ] = await Promise.all([
        axios.get(`${API_URL}/analytics/platform`, { headers }),
        axios.get(`${API_URL}/analytics/trips`, { 
          headers,
          params: dateRange
        }),
        axios.get(`${API_URL}/analytics/user-growth`, { 
          headers,
          params: { ...dateRange, interval }
        }),
        axios.get(`${API_URL}/analytics/revenue`, { 
          headers,
          params: { ...dateRange, interval }
        }),
        axios.get(`${API_URL}/analytics/top-drivers`, { 
          headers,
          params: { limit: 10, sortBy: 'rating' }
        }),
        axios.get(`${API_URL}/analytics/popular-routes`, { 
          headers,
          params: { limit: 10 }
        })
      ]);
      
      setPlatformStats(platformStatsRes.data);
      setTripStats(tripStatsRes.data);
      setUserGrowth(userGrowthRes.data);
      setRevenueStats(revenueStatsRes.data);
      setTopDrivers(topDriversRes.data);
      setPopularRoutes(popularRoutesRes.data);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to fetch analytics data');
      toast.error('Failed to load analytics dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleIntervalChange = (e) => {
    setInterval(e.target.value);
  };
  
  const handleRefresh = () => {
    fetchDashboardData();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Interval</label>
              <select
                value={interval}
                onChange={handleIntervalChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'trips' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('trips')}
        >
          Trips
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'revenue' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'drivers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('drivers')}
        >
          Drivers
        </button>
      </div>
      
      {/* Dashboard Content */}
      {activeTab === 'overview' && platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{platformStats.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-2">Active user accounts</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Drivers</h3>
            <p className="text-3xl font-bold text-green-600">{platformStats.totalDrivers}</p>
            <p className="text-sm text-gray-500 mt-2">Active driver accounts</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Trips</h3>
            <p className="text-3xl font-bold text-purple-600">{platformStats.totalTrips}</p>
            <p className="text-sm text-gray-500 mt-2">All-time trip count</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-yellow-600">${platformStats.totalEarnings?.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Platform revenue</p>
          </div>
        </div>
      )}
      
      {activeTab === 'overview' && tripStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Trip Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Scheduled', value: tripStats.scheduledTrips },
                      { name: 'In Progress', value: tripStats.inProgressTrips },
                      { name: 'Completed', value: tripStats.completedTrips },
                      { name: 'Cancelled', value: tripStats.cancelledTrips }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Scheduled', value: tripStats.scheduledTrips },
                      { name: 'In Progress', value: tripStats.inProgressTrips },
                      { name: 'Completed', value: tripStats.completedTrips },
                      { name: 'Cancelled', value: tripStats.cancelledTrips }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600">{tripStats.completionRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{tripStats.averageRating || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600">{platformStats?.conversionRate || 'N/A'}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Trips</p>
                <p className="text-2xl font-bold text-purple-600">{platformStats?.completedTrips || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'users' && userGrowth.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">User Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={userGrowth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {activeTab === 'trips' && popularRoutes.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Popular Routes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={popularRoutes.map(route => ({
                  route: `${route.startLocation.address.substring(0, 15)}...→${route.endLocation.address.substring(0, 15)}...`,
                  tripCount: route.tripCount
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tripCount" fill="#8884d8" name="Number of Trips" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {activeTab === 'revenue' && revenueStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {activeTab === 'drivers' && topDrivers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Drivers</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trips
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {driver.avatar ? (
                          <img className="h-10 w-10 rounded-full" src={driver.avatar} alt="" />
                        ) : (
                          <span className="text-gray-500 text-lg">{driver.firstName.charAt(0)}{driver.lastName.charAt(0)}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {driver.firstName} {driver.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      {driver.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.completedTrips}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${driver.totalEarnings?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 