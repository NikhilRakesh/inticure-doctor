"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "../../lib/api";

type Specializations = {
  specialization_id: number;
  specialization: string;
};

export const SpecializationSelector = ({
  onSelect,
  selectedSpecialization,
  is_couple,
  nextStep,
}: {
  onSelect: (spec: number) => void;
  selectedSpecialization: number;
  is_couple: boolean;
  nextStep: () => void;
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: specialties, isLoading } = useQuery({
    queryKey: ["specializations"],
    queryFn: () => {
      return api
        .get<Specializations[]>(
          `doctor/specializations/?is_couple=${is_couple}`
        )
        .then((res) => res.data);
    },
  });

  const handleSelect = (id: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelected(id);
    setTimeout(() => {
      onSelect(id);
      setIsAnimating(false);
    }, 500);
  };

  return isLoading ? null : (
    <div className="fixed inset-0 bg-gradient-to-br from-[#f9f5ff] to-white  flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl  overflow-hidden"
      >
        {/* Header */}
        <div className=" border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium text-gray-900">
                Select Medical Specialization
              </h2>
              <p className="text-gray-500 mt-1">
                Choose your required field of expertise
              </p>
            </div>
          </div>
        </div>

        {/* Specialization Grid */}
        <div className="p-6">
          {specialties && specialties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500">No matching specializations found</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {specialties &&
                specialties.map((spec, index) => (
                  <motion.div
                    key={spec.specialization_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(spec.specialization_id)}
                    className={`relative p-5 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedSpecialization === spec.specialization_id
                        ? "bg-[#6d2b8a] text-white shadow-md"
                        : "bg-white hover:bg-gray-50 text-gray-800 shadow-sm"
                    } border border-gray-100`}
                  >
                    <h3 className="font-medium text-lg">
                      {spec.specialization}
                    </h3>
                    {selected === spec.specialization_id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                      >
                        <svg
                          className="w-3 h-3 text-[#6d2b8a]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    )}
                    <motion.div
                      className={`absolute bottom-0 left-0 h-1 rounded-b-lg ${
                        selected === spec.specialization_id
                          ? "bg-white/50"
                          : "bg-[#6d2b8a]"
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          selected === spec.specialization_id ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                ))}
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <button
            disabled={isAnimating || selectedSpecialization === 0}
            onClick={nextStep}
            className={`w-full py-3 px-6 rounded-lg cursor-pointer text-white text-sm font-medium transition-all duration-300 
            bg-[#8a4baf] hover:bg-[#7a3a9f]
            ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
