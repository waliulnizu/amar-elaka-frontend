// frontend/src/app/login/page.jsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
    const { register, handleSubmit } = useForm();
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const router = useRouter();

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await axios.post("http://localhost:5000/api/users/login", {
                identifier: data.identifier,
                password: data.password
            }, {
                // ➕ নতুন যোগ হলো: সার্ভার থেকে পাঠানো কুকি রিসিভ করার পারমিশন
                withCredentials: true 
            });

            setMessage({ type: "success", text: response.data.message });

            // ➖ বাদ দেওয়া হলো: localStorage.setItem("token", ...) লাইনটি মুছে ফেলা হয়েছে!
            
            // ইউজারের নাম-ঠিকানা লোকাল স্টোরেজে রাখলাম শুধু UI-তে দেখানোর জন্য
            localStorage.setItem("user", JSON.stringify(response.data.user));

            setTimeout(() => {
                router.push("/"); 
            }, 1000);

        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "লগিন ব্যর্থ হয়েছে। আবার চেষ্টা করুন!"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 py-10 px-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="text-3xl font-bold text-center text-primary mb-6">লগিন করুন</h2>

                    {message.text && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4 text-white`}>
                            <span>{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
                        
                        <div className="form-control" suppressHydrationWarning>
                            <label className="label">
                                <span className="label-text font-medium">মোবাইল নাম্বার বা ইমেইল *</span>
                            </label>
                            <input 
                                type="text" 
                                {...register("identifier", { required: true })} 
                                className="input input-bordered w-full" 
                                placeholder="017........ অথবা example@mail.com" 
                            />
                        </div>

                        <div className="form-control" suppressHydrationWarning>
                            <label className="label">
                                <span className="label-text font-medium">পাসওয়ার্ড *</span>
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    {...register("password", { required: true })} 
                                    className="input input-bordered w-full pr-12" 
                                    placeholder="আপনার পাসওয়ার্ড দিন" 
                                />
                                <button 
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-primary transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                            <label className="label justify-end mt-1">
                                <Link href="/forgot-password" className="label-text-alt text-primary hover:underline font-medium">
                                    পাসওয়ার্ড ভুলে গেছেন?
                                </Link>
                            </label>
                        </div>

                        <div className="form-control mt-6" suppressHydrationWarning>
                            <button 
                                type="submit" 
                                className="btn btn-primary w-full text-white text-lg" 
                                disabled={isLoading}
                            >
                                {isLoading ? <span className="loading loading-spinner"></span> : "প্রবেশ করুন"}
                            </button>
                        </div>
                        
                        <p className="text-center mt-4">
                            এখনও অ্যাকাউন্ট নেই? <Link href="/register" className="text-primary font-bold hover:underline">নতুন অ্যাকাউন্ট তৈরি করুন</Link>
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
}