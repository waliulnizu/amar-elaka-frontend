"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function LocationSelector({ onLocationSelect, defaultValues }) {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [localBodies, setLocalBodies] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedDivision, setSelectedDivision] = useState(defaultValues?.divisionId || "");
  const [selectedDistrict, setSelectedDistrict] = useState(defaultValues?.districtId || "");
  const [selectedUpazila, setSelectedUpazila] = useState(defaultValues?.upazilaId || "");
  const [selectedLocalBody, setSelectedLocalBody] = useState(defaultValues?.localBodyId || "");
  const [selectedWard, setSelectedWard] = useState(defaultValues?.wardId || "");

  const [loading, setLoading] = useState({ div: false, dist: false, upa: false, loc: false, ward: false });
  const [showManualWard, setShowManualWard] = useState(false);

  useEffect(() => {
    const fetchDivisions = async () => {
      setLoading(prev => ({ ...prev, div: true }));
      try {
        const res = await axios.get("http://localhost:5000/api/locations/divisions");
        setDivisions(res.data.data || res.data);
      } catch (error) {
        console.error("বিভাগ লোড করতে সমস্যা:", error);
      } finally {
        setLoading(prev => ({ ...prev, div: false }));
      }
    };
    fetchDivisions();
  }, []);

  const handleDivisionChange = async (e) => {
    const divId = e.target.value;
    setSelectedDivision(divId);
    setSelectedDistrict("");
    setSelectedUpazila("");
    setSelectedLocalBody("");
    setSelectedWard("");
    setDistricts([]);
    setUpazilas([]);
    setLocalBodies([]);
    setWards([]);
    setShowManualWard(false);
    onLocationSelect({ divisionId: divId, districtId: "", upazilaId: "", localBodyId: "", wardId: "" });

    if (!divId) return;

    setLoading(prev => ({ ...prev, dist: true }));
    try {
      const res = await axios.get(`http://localhost:5000/api/locations/districts/${divId}`);
      setDistricts(res.data.data || res.data);
    } catch (error) {
      console.error("জেলা লোড করতে সমস্যা:", error);
    } finally {
      setLoading(prev => ({ ...prev, dist: false }));
    }
  };

  const handleDistrictChange = async (e) => {
    const distId = e.target.value;
    setSelectedDistrict(distId);
    setSelectedUpazila("");
    setSelectedLocalBody("");
    setSelectedWard("");
    setUpazilas([]);
    setLocalBodies([]);
    setWards([]);
    setShowManualWard(false);
    onLocationSelect({ divisionId: selectedDivision, districtId: distId, upazilaId: "", localBodyId: "", wardId: "" });

    if (!distId) return;

    setLoading(prev => ({ ...prev, upa: true }));
    try {
      const res = await axios.get(`http://localhost:5000/api/locations/upazilas/${distId}`);
      setUpazilas(res.data.data || res.data);
    } catch (error) {
      console.error("উপজেলা লোড করতে সমস্যা:", error);
    } finally {
      setLoading(prev => ({ ...prev, upa: false }));
    }
  };

  const handleUpazilaChange = async (e) => {
    const upaId = e.target.value;
    setSelectedUpazila(upaId);
    setSelectedLocalBody("");
    setSelectedWard("");
    setLocalBodies([]);
    setWards([]);
    setShowManualWard(false);
    onLocationSelect({ divisionId: selectedDivision, districtId: selectedDistrict, upazilaId: upaId, localBodyId: "", wardId: "" });

    if (!upaId) return;

    setLoading(prev => ({ ...prev, loc: true }));
    try {
      const res = await axios.get(`http://localhost:5000/api/locations/local-bodies/${upaId}`);
      setLocalBodies(res.data.data || res.data);
    } catch (error) {
      console.error("ইউনিয়ন/পৌরসভা লোড করতে সমস্যা:", error);
    } finally {
      setLoading(prev => ({ ...prev, loc: false }));
    }
  };

  const handleLocalBodyChange = async (e) => {
    const locId = e.target.value;
    setSelectedLocalBody(locId);
    setSelectedWard("");
    setWards([]);
    setShowManualWard(false);
    onLocationSelect({ divisionId: selectedDivision, districtId: selectedDistrict, upazilaId: selectedUpazila, localBodyId: locId, wardId: "" });

    if (!locId) return;

    setLoading(prev => ({ ...prev, ward: true }));
    try {
      const res = await axios.get(`http://localhost:5000/api/locations/wards/${locId}`);
      const fetchedWards = res.data.data || res.data;
      setWards(fetchedWards);
      if (fetchedWards.length === 0) {
        setShowManualWard(true);
      }
    } catch (error) {
      console.error("ওয়ার্ড/গ্রাম লোড করতে সমস্যা:", error);
    } finally {
      setLoading(prev => ({ ...prev, ward: false }));
    }
  };

  const handleWardChange = (e) => {
    const val = e.target.value;
    if (val === "manual") {
      setShowManualWard(true);
      setSelectedWard("");
      onLocationSelect({ divisionId: selectedDivision, districtId: selectedDistrict, upazilaId: selectedUpazila, localBodyId: selectedLocalBody, wardId: "" });
      return;
    }
    setSelectedWard(val);
    onLocationSelect({ divisionId: selectedDivision, districtId: selectedDistrict, upazilaId: selectedUpazila, localBodyId: selectedLocalBody, wardId: val });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="form-control w-full">
        <label className="label"><span className="label-text font-bold">বিভাগ</span></label>
        <select className="select select-bordered w-full" value={selectedDivision} onChange={handleDivisionChange} disabled={loading.div}>
          <option value="">{loading.div ? "লোড হচ্ছে..." : "বিভাগ বাছাই করুন"}</option>
          {Array.isArray(divisions) && divisions.map(div => <option key={div._id} value={div._id}>{div.name}</option>)}
        </select>
      </div>

      <div className="form-control w-full">
        <label className="label"><span className="label-text font-bold">জেলা</span></label>
        <select className="select select-bordered w-full" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedDivision || loading.dist}>
          <option value="">{loading.dist ? "লোড হচ্ছে..." : "জেলা বাছাই করুন"}</option>
          {Array.isArray(districts) && districts.map(dist => <option key={dist._id} value={dist._id}>{dist.name}</option>)}
        </select>
      </div>

      <div className="form-control w-full">
        <label className="label"><span className="label-text font-bold">উপজেলা / থানা</span></label>
        <select className="select select-bordered w-full" value={selectedUpazila} onChange={handleUpazilaChange} disabled={!selectedDistrict || loading.upa}>
          <option value="">{loading.upa ? "লোড হচ্ছে..." : "উপজেলা বাছাই করুন"}</option>
          {Array.isArray(upazilas) && upazilas.map(upa => <option key={upa._id} value={upa._id}>{upa.name}</option>)}
        </select>
      </div>

      <div className="form-control w-full">
        <label className="label"><span className="label-text font-bold">পৌরসভা / ইউনিয়ন</span></label>
        <select className="select select-bordered w-full" value={selectedLocalBody} onChange={handleLocalBodyChange} disabled={!selectedUpazila || loading.loc}>
          <option value="">{loading.loc ? "লোড হচ্ছে..." : "পৌরসভা বা ইউনিয়ন বাছাই করুন"}</option>
          {Array.isArray(localBodies) && localBodies.map(loc => <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>)}
        </select>
      </div>

      <div className="form-control w-full">
        <label className="label"><span className="label-text font-bold">ওয়ার্ড / গ্রাম / মহল্লা</span></label>
        {showManualWard ? (
          <input 
            type="text" 
            className="input input-bordered w-full" 
            placeholder="আপনার গ্রাম বা ওয়ার্ডের নাম লিখুন" 
            value={selectedWard} 
            onChange={handleWardChange} 
          />
        ) : (
          <select className="select select-bordered w-full" value={selectedWard} onChange={handleWardChange} disabled={!selectedLocalBody || loading.ward}>
            <option value="">{loading.ward ? "লোড হচ্ছে..." : "গ্রাম বা ওয়ার্ড বাছাই করুন"}</option>
            {Array.isArray(wards) && wards.map(ward => <option key={ward._id} value={ward._id}>{ward.wardNo || ward.name}</option>)}
            {wards.length > 0 && <option value="manual" className="font-bold text-primary">অন্যান্য (নিজে লিখুন)</option>}
          </select>
        )}
      </div>
    </div>
  );
}