"use client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const dropdown = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
  exit: { opacity: 0, y: -10 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  exit: { opacity: 0, scale: 0.95 },
};

interface LanguageItem {
  language: string;
}

export const PreferencePrioritySelector = ({
  onSubmit,
}: {
  onSubmit: (data: {
    language_info: { value: string; priority: number };
    gender_info: { value: string; priority: number };
  }) => void;
}) => {
  const [preferences, setPreferences] = useState({
    language_info: {
      value: "",
      priority: 2,
    },
    gender_info: {
      value: "",
      priority: 1,
    },
  });

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genderOptions = ["Male", "Female", "No Preference"];

  const handleContinue = () => {
    if (!preferences.gender_info.value || !preferences.language_info.value)
      return;
    setShowPriorityModal(true);
  };

  const handlePrioritySelect = (type: "gender" | "language") => {
    const newPreferences = { ...preferences };
    if (type === "gender") {
      newPreferences.gender_info.priority = 2;
      newPreferences.language_info.priority = 1;
    } else {
      newPreferences.language_info.priority = 2;
      newPreferences.gender_info.priority = 1;
    }
    setPreferences(newPreferences);
    setShowPriorityModal(false);
    submitPreferences(newPreferences);
  };

  const handleNoPriority = () => {
    const newPreferences = { ...preferences };
    newPreferences.gender_info.priority = 2;
    newPreferences.language_info.priority = 2;
    setPreferences(newPreferences);
    setShowPriorityModal(false);
    submitPreferences(newPreferences);
  };

  const submitPreferences = (prefs: typeof preferences) => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(prefs);
      setIsSubmitting(false);
    }, 800);
  };

  const { data: languages } = useQuery<LanguageItem[]>({
    queryKey: ["languages"],
    queryFn: () => {
      return api
        .get(`analysis/get_available_languages/`)
        .then((res) => res.data.languages);
    },
  });

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-[#f9f5ff] to-white flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-md w-full bg-white rounded-xl shadow-lg  border border-gray-100"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <div className="p-6 border-b border-gray-100">
          <motion.div variants={item}>
            <h1 className="text-2xl font-medium text-gray-800 mb-2">
              Doctor Preferences
            </h1>
            <p className="text-gray-500">
              We'll do our best to match your preferences
            </p>
          </motion.div>
        </div>

        <div className="p-6 space-y-6">
          <motion.div variants={item}>
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              Preferred doctor gender
            </h2>
            <div className="flex flex-col space-y-2">
              {genderOptions.map((gender) => (
                <motion.button
                  key={gender}
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      gender_info: {
                        ...preferences.gender_info,
                        value: gender,
                      },
                    })
                  }
                  className={`p-3 text-left cursor-pointer rounded-lg transition-colors ${
                    preferences.gender_info.value === gender
                      ? "bg-[#f0e6f5] text-[#592668] border border-[#d6779e]"
                      : "bg-white border border-gray-200 hover:border-[#d6779e]"
                  }`}
                  variants={item}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {gender}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              Preferred language
            </h2>
            <div className="relative">
              <motion.button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className={`w-full p-3 text-left rounded-lg border flex items-center cursor-pointer justify-between ${
                  preferences.language_info.value
                    ? "border-[#d6779e] bg-[#f0e6f5] text-[#592668]"
                    : "border-gray-200 hover:border-[#d6779e]"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {preferences.language_info.value || "Select language"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showLanguageDropdown ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {showLanguageDropdown && (
                  <motion.div
                    className="absolute bottom-full mb-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto overflow-x-hidden"
                    variants={dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {languages &&
                      languages.map((language, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            setPreferences({
                              ...preferences,
                              language_info: {
                                ...preferences.language_info,
                                value: language.language,
                              },
                            });
                            setShowLanguageDropdown(false);
                          }}
                          className={`w-full p-3 text-left cursor-pointer hover:bg-[#f0e6f5] transition-colors ${
                            preferences.language_info.value ===
                            language.language
                              ? "bg-[#f0e6f5]"
                              : ""
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {language.language}
                        </motion.button>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <motion.button
            onClick={handleContinue}
            disabled={
              !preferences.gender_info.value || !preferences.language_info.value||isSubmitting
            }
            className={`w-full py-3 rounded-lg cursor-pointer font-medium flex items-center justify-center gap-2 ${
              !preferences.gender_info.value || !preferences.language_info.value
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#592668] hover:bg-[#4a1e56] text-white"
            } transition-colors`}
            whileHover={{
              scale:
                !preferences.gender_info.value ||
                !preferences.language_info.value
                  ? 1
                  : 1.02,
            }}
            whileTap={{
              scale:
                !preferences.gender_info.value ||
                !preferences.language_info.value
                  ? 1
                  : 0.98,
            }}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPriorityModal && (
          <div className="fixed inset-0 bg-gray-700/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              variants={modal}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                Priority Selection
              </h2>
              <p className="text-gray-600 mb-6">
                Which preference is more important to you when matching with a
                doctor?
              </p>

              <div className="space-y-3">
                {preferences.gender_info.value !== "No Preference" && (
                  <motion.button
                    onClick={() => handlePrioritySelect("gender")}
                    className="w-full p-4 bg-[#f0e6f5] cursor-pointer text-[#592668] rounded-lg border border-[#d6779e] text-left"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium">Doctor Gender</div>
                    <div className="text-sm text-[#592668]/80">
                      {preferences.gender_info.value}
                    </div>
                  </motion.button>
                )}

                <motion.button
                  onClick={() => handlePrioritySelect("language")}
                  className="w-full p-4 bg-[#f0e6f5] cursor-pointer text-[#592668] rounded-lg border border-[#d6779e] text-left"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium">Language</div>
                  <div className="text-sm text-[#592668]/80">
                    {preferences.language_info.value}
                  </div>
                </motion.button>

                <motion.button
                  onClick={handleNoPriority}
                  className="w-full p-4 bg-white cursor-pointer text-gray-700 rounded-lg border border-gray-300 hover:border-[#d6779e] text-left mt-4"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium">No priority</div>
                  <div className="text-sm text-gray-500">
                    We'll decide what's best
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
