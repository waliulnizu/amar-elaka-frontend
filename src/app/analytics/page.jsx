"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. get profile to get user location
      const profileRes = await axios.get("http://localhost:5000/api/users/profile", { withCredentials: true });
      let districtId = "";
      let upazilaId = "";
      
      if (profileRes.data.success && profileRes.data.user) {
        setCurrentUser(profileRes.data.user);
        districtId = profileRes.data.user.location?.districtId?._id || profileRes.data.user.location?.districtId || "";
        upazilaId = profileRes.data.user.location?.upazilaId?._id || profileRes.data.user.location?.upazilaId || "";
      }

      // 2. get analytics data
      const analyticsRes = await axios.get("http://localhost:5000/api/analytics/dashboard", {
        params: { districtId, upazilaId },
        withCredentials: true
      });

      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-bold">লোড হচ্ছে...</div>;

  const chartData = stats?.districtLeaderboard?.map((d, index) => ({
    name: d.district?.name || "অজানা",
    Donations: d.totalDonations,
  })) || [];

  return (
    <div className="min-h-screen bg-base-200 pb-10">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">রক্তদান ড্যাশবোর্ড</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="stat bg-white rounded-xl shadow">
            <div className="stat-title text-gray-500">মোট রক্তদাতা (যাঁরা রক্ত দিয়েছেন)</div>
            <div className="stat-value text-primary">{stats?.totalDonorsCount || 0} জন</div>
          </div>
          
          <div className="stat bg-white rounded-xl shadow">
            <div className="stat-title text-gray-500">মোট রক্তের আবেদন (পোস্ট)</div>
            <div className="stat-value text-secondary">{stats?.totalPosts || 0} টি</div>
          </div>

          <div className="stat bg-white rounded-xl shadow">
            <div className="stat-title text-gray-500">আপনার থানার প্রাইজ ফান্ড</div>
            <div className="stat-value text-success">{stats?.ownThanaFunds || 0} ৳</div>
            <div className="stat-desc">পরবর্তী মাসের লাকি ডোনারের জন্য</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-2xl font-bold mb-4 text-center">জেলা ভিত্তিক র‍্যাংকিং (সর্বোচ্চ রক্তদান)</h2>
          
          {currentUser?.location?.districtId ? (
            <div className="alert alert-info shadow-lg mb-6">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>আপনার জেলার র‍্যাংক: <strong className="text-xl mx-1">{stats?.ownDistrictRank || 'N/A'}</strong> (মোট রক্তদান: {stats?.ownDistrictDonations || 0} বার)</span>
              </div>
            </div>
          ) : null}

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Donations" fill="#ef4444" name="রক্তদানের সংখ্যা" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
