"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import axios from "axios";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
    const { register, handleSubmit, control, watch, reset, setValue, getValues } = useForm();
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // লোকেশন স্টেট
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [cityCorporations, setCityCorporations] = useState([]);
    const [localBodies, setLocalBodies] = useState([]);

    // রেডিও বাটন স্টেট
    const [districtAreaType, setDistrictAreaType] = useState("");
    const [upazilaAreaType, setUpazilaAreaType] = useState("");

    // ওয়াচিং ফিল্ডস
    const selectedDivision = watch("location.divisionId");
    const selectedDistrict = watch("location.districtId");
    const selectedUpazila = watch("location.upazilaId");
    const selectedGender = watch("gender");
    const watchedProfessions = watch("profession") || [];
    const watchedDiseases = watch("healthConditions") || [];

    const commonProfessions = ["ছাত্র", "শিক্ষক", "কৃষক", "ব্যবসায়ী", "চাকরিজীবী", "ডাক্তার", "প্রবাসী", "অন্যান্য"];
    const commonDiseases = ["ডায়াবেটিস", "উচ্চ রক্তচাপ", "হাঁপানি", "হৃদরোগ", "কিডনি সমস্যা", "অন্যান্য"];

    // ১. বিভাগ লোড
    useEffect(() => {
        axios.get("http://localhost:5000/api/locations/divisions")
            .then(res => setDivisions(res.data));
    }, []);

    // ২. বিভাগ → জেলা
    useEffect(() => {
        if (selectedDivision) {
            setDistricts([]);
            setUpazilas([]);
            setLocalBodies([]);
            setValue("location.districtId", null);
            setValue("location.upazilaId", null);
            setValue("location.localBodyId", null);
            axios.get(`http://localhost:5000/api/locations/districts/${selectedDivision.value}`)
                .then(res => setDistricts(res.data));
        }
    }, [selectedDivision, setValue]);

    // ৩. জেলা → উপজেলা ও সিটি কর্পোরেশন
    useEffect(() => {
        if (selectedDistrict) {
            setUpazilas([]);
            setCityCorporations([]);
            setLocalBodies([]);
            setDistrictAreaType("");
            setUpazilaAreaType("");
            setValue("location.upazilaId", null);
            setValue("location.localBodyId", null);
            axios.get(`http://localhost:5000/api/locations/upazilas/${selectedDistrict.value}`)
                .then(res => setUpazilas(res.data));
            axios.get(`http://localhost:5000/api/locations/city-corporations/${selectedDistrict.value}`)
                .then(res => {
                    setCityCorporations(res.data);
                    if (res.data.length === 0) {
                        setDistrictAreaType("upazila");
                    }
                });
        }
    }, [selectedDistrict, setValue]);

    // // ৪. উপজেলা → ইউনিয়ন/পৌরসভা
    // useEffect(() => {
    //     if (selectedUpazila && selectedDistrict) {
    //         setLocalBodies([]);
    //         setValue("location.localBodyId", null);
    //         axios.get(`http://localhost:5000/api/locations/local-bodies/${selectedUpazila.value}/${selectedDistrict.value}`)
    //             .then(res => setLocalBodies(res.data));
    //     } else {
    //         setLocalBodies([]);
    //     }
    // }, [selectedUpazila, selectedDistrict, setValue]);

    // ৪. উপজেলা পরিবর্তন -> ইউনিয়ন/পৌরসভা লোড
    useEffect(() => {
        if (selectedUpazila && selectedUpazila.value) {
            setUpazilaAreaType("");
            setValue("location.localBodyId", null);
            axios.get(`http://localhost:5000/api/locations/local-bodies/${selectedUpazila.value}`)
                .then(res => {
                    setLocalBodies(res.data);
                    const pourashavas = res.data.filter(lb => lb.type === 'Pourashava');
                    if (pourashavas.length === 0) {
                        setUpazilaAreaType("union");
                    }
                })
                .catch(() => setLocalBodies([]));
        } else {
            setLocalBodies([]);
        }
    }, [selectedUpazila, setValue]);

    // রেডিও বাটন চেঞ্জ হ্যান্ডলার
    const handleDistrictAreaTypeChange = (e) => {
        const value = e.target.value;
        setDistrictAreaType(value);
        setValue("location.upazilaId", null);
        setUpazilaAreaType("");
        
        if (value === "cityCorporation" && cityCorporations.length === 1) {
            setValue("location.localBodyId", { value: cityCorporations[0]._id, label: cityCorporations[0].name });
        } else {
            setValue("location.localBodyId", null);
        }
    };

    const handleUpazilaAreaTypeChange = (e) => {
        const value = e.target.value;
        setUpazilaAreaType(value);
        
        if (value === "pourashava") {
            const pourashavas = localBodies.filter(lb => lb.type === 'Pourashava');
            if (pourashavas.length === 1) {
                setValue("location.localBodyId", { value: pourashavas[0]._id, label: pourashavas[0].name });
            } else {
                setValue("location.localBodyId", null);
            }
        } else {
            setValue("location.localBodyId", null);
        }
    };

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

            // react-select থেকে শুধু value (id) বের করে পাঠানো
            const payload = {
                ...data,
                profession: finalProfessions,
                healthConditions: finalHealth,
                location: {
    divisionId: data.location.divisionId?.value,
    districtId: data.location.districtId?.value,
    upazilaId: data.location.upazilaId?.value,
    localBodyId: data.location.localBodyId?.value,
    wardId: data.location.wardId,
    areaName: data.location.areaName,
}
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

    // react-select custom styles (DaisyUI এর সাথে মিলিয়ে)
    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: "3rem",
            borderRadius: "0.5rem",
            borderColor: "#d1d5db",
            boxShadow: "none",
            "&:hover": { borderColor: "#a3a3a3" }
        }),
        placeholder: (base) => ({ ...base, color: "#9ca3af" }),
        menu: (base) => ({ ...base, zIndex: 50 }),
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

                            {/* --- ব্যক্তিগত তথ্য --- */}
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

                            {/* --- লোকেশন তথ্য (react-select) --- */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold border-b pb-2 text-gray-700">ঠিকানা / লোকেশন</h3>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">বিভাগ *</span></label>
                                    <Controller
                                        name="location.divisionId"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                instanceId="division-select"
                                                options={divisions.map(d => ({ value: d._id, label: d.name }))}
                                                isSearchable
                                                placeholder="বিভাগ নির্বাচন করুন"
                                                styles={selectStyles}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">জেলা *</span></label>
                                    <Controller
                                        name="location.districtId"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                instanceId="district-select"
                                                options={districts.map(d => ({ value: d._id, label: d.name }))}
                                                isSearchable
                                                placeholder="জেলা নির্বাচন করুন"
                                                isDisabled={!selectedDivision}
                                                styles={selectStyles}
                                            />
                                        )}
                                    />
                                </div>

                                {selectedDistrict && (
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-medium">এলাকার ধরন *</span></label>
                                        <div className="flex gap-6">
                                            <label className={`cursor-pointer flex items-center gap-2 ${cityCorporations.length === 0 ? 'opacity-50' : ''}`}>
                                                <input type="radio" name="districtAreaType" value="cityCorporation" checked={districtAreaType === "cityCorporation"} onChange={handleDistrictAreaTypeChange} className="radio radio-primary radio-sm" disabled={cityCorporations.length === 0} />
                                                <span className="font-medium">সিটি কর্পোরেশন {cityCorporations.length === 0 && <span className="text-xs text-error ml-1">(নেই)</span>}</span>
                                            </label>
                                            <label className="cursor-pointer flex items-center gap-2">
                                                <input type="radio" name="districtAreaType" value="upazila" checked={districtAreaType === "upazila"} onChange={handleDistrictAreaTypeChange} className="radio radio-primary radio-sm" />
                                                <span className="font-medium">উপজেলা</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {districtAreaType === "cityCorporation" && (
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-medium">সিটি কর্পোরেশন *</span></label>
                                        <Controller
                                            name="location.localBodyId"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    instanceId="city-corporation-select"
                                                    options={cityCorporations.map(c => ({ value: c._id, label: c.name }))}
                                                    isSearchable
                                                    placeholder="সিটি কর্পোরেশন নির্বাচন করুন"
                                                    styles={selectStyles}
                                                />
                                            )}
                                        />
                                    </div>
                                )}

                                {districtAreaType === "upazila" && (
                                    <>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-medium">উপজেলা *</span></label>
                                            <Controller
                                                name="location.upazilaId"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        instanceId="upazila-select"
                                                        options={upazilas.map(u => ({ value: u._id, label: u.name }))}
                                                        isSearchable
                                                        placeholder="উপজেলা নির্বাচন করুন"
                                                        styles={selectStyles}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {selectedUpazila && (
                                            <div className="form-control mt-2">
                                                <label className="label"><span className="label-text font-medium">পৌরসভা নাকি ইউনিয়ন? *</span></label>
                                                <div className="flex gap-6">
                                                    <label className={`cursor-pointer flex items-center gap-2 ${localBodies.filter(lb => lb.type === 'Pourashava').length === 0 ? 'opacity-50' : ''}`}>
                                                        <input type="radio" name="upazilaAreaType" value="pourashava" checked={upazilaAreaType === "pourashava"} onChange={handleUpazilaAreaTypeChange} className="radio radio-primary radio-sm" disabled={localBodies.filter(lb => lb.type === 'Pourashava').length === 0} />
                                                        <span className="font-medium">পৌরসভা {localBodies.filter(lb => lb.type === 'Pourashava').length === 0 && <span className="text-xs text-error ml-1">(নেই)</span>}</span>
                                                    </label>
                                                    <label className="cursor-pointer flex items-center gap-2">
                                                        <input type="radio" name="upazilaAreaType" value="union" checked={upazilaAreaType === "union"} onChange={handleUpazilaAreaTypeChange} className="radio radio-primary radio-sm" />
                                                        <span className="font-medium">ইউনিয়ন</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {upazilaAreaType === "pourashava" && (
                                            <div className="form-control">
                                                <label className="label"><span className="label-text font-medium">পৌরসভা *</span></label>
                                                {localBodies.filter(lb => lb.type === 'Pourashava').length === 0 ? (
                                                    <div className="text-red-500 mt-2 text-sm font-medium">এই উপজেলার কোনো পৌরসভা নেই।</div>
                                                ) : (
                                                    <Controller
                                                        name="location.localBodyId"
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Select
                                                                {...field}
                                                                instanceId="pourashava-select"
                                                                options={localBodies.filter(lb => lb.type === 'Pourashava').map(lb => ({ value: lb._id, label: lb.name }))}
                                                                isSearchable
                                                                placeholder="পৌরসভা নির্বাচন করুন"
                                                                styles={selectStyles}
                                                            />
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {upazilaAreaType === "union" && (
                                            <div className="form-control">
                                                <label className="label"><span className="label-text font-medium">ইউনিয়ন *</span></label>
                                                <Controller
                                                    name="location.localBodyId"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            instanceId="union-select"
                                                            options={localBodies.filter(lb => lb.type === 'Union').map(lb => ({ value: lb._id, label: lb.name }))}
                                                            isSearchable
                                                            placeholder="ইউনিয়ন নির্বাচন করুন"
                                                            styles={selectStyles}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">ওয়ার্ড নাম্বার *</span></label>
                                    <input {...register("location.wardId", { required: true })} className="input input-bordered w-full" placeholder="ওয়ার্ড নাম্বার" />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">গ্রাম বা মহল্লার নাম *</span></label>
                                    <input {...register("location.areaName", { required: true })} className="input input-bordered w-full" placeholder="গ্রাম বা মহল্লার নাম" />
                                </div>
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