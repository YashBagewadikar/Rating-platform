import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  rating: number;
  total_ratings: number;
  user_rating?: number;
}

const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  useEffect(() => {
    fetchStores();
  }, [searchTerm, sortBy, sortOrder]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (storeId: number, rating: number) => {
    try {
      await axios.post('/ratings', {
        store_id: storeId,
        rating
      });
      
      toast.success('Rating submitted successfully!');
      fetchStores(); // Refresh the list
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || 'Failed to submit rating';
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Discover & Rate Stores
        </h1>
        <p className="mt-2 text-gray-600">Explore stores and share your experiences</p>
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-200/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => toggleSort('name')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'name' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('rating')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'rating' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rating {sortBy === 'rating' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-shadow"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{store.name}</h3>
                <p className="text-sm text-gray-600">{store.email}</p>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 line-clamp-2">{store.address}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Overall Rating</p>
                  <div className="flex items-center justify-between">
                    <StarRating rating={store.rating} size="md" />
                    <span className="text-sm text-gray-500">
                      {store.total_ratings} review{store.total_ratings !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
                  {store.user_rating ? (
                    <div className="space-y-2">
                      <StarRating 
                        rating={store.user_rating} 
                        size="md" 
                        interactive={true}
                        onRatingChange={(rating) => handleRating(store.id, rating)}
                      />
                      <p className="text-xs text-gray-500">Click to update your rating</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <StarRating 
                        rating={0} 
                        size="md" 
                        interactive={true}
                        onRatingChange={(rating) => handleRating(store.id, rating)}
                      />
                      <p className="text-xs text-gray-500">Click to rate this store</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No stores found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;