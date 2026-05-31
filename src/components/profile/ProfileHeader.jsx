import { useRef } from 'react';
import { motion } from 'framer-motion';

export default function ProfileHeader({ user, isUploading, onImageUpload }) {
    const fileInputRef = useRef(null);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-base-100 shadow-xl rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
            {/* Background decorative blob */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl"></div>

            <div className="relative group">
                <div className={`w-32 h-32 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100 overflow-hidden bg-base-200 flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isUploading ? 'opacity-50' : ''}`}>
                    {isUploading ? (
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    ) : user?.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-5xl font-bold text-base-content/30">{user?.name?.charAt(0)}</span>
                    )}
                </div>
                
                <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary-focus p-2 rounded-full text-white shadow-lg transition-all transform hover:scale-110 tooltip tooltip-right"
                    data-tip="ছবি পরিবর্তন করুন"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
            </div>

            <div className="text-center md:text-left z-10">
                <h1 className="text-3xl font-bold text-base-content">{user?.name}</h1>
                <p className="text-base-content/60 font-medium mt-1">{user?.profession?.join(", ") || "পেশা দেওয়া হয়নি"}</p>
                
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                    <div className="badge badge-error gap-1 p-3 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {user?.bloodGroup || "N/A"}
                    </div>
                    {user?.phone && (
                        <div className="badge badge-ghost gap-1 p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {user.phone}
                        </div>
                    )}
                    {user?.email && (
                        <div className="badge badge-ghost gap-1 p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {user.email}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
