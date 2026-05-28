// frontend/src/app/register/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
    const { register, handleSubmit, watch, reset, setValue, getValues } = useForm();
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);

    const [divisions, setDivisions] = useState([]);
    const [districtsData, setDistrictsData] = useState([]);
    const [upazilas, setUpazilas] = useState([]);

    const selectedDivision = watch("location.division");
    const selectedDistrict = watch("location.district");
    const selectedGender = watch("gender");
    const selectedAreaType = watch("location.areaType");

    const watchedProfessions = watch("profession") || [];
    const watchedDiseases = watch("healthConditions") || [];

    const commonProfessions = ["ছাত্র", "শিক্ষক", "কৃষক", "ব্যবসায়ী", "চাকরিজীবী", "ডাক্তার", "প্রবাসী", "অন্যান্য"];
    const commonDiseases = ["ডায়াবেটিস", "উচ্চ রক্তচাপ", "হাঁপানি", "হৃদরোগ", "কিডনি সমস্যা", "অন্যান্য"];

    useEffect(() => {
        axios.get("https://bdapis.com/api/v1.1/divisions")
            .then(res => setDivisions(res.data.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (selectedDivision) {
            axios.get(`https://bdapis.com/api/v1.1/division/${selectedDivision.toLowerCase()}`)
                .then(res => {
                    setDistrictsData(res.data.data);
                    setUpazilas([]);
                    setValue("location.district", "");
                    setValue("location.upazila", "");
                })
                .catch(err => console.error(err));
        }
    }, [selectedDivision, setValue]);

    useEffect(() => {
        if (selectedDistrict) {
            const targetDistrict = districtsData.find(d => d.district === selectedDistrict);
            if (targetDistrict) {
                const foundUpazilas = targetDistrict.upazilla || targetDistrict.upazilas || [];
                setUpazilas(foundUpazilas);
            }
            setValue("location.upazila", "");
        }
    }, [selectedDistrict, districtsData, setValue]);

    const handleSameAsMobile = (e) => {
        if (e.target.checked) {
            const currentPhone = getValues("phone");
            if (currentPhone) setValue("whatsapp", currentPhone);
        } else {
            setValue("whatsapp", "");
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        if (data.gender === 'পুরুষ' && !data.phone) {
            setMessage({ type: "error", text: "পুরুষদের জন্য মোবাইল নাম্বার দেওয়া বাধ্যতামূলক!" });
            setIsLoading(false);
            return; 
        }
        if (data.gender === 'নারী' && !data.phone && !data.email) {
            setMessage({ type: "error", text: "নারীদের ক্ষেত্রে মোবাইল নাম্বার অথবা ইমেইল— যেকোনো একটি অবশ্যই দিতে হবে!" });
            setIsLoading(false);
            return;
        }

        try {
            let finalProfessions = [...data.profession];
            if (finalProfessions.includes("অন্যান্য") && data.otherProfession) {
                finalProfessions = finalProfessions.filter(p => p !== "অন্যান্য");
                finalProfessions.push(data.otherProfession);
            }

            let finalHealth = data.healthConditions ? [...data.healthConditions] : [];
            if (finalHealth.includes("অন্যান্য") && data.otherDisease) {
                finalHealth = finalHealth.filter(d => d !== "অন্যান্য");
                finalHealth.push(data.otherDisease);
            }

            delete data.otherProfession;
            delete data.otherDisease;

            const payload = {
                ...data,
                profession: finalProfessions,
                healthConditions: finalHealth
            };

            const response = await axios.post("http://localhost:5000/api/users/register", payload);
            setMessage({ type: "success", text: response.data.message });
            reset();
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Registration failed. Try again!"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 py-10 px-4">
            <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="text-3xl font-bold text-center text-primary mb-6">নতুন মেম্বার রেজিস্ট্রেশন</h2>

                    {message.text && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4 text-white`}>
                            <span>{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* --- পার্সোনাল ইনফরমেশন --- */}
                            <div className="space-y-4 md:border-r md:pr-4">
                                <h3 className="text-xl font-semibold border-b pb-2 text-gray-700">ব্যক্তিগত তথ্য</h3>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">পুরো নাম *</span></label>
                                    <input type="text" {...register("name", { required: true })} className="input input-bordered w-full" placeholder="আপনার নাম" />
                                </div>

                                <div className="form-control mt-2">
                                    <label className="label"><span className="label-text font-medium">লিঙ্গ (Gender) *</span></label>
                                    <div className="flex gap-6">
                                        <label className="cursor-pointer flex items-center gap-2">
                                            <input type="radio" value="পুরুষ" {...register("gender", { required: true })} className="radio radio-primary radio-sm" />
                                            <span className="font-medium">পুরুষ</span>
                                        </label>
                                        <label className="cursor-pointer flex items-center gap-2">
                                            <input type="radio" value="নারী" {...register("gender", { required: true })} className="radio radio-primary radio-sm" />
                                            <span className="font-medium">নারী</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">
                                            মোবাইল নাম্বার <span className="text-error">{selectedGender === 'পুরুষ' ? '*' : ''}</span>
                                            {selectedGender === 'নারী' && <span className="text-sm font-normal text-gray-500 ml-1">(ঐচ্ছিক, যদি ইমেইল দেন)</span>}
                                        </span>
                                    </label>
                                    <input type="text" {...register("phone")} className="input input-bordered w-full" placeholder="017........" />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">হোয়াটসঅ্যাপ (ঐচ্ছিক)</span>
                                        <label className="cursor-pointer flex items-center gap-2">
                                            <input type="checkbox" onChange={handleSameAsMobile} className="checkbox checkbox-xs" />
                                            <span className="label-text text-xs text-gray-500">মোবাইল নাম্বারের মতো একই</span>
                                        </label>
                                    </label>
                                    <input type="text" {...register("whatsapp")} className="input input-bordered w-full" placeholder="017........" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-medium">ইমেইল (ঐচ্ছিক)</span></label>
                                        <input type="email" {...register("email")} className="input input-bordered w-full" placeholder="example@mail.com" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-medium">রক্তের গ্রুপ *</span></label>
                                        {/* Error fix: প্লেসহোল্ডারে disabled যুক্ত করা হয়েছে */}
                                        <select {...register("bloodGroup", { required: true })} defaultValue="" className="select select-bordered select-md w-full">
                                            <option value="" disabled>নির্বাচন করুন</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">পাসওয়ার্ড *</span></label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            {...register("password", { required: true, minLength: 6 })} 
                                            className="input input-bordered w-full pr-12" 
                                            placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন" 
                                        />
                                        <button 
                                            type="button"
                                            className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-primary transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-control mt-2">
                                    <label className="label"><span className="label-text font-medium">পেশা (একাধিক নির্বাচন করা যাবে) *</span></label>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        {commonProfessions.map((prof) => (
                                            <label key={prof} className="cursor-pointer label justify-start gap-2">
                                                <input type="checkbox" value={prof} {...register("profession", { required: true })} className="checkbox checkbox-sm checkbox-primary" />
                                                <span className="label-text text-sm">{prof}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {watchedProfessions.includes("অন্যান্য") && (
                                        <input type="text" {...register("otherProfession")} className="input input-bordered input-sm w-full mt-2" placeholder="আপনার পেশা টাইপ করুন" />
                                    )}
                                </div>

                                <div className="form-control mt-2">
                                    <label className="label"><span className="label-text font-medium">রোগ বা স্বাস্থ্যগত সমস্যা (ঐচ্ছিক)</span></label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        {commonDiseases.map((disease) => (
                                            <label key={disease} className="cursor-pointer label justify-start gap-2">
                                                <input type="checkbox" value={disease} {...register("healthConditions")} className="checkbox checkbox-sm checkbox-primary" />
                                                <span className="label-text text-sm">{disease}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {watchedDiseases.includes("অন্যান্য") && (
                                        <input type="text" {...register("otherDisease")} className="input input-bordered input-sm w-full mt-2" placeholder="রোগের নাম টাইপ করুন (ঐচ্ছিক)" />
                                    )}
                                </div>

                                <div className="form-control flex-row items-center gap-3 mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <input type="checkbox" {...register("isLookingForJob")} className="checkbox checkbox-primary" />
                                    <span className="label-text font-medium text-blue-900">আমি বর্তমানে চাকরি বা কাজের সন্ধানে আছি</span>
                                </div>
                            </div>

                            {/* --- লোকেশন ইনফরমেশন --- */}
                            <div className="space-y-4 md:pl-4">
                                <h3 className="text-xl font-semibold border-b pb-2 text-gray-700">ঠিকানা / লোকেশন</h3>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">বিভাগ *</span></label>
                                    {/* Error fix: প্লেসহোল্ডারে disabled যুক্ত করা হয়েছে */}
                                    <select {...register("location.division", { required: true })} defaultValue="" className="select select-bordered select-md w-full">
                                        <option value="" disabled>বিভাগ নির্বাচন করুন</option>
                                        {divisions.map(div => <option key={div.division} value={div.division}>{div.division}</option>)}
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">জেলা *</span></label>
                                    <select {...register("location.district", { required: true })} defaultValue="" className="select select-bordered select-md w-full" disabled={!selectedDivision}>
                                        <option value="" disabled>জেলা নির্বাচন করুন</option>
                                        {districtsData.map(dist => <option key={dist.district} value={dist.district}>{dist.district}</option>)}
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">উপজেলা / থানা *</span></label>
                                    <select {...register("location.upazila", { required: true })} defaultValue="" className="select select-bordered select-md w-full" disabled={!selectedDistrict}>
                                        <option value="" disabled>উপজেলা নির্বাচন করুন</option>
                                        {(upazilas || []).map((upz) => <option key={upz} value={upz}>{upz}</option>)}
                                    </select>
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label"><span className="label-text font-medium text-amber-600">এলাকার ধরন *</span></label>
                                    {/* Error fix: প্লেসহোল্ডারে disabled যুক্ত করা হয়েছে */}
                                    <select {...register("location.areaType", { required: true })} defaultValue="" className="select select-bordered select-md w-full border-amber-300">
                                        <option value="" disabled>পৌরসভা নাকি ইউনিয়ন?</option>
                                        <option value="পৌরসভা">পৌরসভা</option>
                                        <option value="ইউনিয়ন">ইউনিয়ন</option>
                                    </select>
                                </div>

                                {selectedAreaType && (
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 space-y-4 animate-fade-in">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-medium">{selectedAreaType} এর নাম * (ইংরেজিতে টাইপ করুন)</span>
                                            </label>
                                            <input type="text" {...register("location.unionOrPourashova", { required: true })} className="input input-bordered w-full bg-white" placeholder={`Type ${selectedAreaType === 'পৌরসভা' ? 'Pourashova' : 'Union'} name`} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text font-medium">{selectedAreaType} ওয়ার্ড নাম্বার *</span>
                                                </label>
                                                <input type="text" {...register("location.ward", { required: true })} className="input input-bordered w-full bg-white" placeholder="e.g. 05" />
                                            </div>
                                            <div className="form-control">
                                                <label className="label"><span className="label-text font-medium">গ্রাম / মহল্লা *</span></label>
                                                <input type="text" {...register("location.gram", { required: true })} className="input input-bordered w-full bg-white" placeholder="Type village name" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="divider my-2"></div>

                        <div className="form-control mt-4">
                            <button type="submit" className="btn btn-primary w-full text-white text-lg" disabled={isLoading}>
                                {isLoading ? <span className="loading loading-spinner"></span> : "অ্যাকাউন্ট তৈরি করুন"}
                            </button>
                        </div>
                        
                        <p className="text-center mt-4 pb-4">
                            আগেই অ্যাকাউন্ট থাকলে? <Link href="/login" className="text-primary font-bold hover:underline">লগিন করুন</Link>
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
}