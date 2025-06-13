import React, { useState, useEffect } from 'react';
import { Users, Store, Star, Plus, Search, Filter, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';

interface DashboardStats {
  total_users: number;
  total_stores: number;
  total_ratings: number;
  role_breakdown: Array<{ role: string; count: number }>;
  recent_ratings: Array<{
    rating: number;
    created_at: string;
    user_name: string;
    store_name: string;
  }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: string;
  rating?: number;
  created_at: string;
}

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  rating: number;
  total_ratings: number;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores' | 'add-user' | 'add-store'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab, searchTerm, roleFilter, sortBy, sortOrder]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`/users?${params}`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`/stores?${params}`);
      setStores(response.data);
    } catch (error) {
      toast.error('Failed to fetch stores');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/users', userForm);
      toast.success('User created successfully');
      setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
      setActiveTab('users');
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || 'Failed to create user';
      toast.error(errorMsg);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/stores', storeForm);
      toast.success('Store created successfully');
      setStoreForm({ name: '', email: '', address: '' });
      setActiveTab('stores');
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || 'Failed to create store';
      toast.error(errorMsg);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600">Manage users, stores, and monitor platform activity</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-2 border border-gray-200/50">
        <nav className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'stores', label: 'Stores', icon: Store },
            { id: 'add-user', label: 'Add User', icon: Plus },
            { id: 'add-store', label: 'Add Store', icon: Plus }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-indigo-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Users</p>
                  <p className="text-3xl font-bold">{stats.total_users}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Total Stores</p>
                  <p className="text-3xl font-bold">{stats.total_stores}</p>
                </div>
                <Store className="h-12 w-12 text-emerald-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Total Ratings</p>
                  <p className="text-3xl font-bold">{stats.total_ratings}</p>
                </div>
                <Star className="h-12 w-12 text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Role Breakdown */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <h3 className="text-xl font-semibold mb-4">User Role Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.role_breakdown.map((role) => (
                <div key={role.role} className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 capitalize">{role.role.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-indigo-600">{role.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <h3 className="text-xl font-semibold mb-4">Recent Ratings</h3>
            <div className="space-y-3">
              {stats.recent_ratings.map((rating, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StarRating rating={rating.rating} size="sm" />
                    <span className="text-sm text-gray-600">
                      <strong>{rating.user_name}</strong> rated <strong>{rating.store_name}</strong>
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h3 className="text-xl font-semibold">Users Management</h3>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'role', label: 'Role' },
                    { key: 'created_at', label: 'Joined' }
                  ].map((header) => (
                    <th
                      key={header.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort(header.key)}
                    >
                      {header.label}
                      {sortBy === header.key && (
                        <span className="ml-1">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'store_owner' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.rating ? (
                        <StarRating rating={user.rating} size="sm" />
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h3 className="text-xl font-semibold">Stores Management</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  {[
                    { key: 'name', label: 'Store Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'address', label: 'Address' },
                    { key: 'created_at', label: 'Added' }
                  ].map((header) => (
                    <th
                      key={header.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort(header.key)}
                    >
                      {header.label}
                      {sortBy === header.key && (
                        <span className="ml-1">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{store.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{store.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="max-w-xs truncate">{store.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(store.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <StarRating rating={store.rating} size="sm" />
                        <span className="text-xs text-gray-500 mt-1">
                          {store.total_ratings} review{store.total_ratings !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Tab */}
      {activeTab === 'add-user' && (
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-gray-200/50">
          <h3 className="text-2xl font-semibold mb-6">Add New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name (20-60 characters)
                </label>
                <input
                  type="text"
                  required
                  minLength={20}
                  maxLength={60}
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
                <p className="mt-1 text-xs text-gray-500">{userForm.name.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  maxLength={16}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address (max 400 characters)
              </label>
              <textarea
                rows={3}
                maxLength={400}
                value={userForm.address}
                onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Enter address"
              />
              <p className="mt-1 text-xs text-gray-500">{userForm.address.length}/400 characters</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              Create User
            </button>
          </form>
        </div>
      )}

      {/* Add Store Tab */}
      {activeTab === 'add-store' && (
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-gray-200/50">
          <h3 className="text-2xl font-semibold mb-6">Add New Store</h3>
          <form onSubmit={handleCreateStore} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter store email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address (max 400 characters)
              </label>
              <textarea
                rows={3}
                required
                maxLength={400}
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Enter store address"
              />
              <p className="mt-1 text-xs text-gray-500">{storeForm.address.length}/400 characters</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              Create Store
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;