import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  ChevronDown,
  Upload,
  Info,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Award,
  Languages,
  FileText,
  Signature,
  Camera,
} from "lucide-react";
import { useToast } from "../context/ToastProvider";
import { api, form_api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type FormData = {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  email: string;
  country: string;
  countryId: string;
  phone: string;
  countryCode: string;
  qualification: string;
  specialization: string[];
  specializationIds: number[];
  certificationNumber: string;
  languages: number[];
  address: string;
  bio: string;
  registrationYear: string;
  whatappNumber: string;
  whatappCountryCode: string;
};

type Errors = {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  whatappNumber: string;
  country: string;
  email: string;
  dob: string;
  phone: string;
  qualification: string;
  specialization: string;
  certificationNumber: string;
  registrationYear: string;
  profilePhoto: string;
  certificate: string;
};

type Files = {
  certificate: File | null;
  addressProof: File | null;
  profilePhoto: File | null;
  signature: File | null;
};

type Dropdowns = {
  title: boolean;
  gender: boolean;
  country: boolean;
  specialization: boolean;
  languages: boolean;
};

type Language = {
  id: number;
  language: string;
};

type Specializations = {
  specialization_id: number;
  specialization: string;
};

type Country = {
  id: number;
  country_name: string;
  country_code: string;
  currency: string;
  representation: string;
};

const DoctorRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    country: "",
    countryId: "",
    phone: "",
    countryCode: "91",
    qualification: "",
    specialization: [],
    specializationIds: [],
    certificationNumber: "",
    languages: [],
    address: "",
    bio: "",
    registrationYear: "",
    whatappNumber: "",
    whatappCountryCode: "91",
  });

  const [errors, setErrors] = useState<Errors>({
    title: "",
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    country: "",
    dob: "",
    phone: "",
    qualification: "",
    whatappNumber: "",
    specialization: "",
    certificationNumber: "",
    registrationYear: "",
    profilePhoto: "",
    certificate: "",
  });

  const [files, setFiles] = useState<Files>({
    certificate: null,
    addressProof: null,
    profilePhoto: null,
    signature: null,
  });

  const [dropdowns, setDropdowns] = useState<Dropdowns>({
    title: false,
    gender: false,
    country: false,
    specialization: false,
    languages: false,
  });

  const [languageList, setLanguageList] = useState<Language[] | null>(null);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [specializations, setSpecializations] = useState<
    Specializations[] | null
  >(null);
  const navigate = useNavigate();

  const titles = ["Dr.", "Mr.", "Ms.", "Mrs."];
  const genders = ["Male", "Female", "Other"];

  const { showToast } = useToast();

  const fileRefs = {
    certificate: useRef<HTMLInputElement>(null),
    addressProof: useRef<HTMLInputElement>(null),
    profilePhoto: useRef<HTMLInputElement>(null),
    signature: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    fetchLanguage();
    fetchSpecilizations();
    fetchCountry();
  }, []);

  async function fetchLanguage() {
    try {
      const response = await api.get("doctor/languages/");
      if (response.status === 200) {
        setLanguageList(response.data);
        const englishLanguage = response.data.find(
          (lang: Language) => lang.language.toLowerCase() === "english"
        );
        if (englishLanguage) {
          setFormData((prev) => ({
            ...prev,
            languages: [englishLanguage.id],
          }));
        }
      }
    } catch (error) {
      console.log("Error occurs in fetchLanguage", error);
      showToast("Something went wrong. Try again..", "error");
    }
  }

  async function fetchSpecilizations() {
    try {
      const response = await api.get("doctor/specializations_no_availability/");
      if (response.status === 200) {
        setSpecializations(response.data);
      }
    } catch (error) {
      console.log("Error occurs in fetchSpecilizations", error);
      showToast("Something went wrong. Try again..", "error");
    }
  }

  async function fetchCountry() {
    try {
      const response = await api.get("doctor/countries/");
      if (response.status === 200) {
        setCountries(response.data);
      }
    } catch (error) {
      console.log("Error occurs in fetchCountry", error);
      showToast("Something went wrong. Try again..", "error");
    }
  }

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  };

  const validateYear = (year: string): boolean => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    return year.length === 4 && yearNum >= 1900 && yearNum <= currentYear;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Files
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [field]: e.target.files![0] }));
      if (field === "profilePhoto" && errors.profilePhoto) {
        setErrors((prev) => ({ ...prev, profilePhoto: "" }));
      }
      if (field === "certificate" && errors.certificate) {
        setErrors((prev) => ({ ...prev, certificate: "" }));
      }
    }
  };

  const toggleDropdown = (field: keyof Dropdowns) => {
    setDropdowns((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSelect = (field: keyof FormData, value: string, id?: number) => {
    if (field === "country" && id) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        countryId: id.toString(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setDropdowns((prev) => ({ ...prev, [field]: false }));
  };

  const handleLanguageSelect = (language: Language) => {
    if (formData.languages.includes(language.id)) {
      if (language.language === "English" && formData.languages.length === 1)
        return;
      setFormData((prev) => ({
        ...prev,
        languages: prev.languages.filter((lang) => lang !== language.id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, language.id],
      }));
    }
  };

  const handleSpecializationSelect = (specialization: string, id: number) => {
    if (formData.specialization.includes(specialization)) {
      setFormData((prev) => ({
        ...prev,
        specialization: prev.specialization.filter(
          (spec) => spec !== specialization
        ),
        specializationIds: prev.specializationIds.filter(
          (specId) => specId !== id
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        specialization: [...prev.specialization, specialization],
        specializationIds: [...prev.specializationIds, id],
      }));
    }
  };

  const removeLanguage = (language: Language, e: React.MouseEvent) => {
    e.stopPropagation();
    if (language.language === "English") return;
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang !== language.id),
    }));
  };

  const removeSpecialization = (
    specialization: string,
    id: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.filter(
        (spec) => spec !== specialization
      ),
      specializationIds: prev.specializationIds.filter(
        (specId) => specId !== id
      ),
    }));
  };

  const isValidDOB = (dob: string): boolean => {
    const dobDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    const is18OrOlder =
      age > 18 ||
      (age === 18 && m >= 0 && today.getDate() >= dobDate.getDate());
    return dobDate <= today && is18OrOlder;
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.title) {
      newErrors.title = "Title is required";
      valid = false;
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      valid = false;
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
      valid = false;
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
      valid = false;
    }
    if (formData.phone.trim()) {
      if (
        formData.countryCode === "91" &&
        formData.phone &&
        !validatePhone(formData.phone)
      ) {
        newErrors.phone = "Please enter a valid 10-digit Indian number";
        valid = false;
      } else if (!formData.countryCode.trim()) {
        newErrors.phone = "Please enter country code";
        valid = false;
      }
    }
    if (formData.whatappNumber.trim()) {
      if (
        formData.whatappCountryCode === "91" &&
        formData.whatappNumber &&
        !validatePhone(formData.whatappNumber)
      ) {
        newErrors.whatappNumber = "Please enter a valid 10-digit Indian number";
        valid = false;
      } else if (!formData.whatappCountryCode.trim()) {
        newErrors.phone = "Please enter country code";
        valid = false;
      }
    }
    if (!formData.qualification.trim()) {
      newErrors.qualification = "Qualification is required";
      valid = false;
    }
    if (formData.specialization.length === 0) {
      newErrors.specialization = "At least one specialization is required";
      valid = false;
    }
    if (formData.registrationYear.trim()) {
      if (!validateYear(formData.registrationYear)) {
        newErrors.registrationYear =
          "Please enter a valid year (1900-current year)";
        valid = false;
      }
    }
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
      valid = false;
    } else if (!isValidDOB(formData.dob)) {
      newErrors.dob =
        "Please enter a valid date of birth (must be at least 18)";
      valid = false;
    }
    if (!files.profilePhoto) {
      newErrors.profilePhoto = "Profile photo is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await form_api.post("doctor/doctor-profiles/create/", {
        salutation: formData.title,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email_id: formData.email,
        mobile_country_code: formData.countryCode,
        mobile_number: formData.phone,
        whatsapp_country_code: formData.whatappCountryCode,
        whatsapp_number: formData.whatappNumber,
        gender: formData.gender,
        country: formData.countryId,
        qualification: formData.qualification,
        certificate_no: formData.certificationNumber,
        certificate_file: files.certificate,
        address: formData.address,
        dob: formData.dob,
        address_proof: files.addressProof,
        sign_file_name: files.signature,
        profile_pic: files.profilePhoto,
        doctor_bio: formData.bio,
        registration_year: formData.registrationYear,
        specializations: formData.specializationIds,
        language_ids: formData.languages,
      });

      if (response.status === 201) {
        showToast("Registration successful!", "success");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          showToast(`${error.response.data}`, "error");
        } else {
          showToast("Registration failed. Please try again.", "error");
        }
      }
    }
  };

  const handleOthersSelect = () => {
    if (!formData.specialization.includes("Others")) {
      setFormData((prev) => ({
        ...prev,
        specialization: [...prev.specialization, "Others"],
        // Don't add to specializationIds
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ede6f2] to-[#f7f3fa] py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-[#d1b5e3] overflow-hidden">
          <div className="bg-gradient-to-br from-[#582669] via-[#783ca2] to-[#582669] p-10 text-white relative">
            <div className="flex items-center justify-center mb-5">
              <div className="p-3 bg-white/30 rounded-full backdrop-blur">
                <User className="h-9 w-9 text-[#582669]" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-center tracking-tight mb-1 drop-shadow">
              Doctor Registration
            </h1>
            <p className="text-center text-white/90 text-lg font-light leading-relaxed">
              Join our exclusive network of healthcare professionals
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-white"
          >
            <div className="md:col-span-2">
              <div className="flex items-center mb-7">
                <div className="w-2 h-8 bg-gradient-to-b from-[#7a3ba0] to-[#582669] rounded-full mr-4"></div>
                <h2 className="text-2xl font-semibold text-[#2d1436]">
                  Personal Information
                </h2>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <User className="h-4 w-4 text-[#7a3ba0]" />
                Title*
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleDropdown("title")}
                  className={`w-full px-4 py-3 border rounded-xl flex items-center justify-between cursor-pointer bg-[#f7f3fa] transition-all ${
                    errors.title
                      ? "border-[#d02c6e]"
                      : "border-[#d1b5e3] hover:border-[#7a3ba0]"
                  }`}
                >
                  <span
                    className={
                      formData.title ? "text-[#582669]" : "text-[#af99c2]"
                    }
                  >
                    {formData.title || "Select title"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#7a3ba0] transition-transform ${
                      dropdowns.title ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {dropdowns.title && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-full bg-white border border-[#d1b5e3] rounded-xl shadow-2xl py-2"
                  >
                    {titles.map((title) => (
                      <div
                        key={title}
                        onClick={() => handleSelect("title", title)}
                        className="px-4 py-3 hover:bg-[#ede6f2] cursor-pointer transition-colors"
                      >
                        {title}
                      </div>
                    ))}
                  </motion.div>
                )}
                {errors.title && (
                  <p className="text-xs text-[#d02c6e] mt-1">{errors.title}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d]">
                First Name*
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl bg-[#f7f3fa] focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all ${
                  errors.firstName ? "border-[#d02c6e]" : "border-[#d1b5e3]"
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-xs text-[#d02c6e] mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d]">
                Last Name*
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl bg-[#f7f3fa] focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all ${
                  errors.lastName ? "border-[#d02c6e]" : "border-[#d1b5e3]"
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-xs text-[#d02c6e] mt-1">{errors.lastName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <User className="h-4 w-4 text-[#7a3ba0]" />
                Gender*
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleDropdown("gender")}
                  className={`w-full px-4 py-3 border rounded-xl bg-[#f7f3fa] flex items-center justify-between cursor-pointer transition-all ${
                    errors.gender
                      ? "border-[#d02c6e]"
                      : "border-[#d1b5e3] hover:border-[#7a3ba0]"
                  }`}
                >
                  <span
                    className={
                      formData.gender ? "text-[#582669]" : "text-[#af99c2]"
                    }
                  >
                    {formData.gender || "Select gender"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#7a3ba0] transition-transform ${
                      dropdowns.gender ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {dropdowns.gender && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-full bg-white border border-[#d1b5e3] rounded-xl shadow-2xl py-2"
                  >
                    {genders.map((gender) => (
                      <div
                        key={gender}
                        onClick={() => handleSelect("gender", gender)}
                        className="px-4 py-3 hover:bg-[#ede6f2] cursor-pointer transition-colors"
                      >
                        {gender}
                      </div>
                    ))}
                  </motion.div>
                )}
                {errors.gender && (
                  <p className="text-xs text-[#d02c6e] mt-1">{errors.gender}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#7a3ba0]" />
                Date of Birth*
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl bg-[#f7f3fa] focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all ${
                  errors.dob ? "border-[#d02c6e]" : "border-[#d1b5e3]"
                }`}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.dob && (
                <p className="text-xs text-[#d02c6e] mt-1">{errors.dob}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#7a3ba0]" />
                Email Address*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl bg-[#f7f3fa] focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all ${
                  errors.email ? "border-[#d02c6e]" : "border-[#d1b5e3]"
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-xs text-[#d02c6e] mt-1">{errors.email}</p>
              )}
              <p className="text-xs text-[#b899d8]">Used as your email login</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#7a3ba0]" />
                Whatsapp Number*
              </label>
              <div className="flex space-x-3">
                <div className="flex items-center w-24">
                  <span className="px-3 py-3 rounded-l-xl border border-r-0 border-[#d1b5e3] bg-[#f7f3fa] text-[#7a3ba0] font-semibold">
                    +
                  </span>
                  <input
                    type="number"
                    name="countryCode"
                    value={formData.whatappCountryCode ?? "91"}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4) {
                        setFormData((prev) => ({
                          ...prev,
                          whatappCountryCode: value,
                        }));
                      }
                    }}
                    className="w-full py-3 px-3 no-arrows rounded-r-xl border  border-[#d1b5e3] bg-[#f7f3fa] text-[#7a3ba0] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition"
                    placeholder="91"
                    min="1"
                  />
                </div>

                <div className="relative flex-1">
                  <input
                    type="tel"
                    name="whatappNumber"
                    value={formData.whatappNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) handleChange(e);
                    }}
                    className={`w-full pl-4 pr-4 py-3 border rounded-xl bg-[#f7f3fa] text-[#582669] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition ${
                      errors.phone ? "border-[#d02c6e]" : "border-[#d1b5e3]"
                    }`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
              </div>

              {errors.phone && (
                <p className="text-xs text-[#d02c6e] mt-1">
                  {errors.whatappNumber}
                </p>
              )}
              <p className="text-xs text-[#b899d8]">
                Used as your WhatsApp login number.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#7a3ba0]" />
                Phone Number
              </label>
              <div className="flex space-x-3">
                <div className="flex items-center w-24">
                  <span className="px-3 py-3 rounded-l-xl border border-r-0 border-[#d1b5e3] bg-[#f7f3fa] text-[#7a3ba0] font-semibold">
                    +
                  </span>
                  <input
                    type="number"
                    name="countryCode"
                    value={formData.countryCode ?? "91"}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4) {
                        setFormData((prev) => ({
                          ...prev,
                          countryCode: value,
                        }));
                      }
                    }}
                    className="w-full py-3 px-3 no-arrows rounded-r-xl border  border-[#d1b5e3] bg-[#f7f3fa] text-[#7a3ba0] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition"
                    placeholder="91"
                    min="1"
                  />
                </div>

                <div className="relative flex-1">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) handleChange(e);
                    }}
                    className={`w-full pl-4 pr-4 py-3 border rounded-xl bg-[#f7f3fa] text-[#582669] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition ${
                      errors.phone ? "border-[#d02c6e]" : "border-[#d1b5e3]"
                    }`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
              </div>

              {errors.phone && (
                <p className="text-xs text-[#d02c6e] mt-1">{errors.phone}</p>
              )}
              <p className="text-xs text-[#b899d8]">
                Used as your WhatsApp login number.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#7a3ba0]" />
                Country of Residence*
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleDropdown("country")}
                  className={`w-full px-4 py-3 border rounded-xl bg-[#f7f3fa] flex items-center justify-between cursor-pointer transition-all ${
                    errors.country
                      ? "border-[#d02c6e]"
                      : "border-[#d1b5e3] hover:border-[#7a3ba0]"
                  }`}
                >
                  <span
                    className={
                      formData.country ? "text-[#582669]" : "text-[#af99c2]"
                    }
                  >
                    {formData.country || "Select country"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#7a3ba0] transition-transform ${
                      dropdowns.country ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {dropdowns.country && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-full bg-white border border-[#d1b5e3] rounded-xl shadow-2xl py-2 max-h-60 overflow-y-auto"
                  >
                    {countries?.map((country) => (
                      <div
                        key={country.id}
                        onClick={() =>
                          handleSelect(
                            "country",
                            country.country_name,
                            country.id
                          )
                        }
                        className="px-4 py-3 hover:bg-[#ede6f2] cursor-pointer transition-colors"
                      >
                        {country.country_name}
                      </div>
                    ))}
                  </motion.div>
                )}
                {errors.country && (
                  <p className="text-xs text-[#d02c6e] mt-1">
                    {errors.country}
                  </p>
                )}
              </div>
            </div>
            <div className="md:col-span-2 mt-7">
              <div className="flex items-center mb-7">
                <div className="w-2 h-8 bg-gradient-to-b from-[#7a3ba0] to-[#582669] rounded-full mr-4"></div>
                <h2 className="text-2xl font-semibold text-[#2d1436]">
                  Professional Information
                </h2>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#7a3ba0]" />
                Qualification*
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl bg-[#f7f3fa] focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all ${
                  errors.qualification ? "border-[#d02c6e]" : "border-[#d1b5e3]"
                }`}
                placeholder="E.g. MBBS, MD, FRCS, etc."
              />
              {errors.qualification && (
                <p className="text-xs text-[#d02c6e] mt-1">
                  {errors.qualification}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d]">
                Registration Year
              </label>
              <input
                type="number"
                name="registrationYear"
                value={formData.registrationYear}
                onChange={handleChange}
                className={`w-full px-4 py-3 border no-arrows rounded-xl bg-[#f7f3fa] focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all ${
                  errors.registrationYear
                    ? "border-[#d02c6e]"
                    : "border-[#d1b5e3]"
                }`}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
              />
              {errors.registrationYear && (
                <p className="text-xs text-[#d02c6e] mt-1">
                  {errors.registrationYear}
                </p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <Award className="h-4 w-4 text-[#7a3ba0]" />
                Specialization*
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleDropdown("specialization")}
                  className={`w-full px-4 py-3 border rounded-xl bg-[#f7f3fa] flex items-center justify-between cursor-pointer transition-all ${
                    errors.specialization
                      ? "border-[#d02c6e]"
                      : "border-[#d1b5e3] hover:border-[#7a3ba0]"
                  }`}
                >
                  <div className="flex flex-wrap gap-2">
                    {formData.specialization.length > 0 ? (
                      formData.specialization.map((spec, index) => (
                        <span
                          key={spec}
                          className="px-3 py-1 bg-[#ede6f2] text-[#582669] text-sm rounded-full flex items-center"
                        >
                          {spec}
                          <button
                            type="button"
                            onClick={(e) =>
                              removeSpecialization(
                                spec,
                                formData.specializationIds[index],
                                e
                              )
                            }
                            className="ml-2 text-[#d02c6e] hover:text-[#7a3ba0]"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[#c9b0da]">
                        Select specializations
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-[#7a3ba0] transition-transform ${
                      dropdowns.specialization ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {dropdowns.specialization && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-full bg-white border border-[#d1b5e3] rounded-xl shadow-2xl py-2 max-h-60 overflow-y-auto"
                  >
                    {specializations?.map((spec) => (
                      <div
                        key={spec.specialization_id}
                        onClick={() =>
                          handleSpecializationSelect(
                            spec.specialization,
                            spec.specialization_id
                          )
                        }
                        className={`px-4 py-3 hover:bg-[#ede6f2] cursor-pointer flex items-center transition-colors ${
                          formData.specialization.includes(spec.specialization)
                            ? "bg-[#ede6f2]"
                            : ""
                        }`}
                      >
                        <span className="mr-2">{spec.specialization}</span>
                        {formData.specialization.includes(
                          spec.specialization
                        ) && <span className="ml-auto text-[#7a3ba0]">✓</span>}
                      </div>
                    ))}
                    <div
                      onClick={handleOthersSelect}
                      className={`px-4 py-3 hover:bg-[#ede6f2] cursor-pointer flex items-center transition-colors ${
                        formData.specialization.includes("Others")
                          ? "bg-[#ede6f2]"
                          : ""
                      }`}
                    >
                      <span className="mr-2">Others</span>
                      {formData.specialization.includes("Others") && (
                        <span className="ml-auto text-[#7a3ba0]">✓</span>
                      )}
                    </div>
                  </motion.div>
                )}
                {errors.specialization && (
                  <p className="text-xs text-[#d02c6e] mt-1">
                    {errors.specialization}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d]">
                Certification Number
              </label>
              <input
                type="text"
                name="certificationNumber"
                value={formData.certificationNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border bg-[#f7f3fa] border-[#d1b5e3] rounded-xl focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all"
                placeholder="Enter NA if no certification number"
              />
              <p className="text-xs text-[#b899d8] flex items-center mt-1">
                <Info className="h-3 w-3 mr-1" /> Optional field
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <Languages className="h-4 w-4 text-[#7a3ba0]" />
                Spoken Languages*
              </label>
              <div className="relative">
                <div
                  onClick={() => toggleDropdown("languages")}
                  className="w-full px-4 py-3 border bg-[#f7f3fa] border-[#d1b5e3] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#7a3ba0] transition-all"
                >
                  <div className="flex flex-wrap gap-2">
                    {languageList?.map((lang) => {
                      if (!formData.languages.includes(lang.id)) return null;
                      return (
                        <span
                          key={lang.id}
                          className="px-3 py-1 bg-[#ede6f2] text-[#582669] text-sm rounded-full flex items-center"
                        >
                          {lang.language}
                          {lang.language !== "English" && (
                            <button
                              type="button"
                              onClick={(e) => removeLanguage(lang, e)}
                              className="ml-2 text-[#d02c6e] hover:text-[#7a3ba0]"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-[#7a3ba0] transition-transform ${
                      dropdowns.languages ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {dropdowns.languages && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-full bg-white border border-[#d1b5e3] rounded-xl shadow-2xl py-2 max-h-60 overflow-y-auto"
                  >
                    {languageList?.map((lang) => (
                      <div
                        key={lang.id}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`px-4 py-3 hover:bg-[#ede6f2] cursor-pointer flex items-center transition-colors ${
                          formData.languages.includes(lang.id)
                            ? "bg-[#ede6f2]"
                            : ""
                        }`}
                      >
                        <span className="mr-2">{lang.language}</span>
                        {formData.languages.includes(lang.id) && (
                          <span className="ml-auto text-[#7a3ba0]">✓</span>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
                <p className="text-xs text-[#b899d8] mt-1">
                  *English cannot be removed
                </p>
              </div>
            </div>
            <div className="md:col-span-2 mt-7">
              <div className="flex items-center mb-7">
                <div className="w-2 h-8 bg-gradient-to-b from-[#7a3ba0] to-[#582669] rounded-full mr-4"></div>
                <h2 className="text-2xl font-semibold text-[#2d1436]">
                  Documents & Verification
                </h2>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#7a3ba0]" />
                Upload Certificate
              </label>
              <div
                onClick={() => fileRefs.certificate.current?.click()}
                className="w-full p-6 border-2 border-dashed border-[#d1b5e3] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#7a3ba0] transition-all group bg-[#f7f3fa]"
              >
                <Upload className="h-8 w-8 text-[#b899d8] mb-3 group-hover:text-[#7a3ba0] transition-colors" />
                <p className="text-sm text-[#582669] text-center">
                  {files.certificate
                    ? files.certificate.name
                    : "Click to upload certificate"}
                </p>
                <p className="text-xs text-[#b899d8] mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
                <input
                  type="file"
                  ref={fileRefs.certificate}
                  onChange={(e) => handleFileChange(e, "certificate")}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              {errors.certificate && (
                <p className="text-xs text-[#d02c6e] mt-1">
                  {errors.certificate}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#7a3ba0]" />
                Upload Address Proof
              </label>
              <div
                onClick={() => fileRefs.addressProof.current?.click()}
                className="w-full p-6 border-2 border-dashed border-[#d1b5e3] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#7a3ba0] transition-all group bg-[#f7f3fa]"
              >
                <Upload className="h-8 w-8 text-[#b899d8] mb-3 group-hover:text-[#7a3ba0] transition-colors" />
                <p className="text-sm text-[#582669] text-center">
                  {files.addressProof
                    ? files.addressProof.name
                    : "Click to upload address proof"}
                </p>
                <p className="text-xs text-[#b899d8] mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </p>
                <input
                  type="file"
                  ref={fileRefs.addressProof}
                  onChange={(e) => handleFileChange(e, "addressProof")}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              <p className="text-xs text-[#b899d8] flex items-center mt-1">
                <Info className="h-3 w-3 mr-1" /> Optional field
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <Camera className="h-4 w-4 text-[#7a3ba0]" />
                Upload Profile Photo* (visible to patients)
              </label>
              <div
                onClick={() => fileRefs.profilePhoto.current?.click()}
                className="w-full p-6 border-2 border-dashed border-[#d1b5e3] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#7a3ba0] transition-all group bg-[#f7f3fa]"
              >
                <Upload className="h-8 w-8 text-[#b899d8] mb-3 group-hover:text-[#7a3ba0] transition-colors" />
                <p className="text-sm text-[#582669] text-center">
                  {files.profilePhoto
                    ? files.profilePhoto.name
                    : "Click to upload profile photo"}
                </p>
                <p className="text-xs text-[#b899d8] mt-1">
                  JPG, PNG (Max 5MB)
                </p>
                <input
                  type="file"
                  ref={fileRefs.profilePhoto}
                  onChange={(e) => handleFileChange(e, "profilePhoto")}
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                />
              </div>
              {errors.profilePhoto && (
                <p className="text-xs text-[#d02c6e] mt-1">
                  {errors.profilePhoto}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#44205d] flex items-center gap-2">
                <Signature className="h-4 w-4 text-[#7a3ba0]" />
                Upload Signature
              </label>
              <div
                onClick={() => fileRefs.signature.current?.click()}
                className="w-full p-6 border-2 border-dashed border-[#d1b5e3] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#7a3ba0] transition-all group bg-[#f7f3fa]"
              >
                <Upload className="h-8 w-8 text-[#b899d8] mb-3 group-hover:text-[#7a3ba0] transition-colors" />
                <p className="text-sm text-[#582669] text-center">
                  {files.signature
                    ? files.signature.name
                    : "Click to upload signature"}
                </p>
                <p className="text-xs text-[#b899d8] mt-1">
                  JPG, PNG (Max 5MB)
                </p>
                <input
                  type="file"
                  ref={fileRefs.signature}
                  onChange={(e) => handleFileChange(e, "signature")}
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                />
              </div>
              <p className="text-xs text-[#b899d8] flex items-center mt-1">
                <Info className="h-3 w-3 mr-1" /> Optional field
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#44205d]">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border bg-[#f7f3fa] border-[#d1b5e3] rounded-xl focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all"
                placeholder="Enter your complete address"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#44205d]">
                Professional Bio* (This bio will be shown to patients before
                booking a consultation)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border bg-[#f7f3fa] border-[#d1b5e3] rounded-xl focus:ring-2 focus:ring-[#7a3ba0] focus:border-transparent transition-all"
                placeholder="I'm a consultant psychologist with years of practice. My approach is mainly attachment and emotion-focused, combined with cognitive-behavioral therapy (CBT). I'm also a certified comprehensive sexuality education trainer who follows a sex-positive approach in therapy. My niche of work includes addressing the emotional, behavioral, and intimacy issues of people, with a primary focus on providing a safe, empathetic, and non-judgmental space where individuals can openly talk about their emotions and sexual/intimacy issues."
              />
            </div>
            <div className="md:col-span-2 mt-10">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r cursor-pointer from-[#582669] via-[#7a3ba0] to-[#582669] text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all text-xl tracking-wide"
              >
                Complete Registration
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorRegistration;
