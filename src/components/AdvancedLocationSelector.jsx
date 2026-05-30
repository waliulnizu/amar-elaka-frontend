// frontend/src/components/AdvancedLocationSelector.jsx
import { useState } from "react";

export default function AdvancedLocationSelector({ onLocationSelect }) {
  const [data, setData] = useState({ type: "", div: "", dist: "", upa: "", body: "", ward: "", area: "" });

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    
    if (field === 'type') {
      // type পরিবর্তন হলে আগের সব ভ্যালু রিসেট হবে
      setData({ type: value, div: "", dist: "", upa: "", body: "", ward: "", area: "" });
    } else {
      setData(newData);
    }
    onLocationSelect(newData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ১. এরিয়া টাইপ */}
      <select className="select select-bordered" onChange={(e) => handleChange('type', e.target.value)} value={data.type}>
        <option value="">এলাকার ধরণ নির্বাচন করুন</option>
        <option value="ইউনিয়ন">ইউনিয়ন এলাকা</option>
        <option value="পৌরসভা">পৌরসভা এলাকা</option>
        <option value="সিটি">সিটি কর্পোরেশন</option>
      </select>

      {/* ২. বিভাগ ও জেলা */}
      <input className="input input-bordered" placeholder="বিভাগ" value={data.div} onChange={(e) => handleChange('div', e.target.value)} />
      <input className="input input-bordered" placeholder="জেলা" value={data.dist} onChange={(e) => handleChange('dist', e.target.value)} />

      {/* ৩. কন্ডিশনাল উপজেলা (সিটি হলে আসবে না) */}
      {data.type !== 'সিটি' && (
        <input className="input input-bordered" placeholder="উপজেলা" value={data.upa} onChange={(e) => handleChange('upa', e.target.value)} />
      )}

      {/* ৪. স্থানীয় বডি */}
      <input 
        className="input input-bordered" 
        placeholder={data.type === 'ইউনিয়ন' ? 'ইউনিয়ন পরিষদ' : 'পৌরসভা/সিটি কর্পোরেশন'} 
        value={data.body} 
        onChange={(e) => handleChange('body', e.target.value)} 
      />

      {/* ৫. ওয়ার্ড ও গ্রাম/মহল্লা */}
      <input className="input input-bordered" placeholder="ওয়ার্ড" value={data.ward} onChange={(e) => handleChange('ward', e.target.value)} />
      <input 
        className="input input-bordered" 
        placeholder={data.type === 'ইউনিয়ন' ? 'গ্রাম' : 'মহল্লা'} 
        value={data.area} 
        onChange={(e) => handleChange('area', e.target.value)} 
      />
    </div>
  );
}