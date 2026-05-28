// frontend/src/app/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CreatePostBox from "@/components/CreatePostBox";

export default function HomePage() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]); // ➕ নতুন যোগ হলো: নিউজফিডের সব পোস্ট রাখার স্টেট
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // ডাটাবেস থেকে প্রোফাইল এবং সব পোস্ট একসাথে নিয়ে আসার মাস্টার ফাংশন
    const fetchDashboardData = async () => {
      try {
        // ১. ইউজারের প্রোফাইল ডেটা আনা
        const profileRes = await axios.get("http://localhost:5000/api/users/profile", {
          withCredentials: true,
          timeout: 5000
        });

        if (isMounted) {
          setUserData(profileRes.data.user);
        }

        // ২. ➕ নতুন যোগ হলো: নিউজফিডের সব পোস্ট ব্যাকএন্ড থেকে আনা
        const postsRes = await axios.get("http://localhost:5000/api/posts/all", {
          withCredentials: true
        });

        if (isMounted) {
          setPosts(postsRes.data.posts);
        }

      } catch (error) {
        if (isMounted) {
          router.push("/login");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // প্রোফাইল পিকচার আপলোডের ফাংশন (আগের মতোই)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("দুঃখিত, ফাইল সাইজ ২ মেগাবাইটের কম হতে হবে!");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploading(true);
      const response = await axios.post("http://localhost:5000/api/users/upload-avatar", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUserData(response.data.user);
      alert("প্রোফাইল পিকচার সফলভাবে পরিবর্তন করা হয়েছে!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.response?.data?.message || "ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar user={userData} />

      <div className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* বাম পাশের কলাম: প্রোফাইল কার্ড */}
        <div className="md:col-span-1 bg-base-100 shadow-xl rounded-xl p-6 flex flex-col items-center border border-base-300 sticky top-4">
          <div className="relative group mb-4">
            <div className={`w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-gray-200 flex items-center justify-center shadow-inner ${isUploading ? 'opacity-50' : ''}`}>
              {isUploading ? (
                <span className="loading loading-spinner loading-md text-primary"></span>
              ) : userData?.profileImage ? (
                <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-gray-500">
                  {userData?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full text-white shadow-md hover:scale-110 transition-all text-xs"
              title="ছবি পরিবর্তন করুন"
            >
              📷
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>

          <h2 className="text-xl font-bold text-base-content text-center mb-1">{userData?.name}</h2>
          <p className="text-sm text-gray-400 font-medium mb-4">{userData?.email}</p>

          <div className="w-full border-t pt-3 flex flex-col gap-2 text-sm text-base-content/80">
            <p><strong>মোবাইল:</strong> {userData?.phone || "দেওয়া হয়নি"}</p>
            <p><strong>রক্তের গ্রুপ:</strong> <span className="text-error font-bold">{userData?.bloodGroup || "N/A"}</span></p>
          </div>
        </div>

        {/* ডান পাশের কলাম: পোস্ট বক্স এবং লাইভ নিউজফিড */}
        <div className="md:col-span-2 w-full flex flex-col gap-4">

          {/* 🧠 Developer Concept: ইউজার যখনই কোনো নতুন পোস্ট সাবমিট করবে, 
              আমরা [newPost, ...prevPosts] মেথড দিয়ে পেজ রিফ্লেশ ছাড়াই সেটিকে লিস্টের সবার ওপরে ঠেলে দেব। */}
          <CreatePostBox
            user={userData}
            onPostCreated={(newPost) => {
              setPosts((prevPosts) => [newPost, ...prevPosts]);
            }}
          />

          {/* 📰 লাইভ নিউজফিড লিস্ট (Newsfeed List) */}
          <div className="flex flex-col gap-4">
            {posts.length === 0 ? (
              <div className="p-8 bg-base-100 border border-dashed border-base-300 rounded-xl text-center text-gray-400 font-medium">
                📰 কমিউনিটিতে এখনো কোনো পোস্ট করা হয়নি। প্রথম পোস্টটি আপনিই করুন!
              </div>
            ) : (
              // লুপ চালিয়ে প্রতিটি পোস্টকে সুন্দর ফেসবুক স্টাইল কার্ডে কনভার্ট করা হচ্ছে
              posts.map((post) => (
                <div key={post._id} className="bg-base-100 shadow-md rounded-xl p-5 border border-base-300 flex flex-col gap-3 transition-all hover:shadow-lg">

                  {/* পোস্টের হেডার: পোস্টদাতার নাম ও ছবি */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-base-200 ring-1 ring-primary/20 flex items-center justify-center">
                      {post.user?.profileImage ? (
                        <img src={post.user.profileImage} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gray-500">{post.user?.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base-content text-sm">{post.user?.name || "কমিউনিটি মেম্বার"}</h4>
                      {/* পোস্ট করার সুনির্দিষ্ট সময়কে মানুষের পড়ার উপযোগী (Readable format) করা */}
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`badge badge-sm font-semibold px-3 py-2 ${post.category === 'রক্তদান' ? 'badge-error text-white' :
                      post.category === 'ব্যবসা' ? 'badge-info text-white' :
                        post.category === 'সাহায্য' ? 'badge-warning' :
                          post.category === 'অনুষ্ঠান' ? 'badge-success text-white' :
                            'badge-ghost bg-base-200'
                      }`}>
                      {post.category || 'সাধারণ'}
                    </div>
                  </div>

                  {/* পোস্টের মূল কন্টেন্ট বা লেখা */}
                  <p className="text-base-content text-sm whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>

                  {/* পোস্টের সাথে যদি ক্লাউডিনারির ছবি থাকে, তবেই এই ইমেজ বক্সটি রেন্ডার হবে */}
                  {post.postImage && (
                    <div className="rounded-lg overflow-hidden border border-base-200 max-h-[400px] bg-base-100 flex justify-center items-center">
                      <img src={post.postImage} alt="Post Attachment" className="max-h-[400px] w-full object-cover" />
                    </div>
                  )}

                  {/* ➕ নতুন: সিভিক টেক ইন্টার‍্যাকশন বার (শুধুমাত্র সমস্যার জন্য) */}
                  {post.category === 'সমস্যা' && (
                    <div className="mt-3 pt-3 border-t border-base-200 flex flex-wrap gap-2 items-center justify-between bg-base-50 p-2 rounded-lg">

                      <div className="text-xs text-gray-500 font-medium flex flex-col gap-1">
                        {post.taggedAuthorities?.length > 0 && (
                          <span><strong className="text-error">ট্যাগ:</strong> {post.taggedAuthorities.join(', ')}</span>
                        )}
                        {post.targetDate && (
                          <span><strong>ডেডলাইন:</strong> {new Date(post.targetDate).toLocaleDateString('bn-BD')}</span>
                        )}
                      </div>

                      {/* ফলো / জানতে ইচ্ছুক বাটন (রিয়েল-টাইম কাউন্টিং ফিক্সড) */}
                      <button
                        onClick={async () => {
                          try {
                            // ১. ব্যাকএন্ডে রিকোয়েস্ট পাঠানো
                            const res = await axios.put(`http://localhost:5000/api/posts/${post._id}/follow`, {}, { withCredentials: true });

                            // ২. ম্যাজিক লজিক: ম্যাপ লুপ চালিয়ে নির্দিষ্ট পোস্টের ফলোয়ার অ্যারে সরাসরি আপডেট করা
                            setPosts((prevPosts) =>
                              prevPosts.map((p) =>
                                p._id === post._id ? { ...p, followers: res.data.followers } : p
                              )
                            );

                            alert(res.data.message);
                          } catch (error) {
                            console.error("Follow error:", error);
                            alert("ফলো করতে সমস্যা হয়েছে!");
                          }
                        }}
                        // ডায়নামিক ক্লাস: কারেন্ট ইউজার যদি অলরেডি ফলো করে রাখে তবে বাটন হাইলাইট বা সলিড কালার হবে
                        className={`btn btn-sm border-none rounded-full px-4 shadow-sm transition-all ${post.followers?.includes(userData?.id || userData?._id)
                            ? "bg-warning text-white hover:bg-warning/80"
                            : "bg-warning/20 text-warning-content hover:bg-warning hover:text-white"
                          }`}
                      >
                        🔔 {post.followers?.includes(userData?.id || userData?._id) ? "জানানো হবে" : "জানতে ইচ্ছুক"} ({post.followers?.length || 0})
                      </button>

                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}