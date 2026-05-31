import { useRef } from "react";
import Link from "next/link";

export default function ProfileCard({ user, onImageUpload, isUploading }) {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-base-100 shadow-xl rounded-xl p-6 flex flex-col items-center border border-base-300 sticky top-4">
      <div className="relative group mb-4">
        <div className={`w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 overflow-hidden bg-gray-200 flex items-center justify-center shadow-inner ${isUploading ? 'opacity-50' : ''}`}>
          {isUploading ? (
            <span className="loading loading-spinner loading-md text-primary"></span>
          ) : user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-gray-500">{user?.name?.charAt(0)}</span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full text-white shadow-md hover:scale-110 text-xs"
        >
          📷
        </button>
        <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
      </div>

      <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
      <p className="text-sm text-gray-400 mb-4">{user?.email}</p>

      <div className="w-full border-t pt-3 flex flex-col gap-2 text-sm">
        <p><strong>মোবাইল:</strong> {user?.phone || "দেওয়া হয়নি"}</p>
        <p><strong>রক্তের গ্রুপ:</strong> <span className="text-error font-bold">{user?.bloodGroup || "N/A"}</span></p>
        <p className="flex flex-col">
          <strong>ঠিকানা:</strong> 
          <span className="text-gray-500">
            {user?.location ? (
              <>
                {user.location.areaName && `${user.location.areaName}, `}
                {user.location.localBodyName && `${user.location.localBodyName}, `}
                {user.location.upazilaName && `${user.location.upazilaName}`}
              </>
            ) : (
              "ঠিকানা আপডেট করুন"
            )}
          </span>
        </p>
      </div>

      <div className="w-full border-t mt-4 pt-4">
        <Link href="/profile" className="btn btn-outline btn-primary btn-sm w-full">
          📍 প্রোফাইল ও ঠিকানা আপডেট
        </Link>
      </div>
    </div>
  );
}