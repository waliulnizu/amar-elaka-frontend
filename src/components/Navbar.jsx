"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    FaBars, FaTimes, FaHome, FaSearch, FaUserAlt, 
    FaSignInAlt, FaUserPlus, FaNewspaper, FaHandsHelping, FaTint 
} from "react-icons/fa";
import api from "@/services/api";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/users/profile');
                if (res.data.success) {
                    setIsLoggedIn(true);
                }
            } catch (error) {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await api.post('/users/logout');
            setIsLoggedIn(false);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // কমিউনিটির সব ধরনের কাজের জন্য ডাইনামিক লিংক
    const navLinks = [
        { name: "হোম", path: "/", icon: <FaHome /> },
        { name: "কমিউনিটি ফিড", path: "/posts", icon: <FaNewspaper /> }, // ব্যবসা, জন্ম-মৃত্যু, সমস্যার পোস্টের জন্য
        { name: "রক্তের আবেদন", path: "/blood-donate", icon: <FaTint className="text-red-500" /> }, // রক্তের রিকোয়েস্টের জন্য
        { name: "রক্তদাতা", path: "/search-donors", icon: <FaSearch /> }, // রক্তের প্রয়োজনের জন্য
        { name: "সেবা ও সাহায্য", path: "/services", icon: <FaHandsHelping /> }, // অন্যান্য হেল্পের জন্য
    ];

    return (
        <div className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-4 md:px-8">
            {/* Left Side - Brand Logo */}
            <div className="navbar-start w-auto md:w-1/4">
                <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-primary">
                    <span className="text-3xl">🤝</span>
                    আমার<span className="text-gray-800">এলাকা</span>
                </Link>
            </div>

            {/* Center - Desktop Menu */}
            <div className="navbar-center hidden lg:flex w-auto md:w-2/4 justify-center">
                <ul className="menu menu-horizontal px-1 gap-2">
                    {navLinks.map((link) => (
                        <li key={link.path}>
                            <Link 
                                href={link.path} 
                                className={`font-medium rounded-lg transition-colors flex items-center gap-2 px-4 py-2 ${
                                    pathname === link.path 
                                    ? "bg-primary text-white shadow-sm" 
                                    : "hover:text-primary hover:bg-base-200"
                                }`}
                            >
                                {link.icon} {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Side - Auth Buttons & Mobile Menu Toggle */}
            <div className="navbar-end w-auto md:w-1/4 flex justify-end gap-2 ml-auto">
                {/* Desktop Auth Buttons */}
                <div className="hidden lg:flex gap-3 items-center">
                    {isLoggedIn ? (
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar ring ring-primary ring-offset-base-100 ring-offset-2">
                                <div className="w-10 rounded-full bg-base-200 flex items-center justify-center">
                                    <FaUserAlt className="w-5 h-5 text-primary mt-2.5 ml-2.5" />
                                </div>
                            </label>
                            <ul tabIndex={0} className="mt-4 z-[1] p-3 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-56 border border-base-200">
                                <li className="mb-1">
                                    <Link href="/profile" className="justify-between hover:bg-primary hover:text-white font-medium p-3">
                                        আমার প্রোফাইল
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/requests" className="justify-between hover:bg-primary hover:text-white font-medium p-3">
                                        রক্তের আবেদনসমূহ
                                    </Link>
                                </li>
                                <li>
                                    <a onClick={handleLogout} className="text-error hover:bg-error hover:text-white font-bold p-3">
                                        লগআউট
                                    </a>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-outline btn-primary btn-sm px-6 rounded-full">
                                <FaSignInAlt /> লগইন
                            </Link>
                            <Link href="/register" className="btn btn-primary btn-sm text-white px-6 rounded-full shadow-md">
                                <FaUserPlus /> রেজিস্ট্রেশন
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="btn btn-ghost btn-circle lg:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <FaTimes size={24} className="text-error" /> : <FaBars size={24} className="text-primary" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-base-100 shadow-2xl lg:hidden flex flex-col p-4 gap-4 border-t border-base-200 rounded-b-2xl">
                    <ul className="menu menu-vertical p-0 gap-2">
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link 
                                    href={link.path} 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`font-medium p-3 rounded-xl ${
                                        pathname === link.path 
                                        ? "bg-primary text-white shadow-md" 
                                        : "hover:bg-base-200"
                                    }`}
                                >
                                    {link.icon} {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    
                    <div className="divider my-1"></div>

                    {isLoggedIn ? (
                        <div className="flex flex-col gap-3">
                            <Link href="/profile" className="btn btn-outline btn-primary w-full justify-start rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                                <FaUserAlt /> আমার প্রোফাইল
                            </Link>
                            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="btn btn-error text-white w-full justify-start rounded-xl">
                                <FaSignInAlt className="rotate-180" /> লগআউট
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link href="/login" className="btn btn-outline btn-primary w-full justify-center rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                                <FaSignInAlt /> লগইন
                            </Link>
                            <Link href="/register" className="btn btn-primary text-white w-full justify-center rounded-xl shadow-md" onClick={() => setIsMobileMenuOpen(false)}>
                                <FaUserPlus /> রেজিস্ট্রেশন
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}