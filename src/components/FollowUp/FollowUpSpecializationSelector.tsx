"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Stethoscope } from "lucide-react";

interface Specialization {
  specialization: string;
  specialization_id: number;
}

export const FollowUpSpecializationSelector = ({
  specializations,
  nextStep,
  selectedSpecialization,
  setSelectedSpecialization,
}: {
  specializations: Specialization[] | undefined;
  nextStep: () => void;
  selectedSpecialization: Specialization | null;
  setSelectedSpecialization: React.Dispatch<
    React.SetStateAction<Specialization | null>
  >;
}) => {
  
  const selectedSpec =
    specializations &&
    specializations?.find(
      (s) => s.specialization_id === selectedSpecialization?.specialization_id
    );

  return !specializations ? null : (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center shadow-md">
          <Stethoscope className="h-7 w-7 text-blue-600" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-900">
          Choose Your Specialization
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Please select the specialization for your follow-up appointment
        </p>
      </div>

      <div
        className={`grid gap-4 ${
          specializations.length === 1
            ? "grid-cols-1"
            : specializations.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {specializations.map((spec) => (
          <motion.button
            key={spec.specialization_id}
            className={`relative p-5 rounded-xl border shadow-sm transition-all duration-200 text-center cursor-pointer outline-0 group
              ${
                selectedSpecialization?.specialization_id ===
                spec.specialization_id
                  ? "border-[#592668] bg-blue-50  "
                  : "border-gray-300 "
              }`}
            onClick={() => setSelectedSpecialization(spec)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="font-medium text-gray-800 text-lg">
              {spec.specialization}
            </span>

            {selectedSpecialization?.specialization_id ===
              spec.specialization_id && (
              <motion.div
                className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1 shadow-md"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        <motion.div
          className="mt-10 border-t pt-6 border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center">
              <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Selected</p>
                <p className="text-base font-semibold text-gray-800">
                  {selectedSpec?.specialization ?? "Not selected"}
                </p>
              </div>
            </div>

            <motion.button
              disabled={!selectedSpec}
              className="px-6 py-3 bg-[#592668] cursor-pointer text-white rounded-xl font-semibold shadow-lg transition-all w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
            >
              Confirm Follow-Up Booking
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
