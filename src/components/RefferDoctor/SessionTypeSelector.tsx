import { motion } from "framer-motion";
import { User, Users } from "lucide-react";
import { useState } from "react";

export const SessionTypeSelector = ({
  setCouplesConsultation,
  nextStep,
}: {
  setCouplesConsultation: (value: boolean) => void;
  nextStep: () => void;
}) => {
  const [selectedType, setSelectedType] = useState<
    "individual" | "couples" | null
  >(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (type: "individual" | "couples") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedType(type);
    setTimeout(() => {
      setCouplesConsultation(type === "couples" ? true : false);
      setIsAnimating(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#f9f5ff] to-white flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-light text-[#1e0a2c] mb-3"
          >
            Select Session Type
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#6d2b8a]/80"
          >
            Choose the type of consultation patient need
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleSelect("individual")}
            className={`relative p-6 rounded-2xl bg-white border-2 cursor-pointer transition-all duration-300 ${
              selectedType === "individual"
                ? "border-[#8a4baf] shadow-lg"
                : "border-transparent hover:border-[#e9d5ff] shadow-md"
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="relative mb-5">
                <motion.div
                  animate={
                    selectedType === "individual"
                      ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#f3e8ff] flex items-center justify-center">
                    <User
                      className="h-8 w-8 text-[#8a4baf]"
                      strokeWidth={1.5}
                    />
                  </div>
                </motion.div>
                {selectedType === "individual" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#8a4baf] flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-white"
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
              </div>
              <h3 className="text-xl font-medium text-[#1e0a2c] mb-2">
                Individual
              </h3>
              <p className="text-[#6d2b8a]/80 text-center text-sm">
                One-on-one consultation with a specialist
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => handleSelect("couples")}
            className={`relative p-6 rounded-2xl bg-white border-2 cursor-pointer transition-all duration-300 ${
              selectedType === "couples"
                ? "border-[#d6779e] shadow-lg"
                : "border-transparent hover:border-[#fce7f3] shadow-md"
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="relative mb-5">
                <motion.div
                  animate={
                    selectedType === "couples"
                      ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#fce7f3] flex items-center justify-center">
                    <Users
                      className="h-8 w-8 text-[#d6779e]"
                      strokeWidth={1.5}
                    />
                  </div>
                </motion.div>
                {selectedType === "couples" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#d6779e] flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-white"
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
              </div>
              <h3 className="text-xl font-medium text-[#1e0a2c] mb-2">
                Couples
              </h3>
              <p className="text-[#6d2b8a]/80 text-center text-sm">
                Joint session for you and your partner
              </p>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <button
            disabled={isAnimating || !selectedType}
            onClick={nextStep}
            className={`w-full py-3 px-6 rounded-lg cursor-pointer text-white text-sm font-medium transition-all duration-300 ${
              selectedType === "individual"
                ? "bg-[#8a4baf] hover:bg-[#7a3a9f]"
                : "bg-[#d6779e] hover:bg-[#c6658e]"
            } ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
