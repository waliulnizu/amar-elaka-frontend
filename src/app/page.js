"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CreatePostBox from "@/components/CreatePostBox";
import ProfileCard from "@/components/ProfileCard"; // 👈 নতুন ইমপোর্ট
import Newsfeed from "@/components/Newsfeed"; // 👈 নতুন ইমপোর্ট

export default function HomePage() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/profile", { withCredentials: true }),
          axios.get("http://localhost:5000/api/posts/all", { withCredentials: true })
        ]);
        setUserData(profileRes.data.user);
        setPosts(postsRes.data.posts);
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // ছবি আপলোডের ফাংশন
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploading(true);
      const res = await axios.post("http://localhost:5000/api/users/upload-avatar", formData, { withCredentials: true });
      setUserData(res.data.user);
    } catch (error) {
      alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsUploading(false);
    }
  };

  // লোকেশন সেভ করার ফাংশন
  const handleLocationSave = async (newLocation) => {
    try {
      const res = await axios.put("http://localhost:5000/api/users/update-location", newLocation, { withCredentials: true });
      setUserData(res.data.user);
      alert("ঠিকানা সফলভাবে আপডেট হয়েছে!");
    } catch (error) {
      alert("ঠিকানা আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary"></span></div>;

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar user={userData} />
      <div className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* প্রোফাইল কম্পোনেন্ট */}
        <div className="md:col-span-1">
          <ProfileCard 
            user={userData} 
            isUploading={isUploading} 
            onImageUpload={handleImageChange} 
            onLocationSave={handleLocationSave} 
          />
        </div>

        {/* পোস্ট এবং নিউজফিড কম্পোনেন্ট */}
        <div className="md:col-span-2 w-full flex flex-col gap-4">
          <CreatePostBox user={userData} onPostCreated={(newPost) => setPosts([newPost, ...posts])} />
          <Newsfeed posts={posts} setPosts={setPosts} currentUser={userData} />
        </div>
        
      </div>
    </div>
  );
}