import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Pencil } from "lucide-react";
import { useState } from "react";
import { baseurl, get_api_form } from "../../lib/api";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../features/Auth/authSlice";
import axios from "axios";
import { useToast } from "../../context/ToastProvider";

interface DoctorInfo {
  name: string;
  specialization: string;
  experience: string;
  profile_pic: string;
  email: string;
  bio: string;
  rating: number;
  salutaion: string;
  first_name: string;
  last_name: string;
}

interface EditDoctorProfileModalProps {
  onClose: () => void;
  doctorInfo: DoctorInfo;
}

export const EditDoctorProfileModal: React.FC<EditDoctorProfileModalProps> = ({
  onClose,
  doctorInfo,
}) => {
  const [profilePic, setProfilePic] = useState<string | null>(
    baseurl.replace(/\/$/, "") + doctorInfo?.profile_pic
  );
  const [formData, setFormData] = useState(doctorInfo);
  const [file, setFile] = useState<File | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { showToast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
      setFile(file);
    }
  };

  function handleEditProfile() {
    const payload: {
      salutation : string;
      first_name: string;
      last_name: string;
      doctor_bio: string;
      profile_pic?: File;
    } = {
      salutation : formData.salutaion,
      first_name: formData.first_name,
      last_name: formData.last_name,
      doctor_bio: formData.bio,
    };
    if (file instanceof File) {
      payload.profile_pic = file;
    }

    edit_profile.mutate(payload);
  }

  const edit_profile = useMutation({
    mutationKey: ["edit_profile"],
    mutationFn: (profileData: {
      salutation : string;
      first_name: string;
      last_name: string;
      doctor_bio: string;
      profile_pic?: File;
    }) =>
      get_api_form(accessToken)
        .patch("doctor/profile/", profileData)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Profile updated successfully.", "success");
      onClose();
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.error || "Something went wrong",
          "error"
        );
      } else {
        showToast("An unexpected error occurred", "error");
      }
    },
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Pencil className="h-5 w-5 text-[#582768]" />
              Edit Doctor Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {profilePic && (
                <img
                  src={profilePic}
                  alt="Doctor"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                />
              )}
              <label
                htmlFor="profilePic"
                className="absolute bottom-1 right-1 bg-[#582768] hover:bg-[#6d2b8a] text-white p-2 rounded-full cursor-pointer transition"
              >
                <Upload className="w-4 h-4" />
              </label>
              <input
                type="file"
                id="profilePic"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Upload your profile picture
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Salutation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salutation
              </label>
              <select
                value={formData.salutaion}
                onChange={(e) =>
                  setFormData({ ...formData, salutaion: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#582768]/40 transition"
              >
                <option>Dr.</option>
                <option>Mr.</option>
                <option>Ms.</option>
                <option>Mrs.</option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#582768]/40 transition"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#582768]/40 transition"
                placeholder="Enter last name"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#582768]/40 transition resize-none"
                placeholder="Write a short bio..."
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEditProfile}
              className="px-5 py-2 text-sm cursor-pointer font-medium rounded-lg bg-[#582768] text-white hover:bg-[#6d2b8a] transition"
            >
              Save Changes
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
