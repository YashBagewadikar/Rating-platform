import React, { useState, useEffect } from 'react';
import { Star, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';

interface StoreRating {
  rating: number;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface StoreStats {
  ratings: StoreRating[];
  average_rating: number;
  total_ratings: number;
}

const StoreOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.store_id) {
      fetchStoreStats();
    }
  }, [user]);

  const fetchStoreStats = async () => {
    try {
      if (!user?.store_id) {
        toast.error('No store associated with your account');
        return;
      }

      const response = await axios.get(`/stores/${user.store_id}/ratings`);
      setStoreStats(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch store statistics';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user?.store_id) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-gray-200/50">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Store Associated</h2>
          <p className="text-gray-600">
            Your account is not linked to any store. Please contact the administrator to associate your account with a store.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Store Dashboard
        </h1>
        <p className="mt-2 text-gray-600">Monitor your store's ratings and customer feedback</p>
      </div>

      {storeStats && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Average Rating</p>
                  <p className="text-3xl font-bold">{storeStats.average_rating.toFixed(1)}</p>
                </div>
                <Star className="h-12 w-12 text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Reviews</p>
                  <p className="text-3xl font-bold">{storeStats.total_ratings}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Store Performance</p>
                  <p className="text-3xl font-bold">
                    {storeStats.average_rating >= 4 ? 'Excellent' : 
                     storeStats.average_rating >= 3 ? 'Good' : 
                     storeStats.average_rating >= 2 ? 'Fair' : 'Needs Improvement'}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-emerald-200" />
              </div>
            </div>
          </div>

          {/* Average Rating Display */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-gray-200/50 text-center">
            <h3 className="text-2xl font-semibold mb-4">Your Store's Overall Rating</h3>
            <div className="flex justify-center mb-4">
              <StarRating rating={storeStats.average_rating} size="lg" />
            </div>
            <p className="text-gray-600">
              Based on {storeStats.total_ratings} customer review{storeStats.total_ratings !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-semibold">Customer Reviews</h3>
              <p className="text-gray-600 mt-1">See what your customers are saying</p>
            </div>

            <div className="p-6">
              {storeStats.ratings.length > 0 ? (
                <div className="space-y-4">
                  {storeStats.ratings.map((rating, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {rating.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{rating.user_name}</p>
                            <p className="text-sm text-gray-600">{rating.user_email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StarRating rating={rating.rating} size="sm" />
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reviews yet. Encourage your customers to rate your store!</p>
                </div>
              )}
            </div>
          </div>

          {/* Rating Distribution */}
          {storeStats.ratings.length > 0 && (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-200/50">
              <h3 className="text-xl font-semibold mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = storeStats.ratings.filter(r => r.rating === star).length;
                  const percentage = storeStats.total_ratings > 0 ? (count / storeStats.total_ratings) * 100 : 0;
                  
                  return (
                    <div key={star} className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-8">{star}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;