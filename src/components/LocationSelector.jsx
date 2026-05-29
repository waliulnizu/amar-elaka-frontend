// frontend/src/components/LocationSelector.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function LocationSelector({ onLocationSelect, defaultValues }) {
  // ১. স্টেট ডিক্লারেশন (ডেটা ধরে রাখার জন্য)
  const [thanas, setThanas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [wards, setWards] = useState([]);

  // ২. ইউজার কী সিলেক্ট করছে তার স্টেট
  const [selectedThana, setSelectedThana] = useState(defaultValues?.thana || "");
  const [selectedArea, setSelectedArea] = useState(defaultValues?.areaName || "");
  const [selectedWard, setSelectedWard] = useState(defaultValues?.wardOrGram || "");

  // ৩. লোডিং স্টেট (UX ভালো করার জন্য)
  const [loadingThanas, setLoadingThanas] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // ৪. প্রথমবার পেজ লোড হলে শুধু থানার তালিকা আনব
  useEffect(() => {
    const fetchThanas = async () => {
      setLoadingThanas(true);
      try {
        // ব্যাকএন্ড এপিআই কল (আপনার ব্যাকএন্ড পোর্ট ৫০০০)
        const res = await axios.get("http://localhost:5000/api/locations/thanas");
        setThanas(res.data);
      } catch (error) {
        console.error("থানা লোড করতে সমস্যা:", error);
      } finally {
        setLoadingThanas(false);
      }
    };
    fetchThanas();
  }, []);

  // ৫. থানা পরিবর্তনের সাথে সাথে এরিয়া (ইউনিয়ন/পৌরসভা) লোড করা
  const handleThanaChange = async (e) => {
    const thana = e.target.value;
    setSelectedThana(thana);
    
    // 🧠 Developer Logic: থানা পালটালে আগের ইউনিয়ন ও গ্রাম মুছে ফেলতে হবে
    setSelectedArea("");
    setSelectedWard("");
    setAreas([]);
    setWards([]);
    onLocationSelect({ thana, areaName: "", wardOrGram: "" }); // Parent কে আপডেট জানানো

    if (!thana) return;

    setLoadingAreas(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/locations/areas/${thana}`);
      setAreas(res.data); // ডেটাবেস থেকে পাওয়া এরিয়া সেট করা
    } catch (error) {
      console.error("এরিয়া লোড করতে সমস্যা:", error);
    } finally {
      setLoadingAreas(false);
    }
  };

  // ৬. এরিয়া পরিবর্তনের সাথে সাথে ওয়ার্ড বা গ্রাম লোড করা
  const handleAreaChange = async (e) => {
    const area = e.target.value;
    setSelectedArea(area);
    
    // 🧠 Developer Logic: এরিয়া পালটালে আগের গ্রাম মুছে ফেলতে হবে
    setSelectedWard("");
    setWards([]);
    onLocationSelect({ thana: selectedThana, areaName: area, wardOrGram: "" });

    if (!area) return;

    setLoadingWards(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/locations/wards/${area}`);
      setWards(res.data);
    } catch (error) {
      console.error("ওয়ার্ড লোড করতে সমস্যা:", error);
    } finally {
      setLoadingWards(false);
    }
  };

  // ৭. ওয়ার্ড পরিবর্তনের হ্যান্ডলার
  const handleWardChange = (e) => {
    const ward = e.target.value;
    setSelectedWard(ward);
    // চূড়ান্ত ডেটা Parent কম্পোনেন্টকে (যেমন প্রোফাইল পেজ) পাঠিয়ে দেওয়া
    onLocationSelect({ thana: selectedThana, areaName: selectedArea, wardOrGram: ward });
  };

  // UI রেন্ডারিং (DaisyUI ব্যবহার করে)
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* থানা সিলেক্ট */}
      <div className="form-control w-full">
        <label className="label"><span className="label-text font-bold">থানা নির্বাচন করুন</span></label>
        <select 
          className="select select-bordered w-full" 
          value={selectedThana} 
          onChange={handleThanaChange}
          disabled={loadingThanas}
        >
          <option value="">{loadingThanas ? "লোড হচ্ছে..." : "থানা বাছাই করুন"}</option>
          {thanas.map((thana, i) => (
            <option key={i} value={thana}>{thana}</option>
          ))}
        </select>
      </div>

      {/* এরিয়া (ইউনিয়ন/পৌরসভা) সিলেক্ট - থানা সিলেক্ট না করলে এটি disabled থাকবে */}
      <div className="form-control w-full">
        <label className="label"><span className="label-text font-bold">পৌরসভা / ইউনিয়ন</span></label>
        <select 
          className="select select-bordered w-full" 
          value={selectedArea} 
          onChange={handleAreaChange}
          disabled={!selectedThana || loadingAreas}
        >
          <option value="">{loadingAreas ? "লোড হচ্ছে..." : "পৌরসভা বা ইউনিয়ন বাছাই করুন"}</option>
          {areas.map((area, i) => (
            <option key={i} value={area.areaName}>
              {area.areaName} ({area.type}) {/* ব্র্যাকেটে দেখাবে এটি পৌরসভা নাকি ইউনিয়ন */}
            </option>
          ))}
        </select>
      </div>

      {/* ওয়ার্ড / গ্রাম সিলেক্ট - এরিয়া সিলেক্ট না করলে এটি disabled থাকবে */}
      <div className="form-control w-full">
        <label className="label"><span className="label-text font-bold">ওয়ার্ড / গ্রাম / মহল্লা</span></label>
        <select 
          className="select select-bordered w-full" 
          value={selectedWard} 
          onChange={handleWardChange}
          disabled={!selectedArea || loadingWards}
        >
          <option value="">{loadingWards ? "লোড হচ্ছে..." : "গ্রাম বা ওয়ার্ড বাছাই করুন"}</option>
          {wards.map((ward, i) => (
            <option key={i} value={ward.wardOrGram}>{ward.wardOrGram}</option>
          ))}
        </select>
      </div>
    </div>
  );
}