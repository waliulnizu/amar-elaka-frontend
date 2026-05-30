"use client";

import { useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import DonorCard from "@/components/DonorCard";
import LocationSelector from "@/components/LocationSelector"; // 👈 ড্রপডাউন কম্পোনেন্ট

export default function SearchDonors() {
  const [bloodGroup, setBloodGroup] = useState("");
  // লোকেশন ডেটা এখন অবজেক্ট হিসেবে থাকবে
  const [location, setLocation] = useState({ thana: "", areaName: "", wardOrGram: "" });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ব্যাকএন্ডে আমরা now থানা ও এলাকা পাঠাচ্ছি
      const res = await axios.get(`http://localhost:5000/api/users/search-donors`, {
        params: { 
          bloodGroup, 
          thana: location.thana,
          areaName: location.areaName 
        },
        withCredentials: true
      });
      setDonors(res.data);
    } catch (error) {
      alert("সার্চ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">রক্তদাতা খুঁজুন</h1>

        <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 mb-8">
          {/* রক্তের গ্রুপ */}
          <select className="select select-bordered w-full" onChange={(e) => setBloodGroup(e.target.value)} required>
            <option value="">রক্তের গ্রুপ বাছাই করুন</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          {/* 📍 লোকেশন সিলেক্টর (এখানেই ড্রপডাউন কাজ করবে) */}
          <div className="border p-4 rounded-lg bg-base-50">
            <LocationSelector onLocationSelect={setLocation} />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "খোঁজা হচ্ছে..." : "সার্চ করুন"}
          </button>
        </form>

        {/* রেজাল্ট গ্রিড */}
        <div className="grid md:grid-cols-2 gap-4">
          {donors.map((donor) => (
            <DonorCard key={donor._id} donor={donor} />
          ))}
        </div>
      </div>
    </div>
  );
}