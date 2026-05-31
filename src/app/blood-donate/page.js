import React from 'react';
import { FaTint, FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';

export const metadata = {
  title: 'রক্তের আবেদন | আমারএলাকা',
  description: 'জরুরি রক্তের আবেদনগুলো দেখুন এবং রক্তদানে এগিয়ে আসুন।',
};

export default function BloodDonatePage() {
    // ডামি ডেটা: ব্যাকএন্ড API (Phase 2) তৈরি হলে আমরা আসল ডেটা ফেচ করব
    const dummyPosts = [
        {
            _id: "1",
            patientName: "মো. আব্দুর রহমান",
            bloodGroup: "O+",
            hospitalName: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
            urgency: "Very Urgent",
            details: "খুব দ্রুত ও পজিটিভ রক্তের প্রয়োজন। রোগীর অবস্থা আশঙ্কাজনক।",
            expiresAt: new Date(Date.now() + 86400000), // আগামীকালের ডেট
            createdAt: new Date(Date.now() - 3600000), // ১ ঘণ্টা আগে
        },
        {
            _id: "2",
            patientName: "রহিমা খাতুন",
            bloodGroup: "AB-",
            hospitalName: "স্কয়ার হাসপাতাল, পান্থপথ",
            urgency: "Regular",
            details: "আগামী পরশু অপারেশনের জন্য রক্ত লাগবে।",
            expiresAt: new Date(Date.now() + 172800000), // ২ দিন পর
            createdAt: new Date(Date.now() - 7200000), // ২ ঘণ্টা আগে
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* হেডার সেকশন */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-red-600 flex items-center gap-3">
                        <FaTint /> রক্তের আবেদন
                    </h1>
                    <p className="text-gray-600 mt-2 font-medium">
                        জরুরি রক্তের আবেদনগুলো দেখুন এবং রক্তদানে এগিয়ে আসুন। আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি প্রাণ!
                    </p>
                </div>
            </div>

            {/* ফিল্টার (ভবিষ্যতে কাজ করব) */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button className="btn btn-sm btn-active rounded-full px-5">সব</button>
                <button className="btn btn-sm btn-outline rounded-full px-5">O+</button>
                <button className="btn btn-sm btn-outline rounded-full px-5">A+</button>
                <button className="btn btn-sm btn-outline rounded-full px-5">B+</button>
                <button className="btn btn-sm btn-outline rounded-full px-5">AB+</button>
            </div>

            {/* পোস্ট লিস্ট */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dummyPosts.map((post) => (
                    <div key={post._id} className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-shadow relative overflow-hidden">
                        
                        {/* अर्जेंसी ব্যাজ */}
                        {post.urgency === 'Very Urgent' && (
                            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-md">
                                🚨 অতি জরুরি
                            </div>
                        )}

                        <div className="card-body p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="card-title text-xl font-bold text-gray-800">
                                        {post.patientName}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        পোস্ট করা হয়েছে: ১ ঘণ্টা আগে
                                    </p>
                                </div>
                                <div className="avatar placeholder">
                                    <div className="bg-red-100 text-red-600 rounded-full w-14 ring ring-red-300 ring-offset-2">
                                        <span className="text-xl font-extrabold">{post.bloodGroup}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                <div className="flex items-start gap-3 text-gray-700">
                                    <FaMapMarkerAlt className="mt-1 text-red-500" />
                                    <span className="font-medium">{post.hospitalName}</span>
                                </div>
                                <div className="flex items-start gap-3 text-gray-700 bg-base-200 p-3 rounded-lg border border-base-300">
                                    <span className="text-sm italic">"{post.details}"</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded-md inline-flex w-fit">
                                    <FaClock />
                                    <span>সময় বাকি: ১ দিন ৪ ঘণ্টা</span>
                                </div>
                            </div>

                            <div className="card-actions justify-end mt-6 border-t pt-4">
                                <button className="btn btn-outline btn-sm rounded-full">বিস্তারিত</button>
                                <button className="btn btn-error text-white rounded-full px-6 shadow-md shadow-red-200">
                                    <FaTint /> আমি রক্ত দিতে চাই
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
