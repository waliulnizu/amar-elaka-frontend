"use client";
import { useState } from "react";
import axios from "axios";

const DonorCard = ({ donor, currentUserUpazilaId }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isEligible = (lastDate) => {
    if (!lastDate) return true;
    const last = new Date(lastDate);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return last < oneMonthAgo;
  };

  const getStatus = (lastDate) => {
    if (!lastDate) return "সদ্য রক্তদানের তথ্য নেই";
    const last = new Date(lastDate);
    const today = new Date();
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${30 - diffDays} দিন পর রক্ত দিতে পারবেন`;
    return "এখন রক্তদানের জন্য যোগ্য";
  };

  // Check if same Thana
  const donorUpazilaId = donor.location?.upazilaId?._id || donor.location?.upazilaId;
  const isSameThana = currentUserUpazilaId && donorUpazilaId && currentUserUpazilaId.toString() === donorUpazilaId.toString();

  const handleKnock = async () => {
    if (!isSameThana) {
      setShowModal(true); // Show confirmation modal for paid knock
    } else {
      executeKnock(); // Free knock
    }
  };

  const executeKnock = async () => {
    setLoading(true);
    setShowModal(false);
    try {
      const res = await axios.post("http://localhost:5000/api/requests/knock", { donorId: donor._id }, { withCredentials: true });
      if (res.data.success) {
        alert("ডোনারকে সফলভাবে নক করা হয়েছে! মেনু থেকে 'রক্তের আবেদনসমূহ' পেজে গিয়ে আপডেট চেক করুন।");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("ডোনারকে নক করতে হলে আপনাকে আগে লগইন করতে হবে।");
      } else {
        alert(error.response?.data?.message || "নক করতে সমস্যা হয়েছে।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 border rounded-xl flex flex-col justify-between ${isEligible(donor.lastDonationDate) ? 'bg-green-50' : 'bg-orange-50'}`}>
      <div>
        <h3 className="font-bold text-lg">{donor.name}</h3>
        <p>রক্তের গ্রুপ: <span className="font-bold text-red-600">{donor.bloodGroup}</span></p>
        <p className="text-sm font-semibold text-gray-700">
          স্ট্যাটাস: {getStatus(donor.lastDonationDate)}
        </p>
        {donor.location?.upazilaId?.name && (
          <p className="text-sm text-gray-600 mt-1">
            📍 {donor.location.upazilaId.name}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <a href={`tel:${donor.phone}`} className="btn btn-outline btn-primary btn-sm flex-1">
          কল করুন
        </a>
        <button onClick={handleKnock} disabled={loading} className="btn btn-primary btn-sm flex-1">
          {loading ? "অপেক্ষা করুন..." : (isSameThana ? "ফ্রি নক" : "নক (১০ ৳)")}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-4">পেমেন্ট নিশ্চিত করুন</h3>
            <p className="mb-6">অন্য থানার ডোনারকে নক করতে আপনার ওয়ালেট থেকে ১০ টাকা কাটা হবে। আপনি কি নিশ্চিত?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">না, বাতিল করুন</button>
              <button onClick={executeKnock} className="btn btn-primary btn-sm">হ্যাঁ, নক করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorCard;