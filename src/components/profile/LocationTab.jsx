import { motion } from 'framer-motion';

export default function LocationTab({ location }) {
    if (!location) {
        return (
            <div className="p-8 text-center text-base-content/50">
                <p>কোনো ঠিকানার তথ্য পাওয়া যায়নি।</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-base-100 rounded-xl shadow-sm border border-base-200"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-base-content">বর্তমান ঠিকানা</h3>
                <button className="btn btn-outline btn-primary btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    ঠিকানা পরিবর্তন করুন
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-base-200/50 p-4 rounded-lg">
                    <p className="text-sm text-base-content/60 mb-1">বিভাগ</p>
                    <p className="font-semibold text-lg">{location.divisionName || 'N/A'}</p>
                </div>
                
                <div className="bg-base-200/50 p-4 rounded-lg">
                    <p className="text-sm text-base-content/60 mb-1">জেলা</p>
                    <p className="font-semibold text-lg">{location.districtName || 'N/A'}</p>
                </div>

                <div className="bg-base-200/50 p-4 rounded-lg">
                    <p className="text-sm text-base-content/60 mb-1">উপজেলা / সিটি কর্পোরেশন</p>
                    <p className="font-semibold text-lg">{location.upazilaName || 'N/A'}</p>
                </div>

                <div className="bg-base-200/50 p-4 rounded-lg">
                    <p className="text-sm text-base-content/60 mb-1">পৌরসভা / ইউনিয়ন</p>
                    <p className="font-semibold text-lg">
                        {location.localBodyName || 'N/A'} 
                        {location.localBodyType && <span className="text-xs ml-2 badge badge-ghost">{location.localBodyType}</span>}
                    </p>
                </div>

                <div className="bg-base-200/50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-base-content/60 mb-1">গ্রাম / পাড়া / মহল্লা</p>
                    <p className="font-semibold text-lg">{location.areaName || 'N/A'}</p>
                </div>
            </div>
        </motion.div>
    );
}
