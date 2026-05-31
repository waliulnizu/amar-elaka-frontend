"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import LocationTab from '@/components/profile/LocationTab';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('location');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setUser(res.data.user);
            } catch (error) {
                console.error("Failed to load profile:", error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        setIsUploading(true);
        try {
            const res = await api.post('/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(res.data.user); // Update user with new image
            // In a real app, you might want to show a toast here
        } catch (error) {
            console.error("Image upload failed:", error);
            // Show error toast
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'location', label: 'ঠিকানা (Location)' },
        { id: 'blood', label: 'রক্তদান তথ্য (Blood Donation)' },
        { id: 'settings', label: 'সেটিংস (Settings)' },
    ];

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header Section */}
                <ProfileHeader 
                    user={user} 
                    isUploading={isUploading} 
                    onImageUpload={handleImageUpload} 
                />

                {/* Tabs Section */}
                <div className="mt-8">
                    <div className="tabs tabs-boxed bg-base-100 p-2 justify-start md:justify-center overflow-x-auto whitespace-nowrap hide-scrollbar shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab tab-lg transition-all duration-300 font-medium ${
                                    activeTab === tab.id ? 'tab-active bg-primary text-white shadow-md' : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'location' && (
                                <motion.div
                                    key="location"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <LocationTab location={user?.location} />
                                </motion.div>
                            )}

                            {activeTab === 'blood' && (
                                <motion.div
                                    key="blood"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-6 bg-base-100 rounded-xl shadow-sm border border-base-200"
                                >
                                    <h3 className="text-xl font-bold text-base-content mb-6">রক্তদান সংক্রান্ত তথ্য</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-base-200/50 p-4 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-base-content/60 mb-1">সর্বশেষ রক্তদানের তারিখ</p>
                                                <p className="font-semibold text-lg">
                                                    {user?.lastDonationDate 
                                                        ? new Date(user.lastDonationDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) 
                                                        : 'এখনো রক্ত দেননি'}
                                                </p>
                                            </div>
                                            <button className="btn btn-primary btn-sm">আপডেট</button>
                                        </div>
                                        <div className="bg-base-200/50 p-4 rounded-lg">
                                            <p className="text-sm text-base-content/60 mb-1">রক্তের গ্রুপ</p>
                                            <p className="font-semibold text-2xl text-error">{user?.bloodGroup || 'N/A'}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-6 bg-base-100 rounded-xl shadow-sm border border-base-200"
                                >
                                    <h3 className="text-xl font-bold text-base-content mb-4">অ্যাকাউন্ট সেটিংস</h3>
                                    <div className="space-y-4">
                                        <button className="btn btn-outline w-full justify-start text-base-content/80">
                                            পাসওয়ার্ড পরিবর্তন করুন
                                        </button>
                                        <button className="btn btn-outline btn-error w-full justify-start">
                                            অ্যাকাউন্ট ডিলিট করুন
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
