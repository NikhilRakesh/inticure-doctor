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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900">
            Our Specialist Doctors
          </h1>
          <p className="text-gray-600 mt-2">
            Highly qualified professionals ready to assist you
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors &&
            doctors?.available_doctors?.length !== 0 &&
            doctors?.available_doctors?.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 transition-all shadow-md"
              >
                <div className="p-5 flex items-center gap-4 border-b border-gray-100">
                  <div className="relative h-20 w-20 min-w-[80px] rounded-full overflow-hidden border-2 border-[#6d2b8a]">
                    <img
                      src={baseurl + doctor.profile_pic}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {doctor.name}
                    </h2>
                    <p className="text-[#6d2b8a] text-sm font-medium truncate">
                      {doctor.specializations.join(", ")}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-gray-600 text-sm">
                        {doctor.flag}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#f3e8ff] text-[#6d2b8a] text-xs font-medium">
                      {doctor.gender}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs font-medium text-gray-500 mb-2">
                      LANGUAGES
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((language) => (
                        <span
                          key={language}
                          className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsOpen(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r cursor-pointer from-[#6d2b8a] to-[#9d4edd] hover:from-[#5a1e6b] hover:to-[#7d3c98] text-white rounded-lg font-medium transition-all"
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
