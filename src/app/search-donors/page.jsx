"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import DonorCard from "@/components/DonorCard";
import LocationSelector from "@/components/LocationSelector"; 

export default function SearchDonors() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState({ divisionId: "", districtId: "", upazilaId: "", localBodyId: "", wardId: "" });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch logged in user to get their location for free knock logic
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", { withCredentials: true });
        if (res.data.success) {
          setCurrentUser(res.data.user);
        }
      } catch (error) {
        console.error("User not logged in or error fetching profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search-donors`, {
        params: { 
          bloodGroup, 
          divisionId: location.divisionId,
          districtId: location.districtId,
          upazilaId: location.upazilaId 
        },
        withCredentials: true
      });
      setDonors(res.data.donors || res.data); // Adjust based on backend response
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || "সার্চ করতে সমস্যা হয়েছে।");
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

          {/* 📍 লোকেশন সিলেক্টর */}
          <div className="border p-4 rounded-lg bg-base-50">
            <LocationSelector onLocationSelect={setLocation} />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "খোঁজা হচ্ছে..." : "সার্চ করুন"}
          </button>
        </form>

        {/* রেজাল্ট গ্রিড */}
        <div className="grid md:grid-cols-2 gap-4">
          {donors.length > 0 ? (
            donors.map((donor) => (
              <DonorCard 
                key={donor._id} 
                donor={donor} 
                currentUserUpazilaId={currentUser?.location?.upazilaId?._id || currentUser?.location?.upazilaId} 
              />
            ))
          ) : (
            <p className="col-span-2 text-center text-gray-500">কোনো রক্তদাতা পাওয়া যায়নি।</p>
          )}
        </div>
      </div>
    </div>
  );
}