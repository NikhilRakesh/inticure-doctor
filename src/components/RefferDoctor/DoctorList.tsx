import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "../../features/Auth/authSlice";
import { baseurl, token_api } from "../../lib/api";
import { DoctorActionModal } from "./DoctorActionModal";
import { useState } from "react";

interface LanguageInfo {
  value: string;
  priority: number;
}

interface GenderInfo {
  value: string;
  priority: number;
}

interface SessionPreferences {
  specialization_id: number;
  language_info: LanguageInfo;
  gender_info: GenderInfo;
  date: string;
  is_couple: boolean;
  appointment_id: string | null;
}

interface DoctorListProbs {
  sessionPreferences: SessionPreferences;
  appointment_id: string | null;
  selectedSpecialization: number;
  is_couple: boolean;
}

interface Doctor {
  id: number;
  name: string;
  gender: string;
  bio: string;
  flag: string;
  profile_pic: string;
  specializations: string[];
  languages: string[];
}

interface DoctorMatchResponse {
  available_doctors: Doctor[];
  gender_matched: boolean;
  language_matched: boolean;
}

export const DoctorList = ({
  sessionPreferences,
  appointment_id,
  selectedSpecialization,
  is_couple,
}: DoctorListProbs) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: doctors } = useQuery<DoctorMatchResponse>({
    queryKey: ["languages"],
    queryFn: () => {
      return token_api(accessToken)
        .post(`doctor/filter_doctors/`, sessionPreferences)
        .then((res) => res.data);
    },
  });

  const [selectedDocor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className=" min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors &&
            doctors?.available_doctors?.length > 0 &&
            doctors.available_doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 12px 28px -8px rgba(93, 45, 134, 0.25)",
                }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-300 shadow-md transition-all"
              >
                {/* Doctor Header */}
                <div className="p-6 flex items-center gap-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <div className="relative h-20 w-20 min-w-[80px] rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-[#6d2b8a]/30">
                    <img
                      src={baseurl + doctor.profile_pic}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate flex items-center gap-2">
                      {doctor.name}
                      <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                    </h2>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doctor.specializations.map((spec: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-purple-100 text-[#6d2b8a] rounded-md text-xs font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{doctor.flag}</p>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="p-6 space-y-4">
                  {/* Gender */}
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full bg-[#f3e8ff] text-[#6d2b8a] text-xs font-medium">
                      {doctor.gender}
                    </span>
                  </div>

                  {/* Bio */}
                  <div className="text-sm text-gray-700 line-clamp-3">
                    {doctor.bio}
                  </div>

                  {/* Languages */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-2 tracking-wide">
                      LANGUAGES
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((language: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Book Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsOpen(true);
                    }}
                    className="w-full py-2.5 cursor-pointer bg-gradient-to-r from-[#6d2b8a] to-[#9d4edd] hover:from-[#5a1e6b] hover:to-[#7d3c98] text-white rounded-lg font-medium transition-all shadow-sm"
                  >
                    Book Consultation
                  </motion.button>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
      {selectedDocor && (
        <DoctorActionModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedDoctor(null);
          }}
          appointment_id={appointment_id}
          doctor={selectedDocor}
          sessionPreferences={sessionPreferences}
          selectedSpecialization={selectedSpecialization}
          is_couple={is_couple}
        />
      )}
    </div>
  );
};
