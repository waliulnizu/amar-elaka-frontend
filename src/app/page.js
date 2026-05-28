// frontend/src/app/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CreatePostBox from "@/components/CreatePostBox";
import confetti from "canvas-confetti";

export default function HomePage() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const profileRes = await axios.get("http://localhost:5000/api/users/profile", {
          withCredentials: true,
          timeout: 5000
        });

        if (isMounted) {
          setUserData(profileRes.data.user);
        }

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
      alert("প্রোফাইল পিকচার সফলভাবে পরিবর্তন করা হয়েছে!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.response?.data?.message || "ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsUploading(false);
    }
  };

  // ক্যাটাগরি অনুযায়ী badge color নির্ধারণ
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'রক্তদান': return 'badge-error text-white';
      case 'ব্যবসা': return 'badge-info text-white';
      case 'সাহায্য': return 'badge-warning';
      case 'অনুষ্ঠান': return 'badge-success text-white';
      case 'সমস্যা': return 'badge-error text-white';
      case 'জন্ম': return 'badge-primary text-white';
      case 'মৃত্যু': return 'bg-gray-600 text-white border-0';
      default: return 'badge-ghost bg-base-200';
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
            <p><strong>মোবাইল:</strong> {userData?.phone || "দেওয়া হয়নি"}</p>
            <p><strong>রক্তের গ্রুপ:</strong> <span className="text-error font-bold">{userData?.bloodGroup || "N/A"}</span></p>
          </div>
        </div>

        {/* ডান পাশের কলাম: পোস্ট বক্স এবং লাইভ নিউজফিড */}
        <div className="md:col-span-2 w-full flex flex-col gap-4">

          <CreatePostBox
            user={userData}
            onPostCreated={(newPost) => {
              setPosts((prevPosts) => [newPost, ...prevPosts]);
            }}
          />

          {/* লাইভ নিউজফিড */}
          <div className="flex flex-col gap-4">
            {posts.length === 0 ? (
              <div className="p-8 bg-base-100 border border-dashed border-base-300 rounded-xl text-center text-gray-400 font-medium">
                📰 কমিউনিটিতে এখনো কোনো পোস্ট করা হয়নি। প্রথম পোস্টটি আপনিই করুন!
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-base-100 shadow-md rounded-xl p-5 border border-base-300 flex flex-col gap-3 transition-all hover:shadow-lg">

                  {/* পোস্টের হেডার */}
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
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`badge badge-sm font-semibold px-3 py-2 ${getCategoryBadgeClass(post.category)}`}>
                      {post.category || 'সাধারণ'}
                    </div>
                  </div>

                  {/* পোস্টের মূল কন্টেন্ট */}
                  <p className="text-base-content text-sm whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>

                  {/* পোস্টের ছবি */}
                  {post.postImage && (
                    <div className="rounded-lg overflow-hidden border border-base-200 max-h-[400px] bg-base-100 flex justify-center items-center">
                      <img src={post.postImage} alt="Post Attachment" className="max-h-[400px] w-full object-cover" />
                    </div>
                  )}

                  {/* সমস্যা ক্যাটাগরির সিভিক ইন্টার‍্যাকশন বার */}
                  {post.category === 'সমস্যা' && (
                    <div className={`mt-1 pt-3 border-t border-base-200 flex flex-col gap-3 p-3 rounded-lg transition-all ${post.isSolved ? "bg-success/10 border-success/30" : "bg-base-50"}`}>

                      {/* ট্যাগ ও ডেডলাইন */}
                      <div className="text-xs text-gray-500 font-medium flex flex-wrap justify-between items-center w-full">
                        <div className="flex flex-col gap-1">
                          {post.taggedAuthorities?.length > 0 && (
                            <span><strong className="text-error">ট্যাগ:</strong> {post.taggedAuthorities.join(', ')}</span>
                          )}
                          {post.targetDate && (
                            <span><strong>ডেডলাইন:</strong> {new Date(post.targetDate).toLocaleDateString('bn-BD')}</span>
                          )}
                        </div>
                        {post.isSolved && (
                          <span className="badge badge-success text-white font-bold gap-1 px-3 py-2 text-xs animate-bounce">
                            ✅ সমাধানকৃত (Solved)
                          </span>
                        )}
                      </div>

                      {/* অ্যাকশন বাটন */}
                      <div className="flex justify-end gap-2 items-center w-full border-t border-dashed border-base-200 pt-2">

                        {/* ফলো বাটন */}
                        <button
                          onClick={async () => {
                            try {
                              const res = await axios.put(`http://localhost:5000/api/posts/${post._id}/follow`, {}, { withCredentials: true });
                              setPosts((prevPosts) =>
                                prevPosts.map((p) => p._id === post._id ? { ...p, followers: res.data.followers } : p)
                              );
                              alert(res.data.message);
                            } catch (error) {
                              alert("ফলো করতে সমস্যা হয়েছে!");
                            }
                          }}
                          className={`btn btn-xs md:btn-sm border-none rounded-full px-4 shadow-sm transition-all ${
                            post.followers?.includes(userData?.id || userData?._id)
                              ? "bg-warning text-white hover:bg-warning/80"
                              : "bg-warning/20 text-warning-content hover:bg-warning hover:text-white"
                          }`}
                        >
                          🔔 {post.followers?.includes(userData?.id || userData?._id) ? "জানানো হবে" : "জানতে ইচ্ছুক"} ({post.followers?.length || 0})
                        </button>

                        {/* সমাধান বাটন (শুধু লেখক দেখতে পাবেন) */}
                        {(post.user?._id === userData?.id || post.user === userData?.id || post.user?._id === userData?._id) && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await axios.put(`http://localhost:5000/api/posts/${post._id}/solve`, {}, { withCredentials: true });
                                setPosts((prevPosts) =>
                                  prevPosts.map((p) => p._id === post._id ? { ...p, isSolved: res.data.isSolved } : p)
                                );
                                if (res.data.isSolved) {
                                  confetti({
                                    particleCount: 150,
                                    spread: 80,
                                    origin: { y: 0.6 }
                                  });
                                }
                                alert(res.data.message);
                              } catch (error) {
                                alert(error.response?.data?.message || "স্ট্যাটাস পরিবর্তন করা যায়নি।");
                              }
                            }}
                            className={`btn btn-xs md:btn-sm border-none rounded-full px-4 shadow-sm font-bold text-white transition-all ${
                              post.isSolved
                                ? "bg-gray-500 hover:bg-gray-600"
                                : "bg-success hover:bg-success-focus shadow-success/20"
                            }`}
                          >
                            {post.isSolved ? "🔄 পুনরায় উন্মুক্ত করুন" : "✅ সমাধান হয়েছে"}
                          </button>
                        )}

                      </div>
                    </div>
                  )}

                  {/* সাহায্য এবং রক্তদান ক্যাটাগরির ভলান্টিয়ার ইন্টারফেস */}
                  {(post.category === 'সাহায্য' || post.category === 'রক্তদান') && (
                    <div className={`mt-1 pt-3 border-t border-base-200 flex flex-col gap-2 p-3 rounded-lg ${
                      post.helperSelected ? "bg-success/5 border-success/20" : "bg-base-50"
                    }`}>

                      {/* স্ট্যাটাস */}
                      <div className="flex justify-between items-center text-xs w-full">
                        <span className="text-gray-500 font-medium">
                          🤝 ভলান্টিয়ার সংখ্যা: <strong className="text-primary text-sm">{post.helpers?.length || 0} জন</strong>
                        </span>
                        {post.helperSelected && (
                          <span className="text-success font-bold bg-success/10 px-2 py-1 rounded-md text-[11px]">
                            ✓ কমপ্লিট (সাহায্য লাগবে না)
                          </span>
                        )}
                      </div>

                      {/* Helped from */}
                      {post.helperSelected && (
                        <div className="text-xs bg-white p-2 rounded border border-success/30 text-gray-700">
                          🎉 <strong>Helped from:</strong> <span className="text-success font-bold">{post.helperSelected?.name}</span>
                        </div>
                      )}

                      {/* ভলান্টিয়ার বাটন */}
                      <div className="flex justify-end gap-2 items-center w-full border-t border-dashed border-base-200 pt-2">
                        <button
                          disabled={!!post.helperSelected}
                          onClick={async () => {
                            try {
                              const res = await axios.put(`http://localhost:5000/api/posts/${post._id}/volunteer`, {}, { withCredentials: true });
                              setPosts((prevPosts) => prevPosts.map((p) => p._id === post._id ? res.data.post : p));
                              alert(res.data.message);
                            } catch (error) {
                              alert("ভলান্টিয়ার হতে সমস্যা হয়েছে।");
                            }
                          }}
                          className={`btn btn-xs md:btn-sm border-none rounded-full px-4 font-bold ${
                            post.helperSelected
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : post.helpers?.includes(userData?.id || userData?._id)
                              ? "bg-success text-white"
                              : "bg-primary text-white hover:bg-primary-focus"
                          }`}
                        >
                          {post.helperSelected
                            ? "✅ সম্পন্ন"
                            : post.category === 'রক্তদান'
                            ? "🩸 আমি রক্ত দিতে চাই"
                            : "🙋‍♂️ আমি সাহায্য করতে চাই"}
                        </button>
                      </div>

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