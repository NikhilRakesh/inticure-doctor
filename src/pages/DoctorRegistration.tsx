import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { User, ChevronDown, Upload, Info, X } from "lucide-react";
import { useToast } from "../context/ToastProvider";
import { api, form_api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type FormData = {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  email: string;
  country: string;
  countryId: string;
  phone: string;
  qualification: string;
  specialization: string[];
  specializationIds: number[];
  certificationNumber: string;
  languages: number[];
  address: string;
  bio: string;
  registrationYear: string;
};

type Errors = {
  firstName: string;
  lastName: string;
  gender: string;
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
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    country: "",
    countryId: "",
    phone: "",
    qualification: "",
    specialization: [],
    specializationIds: [],
    certificationNumber: "",
    languages: [],
    address: "",
    bio: "",
    registrationYear: "",
  });

  const [errors, setErrors] = useState<Errors>({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    country: "",
    dob: "",
    phone: "",
    qualification: "",
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
    gender: false,
    country: false,
    specialization: false,
    languages: false,
  });

  const [Language, setLanguage] = useState<Language[] | null>(null);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [specializations, setSpecializations] = useState<
    Specializations[] | null
  >(null);
  const navigate = useNavigate();

  const genders = ["Male", "Female"];

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
        setLanguage(response.data);
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
      const response = await api.get("doctor/specializations/");
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
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian number";
      valid = false;
    }
    if (!formData.qualification.trim()) {
      newErrors.qualification = "Qualification is required";
      valid = false;
    }
    if (formData.specialization.length === 0) {
      newErrors.specialization = "At least one specialization is required";
      valid = false;
    }
    if (formData.registrationYear) {
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
    if (!files.certificate) {
      newErrors.certificate = "Certificate file is required";
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
        first_name: formData.firstName,
        last_name: formData.lastName,
        email_id: formData.email,
        mobile_number: formData.phone,
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

  return (
    <div className="min-h-screen bg-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#592668] to-[#7d3a8a] p-6 text-white">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 bg-white/20 rounded-full">
                <User className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">
              Doctor Registration
            </h1>
            <p className="text-center text-white/90 mt-1">
              Complete your professional profile
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-[#592668] rounded-full mr-2"></span>
                Personal Information
              </h2>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                First Name*
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Last Name*
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-1 relative">
              <label className="block text-sm font-medium text-gray-700">
                Gender*
              </label>
              <div
                onClick={() => toggleDropdown("gender")}
                className={`w-full px-4 py-2.5 border rounded-lg flex items-center justify-between cursor-pointer ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <span
                  className={
                    formData.gender ? "text-gray-800" : "text-gray-400"
                  }
                >
                  {formData.gender || "Select gender"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    dropdowns.gender ? "transform rotate-180" : ""
                  }`}
                />
              </div>
              {dropdowns.gender && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                >
                  {genders.map((gender) => (
                    <div
                      key={gender}
                      onClick={() => handleSelect("gender", gender)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {gender}
                    </div>
                  ))}
                </motion.div>
              )}
              {errors.gender && (
                <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1 relative">
              <label className="block text-sm font-medium text-gray-700">
                Country of Residence*
              </label>
              <div
                onClick={() => toggleDropdown("country")}
                className={`w-full px-4 py-2.5 border rounded-lg flex items-center justify-between cursor-pointer ${
                  errors.country ? "border-red-500" : "border-gray-300"
                }`}
              >
                <span
                  className={
                    formData.country ? "text-gray-800" : "text-gray-400"
                  }
                >
                  {formData.country || "Select country"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    dropdowns.country ? "transform rotate-180" : ""
                  }`}
                />
              </div>
              {dropdowns.country && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto"
                >
                  {countries &&
                    countries.map((country) => (
                      <div
                        key={country.id}
                        onClick={() =>
                          handleSelect(
                            "country",
                            country.country_name,
                            country.id
                          )
                        }
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {country.country_name}
                      </div>
                    ))}
                </motion.div>
              )}
              {errors.country && (
                <p className="text-sm text-red-500 mt-1">{errors.country}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Phone No*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">+91</span>
                </div>
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      handleChange(e);
                    }
                  }}
                  className={`w-full pl-12 pr-4 py-2.5 no-arrows border rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be a valid Indian number starting with 6,7,8 or 9
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Registration Year*
              </label>
              <input
                type="number"
                name="registrationYear"
                value={formData.registrationYear}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 no-arrows border rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent ${
                  errors.registrationYear ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter registration year (e.g., 2020)"
                min="1900"
                max={new Date().getFullYear()}
              />
              {errors.registrationYear && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.registrationYear}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth*
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent ${
                  errors.dob ? "border-red-500" : "border-gray-300"
                }`}
                max={new Date().toISOString().split("T")[0]} // restrict future dates
                placeholder="YYYY-MM-DD"
              />
              {errors.dob && (
                <p className="text-sm text-red-500 mt-1">{errors.dob}</p>
              )}
            </div>

            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-6 bg-[#592668] rounded-full mr-2"></span>
                Professional Information
              </h2>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Qualification*
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent ${
                  errors.qualification ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="E.g. MBBS, MD, FRCS, etc."
              />
              {errors.qualification && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.qualification}
                </p>
              )}
            </div>

            <div className="space-y-1 relative">
              <label className="block text-sm font-medium text-gray-700">
                Specialization*
              </label>
              <div
                onClick={() => toggleDropdown("specialization")}
                className={`w-full px-4 py-2.5 border rounded-lg flex items-center justify-between cursor-pointer ${
                  errors.specialization ? "border-red-500" : "border-gray-300"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  {formData.specialization.length > 0 ? (
                    formData.specialization.map((spec, index) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-[#592668]/10 text-[#592668] text-xs rounded-full flex items-center"
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
                          className="ml-1 text-[#592668] hover:text-[#7d3a8a]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">
                      Select specializations
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    dropdowns.specialization ? "transform rotate-180" : ""
                  }`}
                />
              </div>
              {dropdowns.specialization && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto"
                >
                  {specializations &&
                    specializations.map((spec) => (
                      <div
                        key={spec.specialization_id}
                        onClick={() =>
                          handleSpecializationSelect(
                            spec.specialization,
                            spec.specialization_id
                          )
                        }
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                          formData.specialization.includes(spec.specialization)
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        <span className="mr-2">{spec.specialization}</span>
                        {formData.specialization.includes(
                          spec.specialization
                        ) && <span className="ml-auto text-[#592668]">✓</span>}
                      </div>
                    ))}
                </motion.div>
              )}
              {errors.specialization && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.specialization}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Certification Number
              </label>
              <input
                type="text"
                name="certificationNumber"
                value={formData.certificationNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent"
                placeholder="Enter NA if no certification number"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1" /> Optional field
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Upload Certificate*
              </label>
              <div
                onClick={() => fileRefs.certificate.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#592668] transition-colors"
              >
                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {files.certificate
                    ? files.certificate.name
                    : "Click to upload certificate"}
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
                <p className="text-sm text-red-500 mt-1">
                  {errors.certificate}
                </p>
              )}
            </div>

            <div className="space-y-1 relative md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Spoken Languages*
              </label>
              <div
                onClick={() => toggleDropdown("languages")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-wrap gap-2">
                  {Language &&
                    Language.map((lang, index) => {
                      if (!formData.languages.includes(Language[index].id))
                        return null;
                      return (
                        <span
                          key={lang.id}
                          className="px-2 py-1 bg-[#592668]/10 text-[#592668] text-xs rounded-full flex items-center"
                        >
                          {lang.language}
                          {lang.language !== "English" && (
                            <button
                              type="button"
                              onClick={(e) => removeLanguage(lang, e)}
                              className="ml-1 text-[#592668] hover:text-[#7d3a8a]"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      );
                    })}
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    dropdowns.languages ? "transform rotate-180" : ""
                  }`}
                />
              </div>
              {dropdowns.languages && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto"
                >
                  {Language &&
                    Language?.map((lang) => (
                      <div
                        key={lang.id}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                          formData.languages.includes(lang.id)
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        <span className="mr-2">{lang.language}</span>
                        {formData.languages.includes(lang.id) && (
                          <span className="ml-auto text-[#592668]">✓</span>
                        )}
                      </div>
                    ))}
                </motion.div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                *English cannot be removed
              </p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent"
                placeholder="Enter your address"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Upload Address Proof
              </label>
              <div
                onClick={() => fileRefs.addressProof.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#592668] transition-colors"
              >
                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {files.addressProof
                    ? files.addressProof.name
                    : "Click to upload address proof"}
                </p>
                <input
                  type="file"
                  ref={fileRefs.addressProof}
                  onChange={(e) => handleFileChange(e, "addressProof")}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1" /> Optional field
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Upload Profile Photo*
              </label>
              <div
                onClick={() => fileRefs.profilePhoto.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#592668] transition-colors"
              >
                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {files.profilePhoto
                    ? files.profilePhoto.name
                    : "Click to upload profile photo"}
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
                <p className="text-sm text-red-500 mt-1">
                  {errors.profilePhoto}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Upload Signature
              </label>
              <div
                onClick={() => fileRefs.signature.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#592668] transition-colors"
              >
                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {files.signature
                    ? files.signature.name
                    : "Click to upload signature"}
                </p>
                <input
                  type="file"
                  ref={fileRefs.signature}
                  onChange={(e) => handleFileChange(e, "signature")}
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1" /> Optional field
              </p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Add a bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#592668] focus:border-transparent"
                placeholder="Tell us about your professional background and experience..."
              />
            </div>

            <div className="md:col-span-2 mt-6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#592668] to-[#7d3a8a] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
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
