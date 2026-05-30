// frontend/src/components/AdminStructureSelector.jsx
import { useState } from "react";

export default function AdminStructureSelector({ onLocationSelect }) {
  const [data, setData] = useState({
    type: "",      // ইউনিয়ন / পৌরসভা / সিটি
    div: "",       // বিভাগ
    dist: "",      // জেলা
    upa: "",       // উপজেলা (সিটি হলে দরকার নেই)
    body: "",      // ইউনিয়ন পরিষদ / পৌরসভা নাম
    ward: "",      // ওয়ার্ড
    area: ""       // গ্রাম / মহল্লা
  });

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onLocationSelect(newData);
  };

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-white shadow-sm">
      <h2 className="font-bold text-lg mb-2">প্রশাসনিক অবস্থান নির্বাচন করুন</h2>
      
      {/* ১. প্রশাসনিক ধরণ */}
      <select className="select select-bordered w-full" onChange={(e) => handleChange('type', e.target.value)}>
        <option value="">ধরণ বাছাই করুন</option>
        <option value="ইউনিয়ন">ইউনিয়ন</option>
        <option value="পৌরসভা">পৌরসভা</option>
        <option value="সিটি">সিটি কর্পোরেশন</option>
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="input input-bordered" placeholder="বিভাগ" onChange={(e) => handleChange('div', e.target.value)} />
        <input className="input input-bordered" placeholder="জেলা" onChange={(e) => handleChange('dist', e.target.value)} />
        
        {/* উপজেলা শুধুমাত্র ইউনিয়ন ও পৌরসভার জন্য */}
        {data.type !== 'সিটি' && (
          <input className="input input-bordered" placeholder="উপজেলা" onChange={(e) => handleChange('upa', e.target.value)} />
        )}

        <input 
          className="input input-bordered" 
          placeholder={data.type === 'ইউনিয়ন' ? 'ইউনিয়ন পরিষদের নাম' : 'পৌরসভা/সিটি নাম'} 
          onChange={(e) => handleChange('body', e.target.value)} 
        />
        <input className="input input-bordered" placeholder="ওয়ার্ড নম্বর" onChange={(e) => handleChange('ward', e.target.value)} />
        <input 
          className="input input-bordered" 
          placeholder={data.type === 'ইউনিয়ন' ? 'গ্রামের নাম' : 'মহল্লার নাম'} 
          onChange={(e) => handleChange('area', e.target.value)} 
        />
      </div>
    </div>
  );
}