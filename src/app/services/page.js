import React from 'react';
import { FaHandsHelping, FaWrench, FaBookReader, FaStethoscope } from 'react-icons/fa';

export const metadata = {
  title: 'সেবা ও সাহায্য | আমারএলাকা',
  description: 'আপনার এলাকার প্রয়োজনীয় সেবা খুঁজুন অথবা কাউকে সাহায্য করুন।',
};

export default function ServicesPage() {
    // ডামি ডেটা
    const dummyServices = [
        {
            _id: "s1",
            providerName: "রফিকুল ইসলাম",
            serviceType: "ইলেকট্রিশিয়ান",
            icon: <FaWrench className="text-blue-500 text-2xl" />,
            location: "ধানমন্ডি, ঢাকা",
            details: "বাসাবাড়ির যেকোনো বৈদ্যুতিক সমস্যার দ্রুত সমাধান করা হয়।",
            contact: "017XXXXXXXX"
        },
        {
            _id: "s2",
            providerName: "ডা. সুমাইয়া আক্তার",
            serviceType: "মেডিকেল পরামর্শ",
            icon: <FaStethoscope className="text-green-500 text-2xl" />,
            location: "অনলাইন সেবা",
            details: "জরুরি প্রাথমিক চিকিৎসার জন্য বিনামূল্যে কল করতে পারেন।",
            contact: "018XXXXXXXX"
        },
        {
            _id: "s3",
            providerName: "তানভীর আহমেদ",
            serviceType: "টিউশন",
            icon: <FaBookReader className="text-purple-500 text-2xl" />,
            location: "মিরপুর-১০, ঢাকা",
            details: "অষ্টম থেকে দশম শ্রেণির গণিত ও বিজ্ঞান পড়াই।",
            contact: "019XXXXXXXX"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* হেডার সেকশন */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3">
                        <FaHandsHelping /> সেবা ও সাহায্য
                    </h1>
                    <p className="text-gray-600 mt-2 font-medium">
                        আপনার এলাকার প্রয়োজনীয় সেবা খুঁজুন। একে অপরের সাহায্যে এগিয়ে আসুন এবং একটি সুন্দর সমাজ গড়ে তুলুন।
                    </p>
                </div>
            </div>

            {/* ফিল্টার */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button className="btn btn-sm btn-active btn-primary rounded-full px-5">সব সেবা</button>
                <button className="btn btn-sm btn-outline rounded-full px-5">ইলেকট্রনিক্স</button>
                <button className="btn btn-sm btn-outline rounded-full px-5">মেডিকেল</button>
                <button className="btn btn-sm btn-outline rounded-full px-5">শিক্ষা</button>
            </div>

            {/* সার্ভিস লিস্ট */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dummyServices.map((service) => (
                    <div key={service._id} className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="card-body p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
                                    {service.icon}
                                </div>
                                <div>
                                    <h2 className="card-title text-lg font-bold text-gray-800">
                                        {service.serviceType}
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {service.providerName}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    "{service.details}"
                                </p>
                            </div>
                            
                            <div className="text-sm text-gray-600 font-medium mb-4 flex items-center gap-2">
                                📍 {service.location}
                            </div>

                            <div className="card-actions justify-end mt-auto pt-4 border-t border-base-200">
                                <button className="btn btn-outline btn-primary btn-sm rounded-full w-full">
                                    যোগাযোগ করুন
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 text-center text-gray-500">
                <p>⚠️ নতুন সেবা যোগ করতে ফিডের "Create Post" থেকে ক্যাটাগরি "সাহায্য" নির্বাচন করুন।</p>
            </div>
        </div>
    );
}
