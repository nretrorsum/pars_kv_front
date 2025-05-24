import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Home, TrendingUp, MapPin, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const TestRealEstateAnalytics = () => {
  // Стани для фільтрів
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedRooms, setSelectedRooms] = useState('all');
  
  // Стани для даних
  const [apartmentsByDistrict, setApartmentsByDistrict] = useState([]);
  const [pricePerSqm, setPricePerSqm] = useState([]);
  const [avgApartmentPrice, setAvgApartmentPrice] = useState([]);
  
  // Стани для завантаження та помилок
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Кольори для графіків
  const COLORS = ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#6366F1', '#818CF8'];

  // Функція для завантаження даних
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Використовуємо axios для паралельних запитів
      const [apartmentsRes, pricesRes, avgPricesRes] = await Promise.all([
        axios.get('https://your-api.com/api/districts'),
        axios.get('https://your-api.com/api/prices'),
        axios.get('https://your-api.com/api/avg-prices')
      ]);

      // Трансформація даних (якщо API повертає дані в іншому форматі)
      const transformedApartments = apartmentsRes.data.map(item => ({
        district: item.district,
        total: item.total,
        rooms1: item.byRooms?.["1"] || 0,
        rooms2: item.byRooms?.["2"] || 0,
        rooms3: item.byRooms?.["3"] || 0,
        rooms4: item.byRooms?.["4"] || 0
      }));

      setApartmentsByDistrict(transformedApartments);
      setPricePerSqm(pricesRes.data);
      setAvgApartmentPrice(avgPricesRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Не вдалося завантажити дані');
    } finally {
      setIsLoading(false);
    }
  };

  // Завантажуємо дані при першому рендері
  useEffect(() => {
    fetchData();
  }, []);

  // Функція для фільтрації даних
  const getFilteredData = (data) => {
    if (selectedDistrict === 'all') return data;
    return data.filter(item => item.district === selectedDistrict);
  };

  // Підготовка даних для кругової діаграми
  const pieData = apartmentsByDistrict.map((item, index) => ({
    name: item.district,
    value: item.total,
    color: COLORS[index]
  }));

  // Розрахунок загальної статистики
  const totalApartments = apartmentsByDistrict.reduce((sum, item) => sum + item.total, 0);
  const avgPriceOverall = apartmentsByDistrict.length > 0 
    ? Math.round(pricePerSqm.reduce((sum, item) => sum + item.avgPrice, 0) / pricePerSqm.length)
    : 0;

  // Стан завантаження
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-purple-300">Завантаження даних...</p>
        </div>
      </div>
    );
  }

  // Стан помилки
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center p-6 bg-gray-800/80 rounded-xl border border-red-500/30 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Помилка</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={fetchData} 
            className="flex items-center justify-center mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  // Стан відсутності даних
  if (apartmentsByDistrict.length === 0 || pricePerSqm.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center p-6 bg-gray-800/80 rounded-xl border border-purple-500/30 max-w-md">
          <h2 className="text-2xl font-bold text-purple-400 mb-2">Немає даних</h2>
          <p className="text-gray-300 mb-6">Не знайдено даних для відображення</p>
          <button 
            onClick={fetchData} 
            className="flex items-center justify-center mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Оновити дані
          </button>
        </div>
      </div>
    );
  }

  // Основний інтерфейс
  return (
    <div className="text-white min-h-screen bg-gray-950">
      <div className="container mx-auto px-6 py-8 h-full">
        {/* Заголовок та інформація про оновлення */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Home className="w-12 h-12 text-purple-400 mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
              Аналітика ринку нерухомості
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Комплексний аналіз квартирного ринку по районах міста з детальною статистикою цін та пропозицій
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-4">
              Останнє оновлення: {lastUpdated.toLocaleString()}
              <button 
                onClick={fetchData} 
                className="ml-2 text-purple-400 hover:text-purple-300 transition-colors"
                title="Оновити дані"
              >
                <RefreshCw className="w-4 h-4 inline" />
              </button>
            </p>
          )}
        </div>

        {/* Картки статистики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 shadow-2xl border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Всього квартир</p>
                <p className="text-3xl font-bold text-white">{totalApartments.toLocaleString()}</p>
              </div>
              <Home className="w-10 h-10 text-purple-300" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 shadow-2xl border border-violet-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-200 text-sm font-medium">Середня ціна за м²</p>
                <p className="text-3xl font-bold text-white">{avgPriceOverall.toLocaleString()} ₴</p>
              </div>
              <DollarSign className="w-10 h-10 text-violet-300" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 shadow-2xl border border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm font-medium">Районів</p>
                <p className="text-3xl font-bold text-white">{apartmentsByDistrict.length}</p>
              </div>
              <MapPin className="w-10 h-10 text-indigo-300" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-600/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm font-medium">Зростання ринку</p>
                <p className="text-3xl font-bold text-white">+12%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-gray-300" />
            </div>
          </div>
        </div>

        {/* Фільтри */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Район</label>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-gray-800 border border-purple-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Всі райони</option>
                {apartmentsByDistrict.map(item => (
                  <option key={item.district} value={item.district}>{item.district}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Кількість кімнат</label>
              <select 
                value={selectedRooms} 
                onChange={(e) => setSelectedRooms(e.target.value)}
                className="w-full bg-gray-800 border border-purple-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Всі типи</option>
                <option value="rooms1">1 кімната</option>
                <option value="rooms2">2 кімнати</option>
                <option value="rooms3">3 кімнати</option>
                <option value="rooms4">4+ кімнати</option>
              </select>
            </div>
          </div>
        </div>

        {/* Графіки */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Кількість квартир по районах */}
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Home className="w-6 h-6 text-purple-400 mr-2" />
              Кількість квартир по районах
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={getFilteredData(apartmentsByDistrict)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="district" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #6B46C1',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Legend />
                <Bar dataKey="rooms1" stackId="a" fill="#8B5CF6" name="1 кімната" />
                <Bar dataKey="rooms2" stackId="a" fill="#A855F7" name="2 кімнати" />
                <Bar dataKey="rooms3" stackId="a" fill="#C084FC" name="3 кімнати" />
                <Bar dataKey="rooms4" stackId="a" fill="#DDD6FE" name="4+ кімнати" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ціна за м² по районах */}
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <DollarSign className="w-6 h-6 text-violet-400 mr-2" />
              Ціна за м² по районах
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getFilteredData(pricePerSqm)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="district" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #7C3AED',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value) => [`${value.toLocaleString()} ₴`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="rooms1" stroke="#8B5CF6" strokeWidth={3} name="1 кімната" />
                <Line type="monotone" dataKey="rooms2" stroke="#A855F7" strokeWidth={3} name="2 кімнати" />
                <Line type="monotone" dataKey="rooms3" stroke="#C084FC" strokeWidth={3} name="3 кімнати" />
                <Line type="monotone" dataKey="rooms4" stroke="#DDD6FE" strokeWidth={3} name="4+ кімнати" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Додаткові графіки */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Розподіл по районах */}
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <MapPin className="w-6 h-6 text-purple-400 mr-2" />
              Розподіл по районах
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={12}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #6B46C1',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Середня вартість квартир */}
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-indigo-400 mr-2" />
              Середня вартість квартир
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={getFilteredData(avgApartmentPrice)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="district" type="category" stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #6366F1',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                  formatter={(value) => [`${(value / 1000000).toFixed(1)}М ₴`, '']}
                />
                <Legend />
                <Bar dataKey="rooms1" fill="#8B5CF6" name="1 кімната" />
                <Bar dataKey="rooms2" fill="#A855F7" name="2 кімнати" />
                <Bar dataKey="rooms3" fill="#C084FC" name="3 кімнати" />
                <Bar dataKey="rooms4" fill="#DDD6FE" name="4+ кімнати" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Детальна таблиця */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Детальна таблиця по районах</h3>
            <button 
              onClick={fetchData}
              className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Оновити
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="py-4 px-4 text-gray-300 font-semibold">Район</th>
                  <th className="py-4 px-4 text-gray-300 font-semibold">Всього квартир</th>
                  <th className="py-4 px-4 text-gray-300 font-semibold">Ціна за м²</th>
                  <th className="py-4 px-4 text-gray-300 font-semibold">1 кімн</th>
                  <th className="py-4 px-4 text-gray-300 font-semibold">2 кімн</th>
                  <th className="py-4 px-4 text-gray-300 font-semibold">3 кімн</th>
                  <th className="py-4 px-4 text-gray-300 font-semibold">4+ кімн</th>
                </tr>
              </thead>
              <tbody>
                {apartmentsByDistrict.map((district, index) => {
                  const priceData = pricePerSqm.find(p => p.district === district.district);
                  return (
                    <tr key={district.district} className="border-b border-gray-700/50 hover:bg-purple-900/20 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{district.district}</td>
                      <td className="py-4 px-4 text-gray-300">{district.total.toLocaleString()}</td>
                      <td className="py-4 px-4 text-purple-400 font-semibold">
                        {priceData?.avgPrice ? priceData.avgPrice.toLocaleString() + ' ₴' : '—'}
                      </td>
                      <td className="py-4 px-4 text-gray-300">{district.rooms1}</td>
                      <td className="py-4 px-4 text-gray-300">{district.rooms2}</td>
                      <td className="py-4 px-4 text-gray-300">{district.rooms3}</td>
                      <td className="py-4 px-4 text-gray-300">{district.rooms4}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRealEstateAnalytics;