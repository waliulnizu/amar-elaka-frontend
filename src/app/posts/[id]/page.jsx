"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";

export default function PostDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/posts/${id}`, { withCredentials: true });
                if (res.data.success) {
                    setPost(res.data.post);
                }
            } catch (error) {
                console.error("Error fetching post", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200">
                <Navbar />
                <div className="text-center mt-20 font-bold text-gray-500">লোড হচ্ছে...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-base-200">
                <Navbar />
                <div className="text-center mt-20 font-bold text-red-500">পোস্টটি পাওয়া যায়নি।</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 pb-10">
            <Navbar />
            
            <div className="max-w-2xl mx-auto p-4 md:p-8 mt-6">
                {/* Back Button */}
                <button onClick={() => router.back()} className="btn btn-sm btn-ghost mb-4 text-primary">
                    ← ফিরে যান
                </button>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-base-200">
                    {/* Post Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-base-200 flex justify-center items-center">
                            {post.user?.profileImage ? (
                                <img src={post.user.profileImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-gray-500 text-lg">{post.user?.name?.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-md text-gray-800">{post.user?.name || "কমিউনিটি মেম্বার"}</h4>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(post.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        <div className="badge badge-error text-white ml-auto px-4 py-3">
                            {post.category}
                        </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

                    {/* Post Image */}
                    {post.postImage && (
                        <div className="rounded-xl overflow-hidden mb-6 border">
                            <img src={post.postImage} alt="Post" className="w-full max-h-96 object-cover" />
                        </div>
                    )}
                    
                    {/* Volunteer List Section */}
                    <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                                🤝 ভলান্টিয়ার তালিকা
                            </h2>
                            <div className="badge badge-primary badge-lg">{post.helpers?.length || 0} জন</div>
                        </div>
                        
                        {post.helpers && post.helpers.length > 0 ? (
                            <ul className="space-y-4">
                                {post.helpers.map((helper, index) => (
                                    <li key={helper._id || index} className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-xl border border-gray-100">
                                        <div className="avatar">
                                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm">
                                                {helper.profileImage ? (
                                                    <img src={helper.profileImage} alt={helper.name} className="rounded-full" />
                                                ) : (
                                                    <span className="font-bold text-primary text-xl">{helper.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-lg">{helper.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {helper.phone ? `📞 ${helper.phone}` : "ফোন নম্বর গোপনীয়"}
                                            </p>
                                        </div>
                                        {helper.bloodGroup && (
                                            <div className="flex flex-col items-center justify-center bg-red-100 text-red-600 rounded-lg px-4 py-2 border border-red-200">
                                                <span className="text-xs font-semibold">রক্তের গ্রুপ</span>
                                                <span className="font-bold text-lg">{helper.bloodGroup}</span>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-4xl mb-3 block">👀</span>
                                <p className="text-gray-500 font-medium">এখনো কোনো ভলান্টিয়ার যুক্ত হয়নি।</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
