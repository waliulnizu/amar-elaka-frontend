"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Modals state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [distanceKm, setDistanceKm] = useState("");

  useEffect(() => {
    fetchProfileAndRequests();
  }, []);

  const fetchProfileAndRequests = async () => {
    try {
      const [profileRes, reqsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users/profile", { withCredentials: true }),
        axios.get("http://localhost:5000/api/requests", { withCredentials: true })
      ]);
      
      if (profileRes.data.success) {
        setCurrentUser(profileRes.data.user);
      }
      if (reqsRes.data.success) {
        setRequests(reqsRes.data.requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = (request) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const handlePayClick = (request) => {
    setSelectedRequest(request);
    setShowPayModal(true);
  };

  const submitAccept = async () => {
    if (!distanceKm || distanceKm <= 0) return alert("সঠিক দূরত্ব লিখুন।");
    
    try {
      const res = await axios.post("http://localhost:5000/api/requests/accept", {
        requestId: selectedRequest._id,
        distanceKm: Number(distanceKm)
      }, { withCredentials: true });

      if (res.data.success) {
        alert("রিকোয়েস্ট অ্যাকসেপ্ট করা হয়েছে।");
        setShowAcceptModal(false);
        setDistanceKm("");
        fetchProfileAndRequests();
      }
    } catch (error) {
      alert("সমস্যা হয়েছে: " + (error.response?.data?.message || ""));
    }
  };

  const submitPayment = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/requests/pay", {
        requestId: selectedRequest._id
      }, { withCredentials: true });

      if (res.data.success) {
        alert("পেমেন্ট সফল হয়েছে!");
        setShowPayModal(false);
        fetchProfileAndRequests();
      }
    } catch (error) {
      alert("পেমেন্ট ব্যর্থ: " + (error.response?.data?.message || ""));
    }
  };

  if (loading) return <div className="text-center mt-20">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen bg-base-200 pb-10">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-2">রক্তের আবেদনসমূহ</h1>
        <p className="mb-6 text-gray-600">আপনার বর্তমান ব্যালেন্স: <span className="font-bold text-primary">{currentUser?.walletBalance || 0} ৳</span></p>

        {requests.length === 0 ? (
          <p className="text-center p-8 bg-white rounded-xl shadow">কোনো রিকোয়েস্ট নেই।</p>
        ) : (
          <div className="grid gap-4">
            {requests.map(req => {
              const isDonor = currentUser?._id === req.donor?._id;
              const isRequester = currentUser?._id === req.requester?._id;
              
              return (
                <div key={req._id} className="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    {isDonor && (
                      <p><span className="font-bold">{req.requester?.name}</span> আপনাকে রক্তের জন্য নক করেছেন।</p>
                    )}
                    {isRequester && (
                      <p>আপনি <span className="font-bold">{req.donor?.name}</span> কে রক্তের জন্য নক করেছেন।</p>
                    )}
                    
                    <p className="text-sm text-gray-500 mt-1">স্ট্যাটাস: 
                      <span className={`ml-2 font-bold ${
                        req.status === 'PENDING' ? 'text-orange-500' :
                        req.status === 'ACCEPTED' ? 'text-blue-500' :
                        req.status === 'PAID' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {req.status === 'PENDING' ? 'অপেক্ষমাণ' : 
                         req.status === 'ACCEPTED' ? 'গৃহীত (পেমেন্ট বাকি)' : 
                         req.status === 'PAID' ? 'পেমেন্ট সম্পন্ন' : req.status}
                      </span>
                    </p>

                    {req.status !== 'PENDING' && (
                      <p className="text-sm mt-1">দূরত্ব: {req.distanceKm} কি.মি. | ফি: <span className="font-bold">{req.agreedAmount} ৳</span></p>
                    )}
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    {isDonor && req.status === 'PENDING' && (
                      <button onClick={() => handleAcceptClick(req)} className="btn btn-success text-white w-full md:w-auto">
                        অ্যাকসেপ্ট করুন
                      </button>
                    )}
                    {isRequester && req.status === 'ACCEPTED' && (
                      <button onClick={() => handlePayClick(req)} className="btn btn-primary w-full md:w-auto">
                        পেমেন্ট করুন ({req.agreedAmount} ৳)
                      </button>
                    )}
                    {/* Both can see phone number if accepted or paid */}
                    {req.status !== 'PENDING' && (
                      <a href={`tel:${isDonor ? req.requester?.phone : req.donor?.phone}`} className="btn btn-outline btn-primary w-full md:w-auto">
                        কল করুন
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accept Modal (For Donor) */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="font-bold text-lg mb-4">রিকোয়েস্ট গ্রহণ করুন</h3>
            <p className="text-sm text-gray-600 mb-4">হাসপাতাল থেকে আপনার বর্তমান দূরত্বের পরিমাণ (কিলোমিটার) লিখুন। প্রতি কিলোমিটারে ১০ টাকা চার্জ হবে।</p>
            
            <div className="form-control w-full mb-6">
              <label className="label"><span className="label-text">দূরত্ব (কিলোমিটার)</span></label>
              <input 
                type="number" 
                className="input input-bordered w-full" 
                value={distanceKm} 
                onChange={(e) => setDistanceKm(e.target.value)} 
                placeholder="যেমন: 5"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAcceptModal(false)} className="btn btn-ghost">বাতিল</button>
              <button onClick={submitAccept} className="btn btn-success text-white">নিশ্চিত করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (For Requester) */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="font-bold text-lg mb-4">পেমেন্ট নিশ্চিত করুন</h3>
            <p className="mb-2">ডোনার দূরত্ব জানিয়েছেন: <span className="font-bold">{selectedRequest?.distanceKm} কি.মি.</span></p>
            <p className="mb-6">আপনাকে মোট <span className="font-bold text-primary">{selectedRequest?.agreedAmount} ৳</span> পেমেন্ট করতে হবে। এই টাকা আপনার ওয়ালেট থেকে কাটা হবে।</p>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPayModal(false)} className="btn btn-ghost">বাতিল</button>
              <button onClick={submitPayment} className="btn btn-primary">পেমেন্ট করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
