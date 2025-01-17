import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, ChevronDown, ChevronUp } from 'lucide-react';
import PasswordResetForm from "../components/PasswordResetForm";

const ProfilePage = () => {
  const { userProfile, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await updateProfile(formData);
      setSelectedImg(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-100">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-gray-800">Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || userProfile.avatar || "/avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition-all duration-300 hover:scale-105"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-blue-500 hover:bg-blue-600
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200 shadow-md
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-gray-100 rounded-lg border border-gray-200 font-medium">
                {userProfile?.name}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-gray-100 rounded-lg border border-gray-200 font-medium">
                {userProfile?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">{userProfile.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Account Status</span>
                <span className="text-green-500 font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowPasswordReset(!showPasswordReset)}
              className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg text-left font-medium text-gray-700 hover:bg-gray-200 transition-all duration-200"
            >
              Change Password
              {showPasswordReset ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {showPasswordReset && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <PasswordResetForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

