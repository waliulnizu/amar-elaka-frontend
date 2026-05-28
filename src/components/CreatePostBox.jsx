// frontend/src/components/CreatePostBox.jsx
"use client";

import { useState, useRef } from "react";
import axios from "axios";

// এই কম্পোনেন্টটি সফলভাবে পোস্ট হওয়ার পর ড্যাশবোর্ডের লিস্ট আপডেট করার জন্য 
// অন-পোস্ট-ক্রিয়েটেড (onPostCreated) নামের একটি ফাংশন প্রপ্স হিসেবে রিসিভ করবে
export default function CreatePostBox({ user, onPostCreated }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("সাধারণ");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // ছবির প্রিভিউ দেখানোর জন্য
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // ১. ইউজার যখন কম্পিউটার থেকে ছবি সিলেক্ট করবে
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // সিকিউরিটি চেক: ২ এমবির বেশি বড় ছবি হলে আটকে দাও
    if (file.size > 2 * 1024 * 1024) {
      alert("দুঃখিত, ছবির সাইজ ২ মেগাবাইটের কম হতে হবে!");
      return;
    }

    setSelectedFile(file);

    // 🧠 Developer Trick: জাভা-স্ক্রিপ্টের FileReader এপিআই দিয়ে ছবির একটি টেম্পোরারি 
    // লোকাল ইউআরএল (Base64) তৈরি করা, যাতে আপলোড হওয়ার আগেই ইউজার স্ক্রিনে ছবি দেখতে পায়।
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ২. ছবি রিমুভ করার ফাংশন (ইউজার যদি ছবি পছন্দ না করে কেটে দিতে চায়)
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ৩. ব্যাকএন্ডে পোস্ট সাবমিট করার ফাংশন
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !selectedFile) return;

    // মাল্টার রিসিভ করার জন্য FormData পার্সেল বক্স তৈরি
    const formData = new FormData();
    formData.append("content", content);
    formData.append("category", category);
    if (selectedFile) {
      formData.append("post-img", selectedFile); // 👈 ব্যাকএন্ডের upload.single('post-img') এর সাথে মিল রেখে

    }

    try {
      setIsSubmitting(true);

      const response = await axios.post("http://localhost:5000/api/posts/create", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert(response.data.message);
      
      // পোস্ট সফল হলে ইনপুট বক্সগুলো একদম ফ্রেশ বা খালি করে দেওয়া
      setContent("");
      setCategory("সাধারণ"); // 👈 পোস্ট হওয়ার পর আবার ডিফল্ট ক্যাটাগরিতে ফেরত আনা 
      handleRemoveImage();

      // ড্যাশবোর্ডের পোস্ট লিস্টকে নতুন পোস্টের কথা জানানো
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
    <div className="w-full bg-base-100 shadow-md rounded-xl p-4 border border-base-300 mb-6">
      <form onSubmit={handleSubmit}>
        
        {/* হেডার সেকশন: ইউজারের গোল ছবি বা নামের প্রথম অক্ষর */}
        <div className="flex gap-3 items-start mb-3">
          <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2 overflow-hidden bg-base-200 flex items-center justify-center">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-gray-500">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          {/* মডার্ন টেক্সট এরিয়া ইনপুট */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="আজ আপনার মনে কী চলছে? কমিউনিটিতে শেয়ার করুন..."
            className="textarea textarea-ghost focus:bg-transparent resize-none w-full min-h-[80px] p-2 text-base focus:outline-none placeholder:text-gray-400"
            disabled={isSubmitting}
          />
          {/* ➕ নতুন: মডার্ন ক্যাটাগরি ড্রপডাউন সিলেক্টর */}
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="select select-sm select-bordered w-full max-w-[200px] bg-base-200 text-sm focus:outline-none"
            >
              <option value="সাধারণ">🌍 সাধারণ (General)</option>
              <option value="ব্যবসা">💼 ব্যবসা (Business)</option>
              <option value="সাহায্য">🤝 সাহায্য (Help)</option>
              <option value="রক্তদান">🩸 রক্তদান (Blood)</option>
              <option value="অনুষ্ঠান">🎉 অনুষ্ঠান (Event)</option>
            </select>
        </div>

        {/* ➕ নতুন: ছবি সিলেক্ট করার পর যে সুন্দর লাইভ প্রিভিউ বক্সটি আসবে */}
        {imagePreview && (
          <div className="relative rounded-lg overflow-hidden border border-base-200 max-h-[300px] mb-4 bg-base-200 flex justify-center items-center">
            <img src={imagePreview} alt="Preview" className="max-h-[300px] object-contain w-full" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-all shadow-md"
              title="ছবি মুছুন"
            >
              ✕
            </button>
          </div>
        )}

        <hr className="border-base-200 mb-3" />

        {/* ফুটার সেকশন: গ্যালারি বাটন এবং পাবলিশ বাটন */}
        <div className="flex justify-between items-center">
          
          {/* গ্যালারি বাটন (📷 আইকন যা লোকানো ইনপুটকে ট্রিকার করবে) */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => fileInputRef.current.click()}
            className="btn btn-ghost btn-sm text-primary flex items-center gap-2 hover:bg-primary/10 rounded-lg"
          >
            🖼️ <span className="hidden sm:inline font-semibold">ছবি যোগ করুন</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* পাবলিশ বাটন */}
          <button
            type="submit"
            disabled={isSubmitting || (!content && !selectedFile)}
            className="btn btn-primary btn-sm px-6 font-semibold rounded-lg text-white shadow-md shadow-primary/20"
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