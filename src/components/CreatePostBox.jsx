// frontend/src/components/CreatePostBox.jsx
"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function CreatePostBox({ user, onPostCreated }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("সাধারণ");
  const [reach, setReach] = useState("থানা"); 
  
  // ➕ নতুন: ট্যাগ এবং সমাধানের ডেডলাইনের জন্য স্টেট
  const [taggedAuthorities, setTaggedAuthorities] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("দুঃখিত, ছবির সাইজ ২ মেগাবাইটের কম হতে হবে!");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReachChange = (e) => {
    const selectedLevel = e.target.value;
    if (selectedLevel === "অন্যান্য জেলা") {
      alert("👑 অন্যান্য জেলায় পোস্ট রিচ করতে প্রিমিয়াম সাবস্ক্রিপশন প্রয়োজন! খুব শিগগিরই ফিচারটি আসছে।");
      setReach("জেলা");
    } else {
      setReach(selectedLevel);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !selectedFile) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("category", category);
    formData.append("reach", reach); 
    
    // 🚀 ম্যাজিক: ক্যাটাগরি 'সমস্যা' হলেই ট্যাগগুলো ব্যাকএন্ডে যাবে
    if (category === 'সমস্যা') {
        formData.append("taggedAuthorities", taggedAuthorities);
        formData.append("targetDate", targetDate);
    }
    
    if (selectedFile) {
      formData.append("post-img", selectedFile);
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post("http://localhost:5000/api/posts/create", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert(response.data.message);
      
      // পোস্ট সফল হলে সবকিছু মুছে ফ্রেশ করে দেওয়া
      setContent("");
      setCategory("সাধারণ");
      setReach("থানা"); 
      setTaggedAuthorities(""); 
      setTargetDate("");
      handleRemoveImage();

      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
    } catch (error) {
      console.error("Post Submit Error:", error);
      alert(error.response?.data?.message || "পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-base-100 shadow-md rounded-xl p-4 md:p-5 border border-base-300 mb-6 transition-all hover:shadow-lg">
      <form onSubmit={handleSubmit}>
        
        <div className="flex gap-3 items-start mb-2">
          
          <div className="w-10 h-10 min-w-[40px] rounded-full ring-1 ring-primary/20 overflow-hidden bg-base-200 flex items-center justify-center shrink-0">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-gray-500">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="w-full flex flex-col gap-3 mt-1">
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`আজ আপনার মনে কী চলছে? আপনার ${reach}-তে শেয়ার করুন...`}
              className="textarea textarea-ghost focus:bg-transparent resize-none w-full min-h-[60px] p-0 text-base focus:outline-none placeholder:text-gray-400 leading-relaxed"
              disabled={isSubmitting}
            />
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="select select-sm select-bordered bg-base-200 text-xs md:text-sm font-medium focus:outline-none h-8 min-h-8 cursor-pointer"
              >
                <option value="সাধারণ">🌍 সাধারণ (General)</option>
                <option value="ব্যবসা">💼 ব্যবসা (Business)</option>
                <option value="সাহায্য">🤝 সাহায্য (Help)</option>
                <option value="রক্তদান">🩸 রক্তদান (Blood)</option>
                <option value="অনুষ্ঠান">🎉 অনুষ্ঠান (Event)</option>
                <option value="সমস্যা">🚨 সমস্যা (Issue)</option>
                <option value="জন্ম">👶 জন্ম (Birth)</option>
                <option value="মৃত্যু">🕊️ মৃত্যু (Death)</option>
              </select>

              <select 
                value={reach} 
                onChange={handleReachChange}
                disabled={isSubmitting}
                className="select select-sm select-bordered bg-primary/5 text-primary text-xs md:text-sm font-semibold focus:outline-none h-8 min-h-8 cursor-pointer border-primary/20"
              >
                <option value="গ্রাম">📍 গ্রাম (Village)</option>
                <option value="ইউনিয়ন">📍 ইউনিয়ন (Union)</option>
                <option value="থানা">📍 থানা (Thana)</option>
                <option value="জেলা">📍 জেলা (District)</option>
                <option value="অন্যান্য জেলা">👑 অন্যান্য জেলা (Premium)</option>
              </select>
            </div>

            {/* 🚀 ম্যাজিক: ডায়নামিক ট্যাগিং বক্স (শুধু সমস্যা সিলেক্ট করলেই আসবে) */}
            {category === 'সমস্যা' && (
                <div className="mt-2 p-4 bg-error/5 border border-error/20 rounded-lg flex flex-col gap-4 animate-fade-in">
                    <div className="text-sm font-bold text-error flex items-center gap-2">
                       🚨 সমস্যার বিস্তারিত তথ্য দিন
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-600">কাকে ট্যাগ করবেন? (কমা দিয়ে লিখুন)</label>
                            <input 
                                type="text" 
                                placeholder="যেমন: চেয়ারম্যান, পল্লী বিদ্যুৎ" 
                                value={taggedAuthorities}
                                onChange={(e) => setTaggedAuthorities(e.target.value)}
                                className="input input-sm input-bordered focus:border-error focus:ring-1 focus:ring-error w-full text-sm bg-white"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-600">সমাধানের শেষ সময় (Optional)</label>
                            <input 
                                type="date" 
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="input input-sm input-bordered focus:border-error focus:ring-1 focus:ring-error w-full text-sm bg-white text-gray-600"
                            />
                        </div>
                    </div>
                </div>
            )}

          </div>
        </div>

        {imagePreview && (
          <div className="relative rounded-lg overflow-hidden border border-base-200 mt-3 mb-4 bg-black/5 flex justify-center items-center">
            <img src={imagePreview} alt="Preview" className="max-h-[250px] object-contain w-full" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-all shadow-md backdrop-blur-sm"
              title="ছবি মুছুন"
            >
              ✕
            </button>
          </div>
        )}

        <hr className="border-base-200 my-3" />

        <div className="flex justify-between items-center">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => fileInputRef.current.click()}
            className="btn btn-ghost btn-sm text-primary flex items-center gap-2 hover:bg-primary/10 rounded-lg px-2 md:px-3"
          >
            🖼️ <span className="font-semibold text-xs md:text-sm">ছবি যোগ করুন</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="submit"
            disabled={isSubmitting || (!content && !selectedFile)}
            className="btn btn-primary btn-sm px-6 font-bold rounded-lg text-white shadow-md shadow-primary/20"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "পাবলিশ করুন"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}