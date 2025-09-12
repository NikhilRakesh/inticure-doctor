import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { token_api } from "../lib/api";
import { useAuthStore } from "../features/Auth/authSlice";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CheckCircle,
  Clock,
  IdCard,
  Languages,
  RefreshCw,
  Ruler,
  User,
  UserCog,
  UserPlus,
  UserRound,
  Video,
  Weight,
} from "lucide-react";
import { useToast } from "../context/ToastProvider";
import { PreviousNotesModal } from "../components/Appointment/PreviousNotesModal";
import { WarningModal } from "../components/Appointment/WarningModal";
import { isAfter, isBefore, subHours } from "date-fns";
import BackButton from "../components/Common/BackButton";
import { CompleteAppointmentModal } from "../components/Appointment/CompleteAppointmentModal";
import { motion } from "framer-motion";
import DoctorPatientChat from "../components/chat/DoctorPatientChat";
import AppointmentLoading from "../components/Common/AppointmentLoading";
import axios from "axios";
import PrescriptionForm from "../components/AppointmentDetails/PrescriptionForm";
import PatientAssessmentForm from "../components/AppointmentDetails/PatientAssessmentForm";
import CoupleConsultationModal from "../components/Common/CoupleConsultationModal";
import ClinicalNotes from "../components/AppointmentDetails/ClinicalNotes";

type FormData = {
  height: string;
  weight: string;
  medicalHistory: string;
  currentConditions: string;
  prescriptionMeds: string;
  nitrateMeds: string;
  alternativeMeds: string;
  allergies: string;
  observations: string;
  height_unit: "cm" | "ft";
  weight_unit: "kg" | "lbs";
};

interface AppointmentData {
  appointment: Appointment;
  booked_customer: number;
  patients: Patient[];
  questionnaire_answers: QuestionnaireQuestion[];
  extra_questions: ExtraQuestionItem[];
  notes: Note[];
  prescribed_medicines: PrescribedMedicine[];
  prescribed_tests: PrescribedTest[];
  followup_notes: FollowupNote[];
  nextbooked_or_refered: boolean;
  added_ob_notes: boolean;
  is_prescription_allowed: boolean;
  doctor_id: number;
  notes_for_patient: NoteForPatient[];
  is_couple: boolean;
}

interface Appointment {
  appointment_id: number;
  appointment_date: string;
  appointment_time: string;
  start_time: string;
  end_time: string;
  appointment_status: string;
  doctor_name: string;
  specialization: string | null;
  category: string;
  language_pref: string;
  gender_pref: string;
  meeting_link: string | null;
  payment_done: boolean;
  is_free: boolean;
  prescription: string | null;
  appointment_notes: string | null;
}

interface Patient {
  username: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  gender: string;
  age: number;
  id: number;
  weight: number | null;
  height: number | null;
  mobile_number: number;
  address: string | null;
  profile_pic: string | null;
  date_of_birth: string;
  language_pref: string;
  gender_pref: string;
  height_unit: "cm" | "ft";
  weight_unit: "kg" | "lbs";
}

interface QuestionnaireQuestion {
  question: string;
  answers: string[];
}

interface ExtraQuestionItem {
  question: string;
  answer: string | null;
  id: number;
}

interface Payload {
  height: string;
  weight: string;
  appointment_id: string | null;
  customer: number;
  height_unit: "cm" | "ft";
  weight_unit: "kg" | "lbs";
  extra_questions:
    | {
        answer: string;
        question: string;
        id: number;
      }[]
    | undefined;
}

interface PayloadPrescription {
  appointment: string | null;
  instruction: string;
  duration: string;
  frequency: string;
  dosage: string;
  strength: string;
  medicine_name: string;
  customer: number;
}

interface Note {
  id: number;
  note: string;
  doctor: string;
  date: string;
}

interface NoteForPatient {
  id: number;
  note: string;
  created_at: string;
  updated_at: string;
  customer: number;
  doctor: number;
  appointment: number;
}

interface PrescribedMedicine {
  id: number;
  created_at: string;
  updated_at: string;
  instruction: string;
  duration: string;
  frequency: string;
  dosage: string;
  strength: string;
  medicine_name: string;
  is_active: boolean;
  customer: number;
  doctor: string;
  appointment: number;
}

interface PrescribedTest {
  id: number;
  test_name: string;
  instruction: string;
  created_at: string;
  updated_at: string;
  customer: number;
  doctor: number;
  appointment: number;
}

interface FollowupNote {
  id: number;
  note: string;
  doctor: string;
  date: string;
}

interface PatientNote {
  id: number;
  note: string;
  created_at: string;
  updated_at: string;
  customer: number;
  doctor: number;
  appointment: number;
}

interface PrescriptionData {
  medicine: PrescribedMedicine[];
  tests: PrescribedTest[];
  patient_notes: PatientNote[];
  patient_first_name: string;
  patient_last_name: string;
  followup_advices: FollowupNote[];
  observation_notes: Note[];
  questionnaire_answers: QuestionnaireQuestion[];
  extra_questions: ExtraQuestionItem[];
  patient_details: Patient;
}

interface DetailCardProps {
  icon: ReactNode;
  label: string;
  value?: string | number | null;
}

const DoctorPatientAssessment = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();
  const [activeTab, setActiveTab] = useState<
    "assessment" | "prescription" | "clinicalnotes"
  >("assessment");
  const [prescription, setPrescription] = useState({
    medication: "",
    strength: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [followUpAdvice, setFollowUpAdvice] = useState({
    instructions: "",
  });
  const [observatioNote, setObservationNote] = useState<string>("");
  const [currentObservatioNote, setCurrentObservationNote] = useState<
    string[] | null
  >(null);
  const [investigation, setInvestigation] = useState({
    testName: "",
    instructions: "",
  });
  const [errors2, setErrors2] = useState<{ [key: string]: string }>({});
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [showPreviousNotes, setShowPreviousNotes] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [showLoading, setShowLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken);
  const doctor_flag = useAuthStore((state) => state.doctorLevel);
  const [searchParams] = useSearchParams();
  const aid = searchParams.get("aid");
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [openPatientModal, setOpenPatientModal] = useState(false);

  const [resolver, setResolver] = useState<(value: number | string) => void>(
    () => () => {}
  );

  const choosePatient = useCallback((): Promise<number | string> => {
    setOpenPatientModal(true);
    return new Promise<number | "both">((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleSelection = (value: number | string) => {
    setOpenPatientModal(false);
    resolver(value);
  };

  const onSubmit = (formData: FormData) => {
    if (data?.appointment?.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    const updatedExtraAnswers = data?.extra_questions.map((q, i) => ({
      ...q,
      answer: formData[`extra_${i}` as keyof FormData],
    }));

    const payload: Payload = {
      height: formData.height,
      weight: formData.weight,
      appointment_id: aid,
      extra_questions: updatedExtraAnswers,
      weight_unit: formData.weight_unit,
      height_unit: formData.height_unit,
      customer: selectedPatientId,
    };

    addPatientData.mutate(payload);
  };

  const { data, refetch } = useQuery<AppointmentData>({
    queryKey: ["available-hours"],
    queryFn: () => {
      return token_api(accessToken)
        .get(`doctor/appointment_details/${aid}/`)
        .then((res) => {
          return res.data;
        });
    },
  });

  const { data: prescriptionData, refetch: refetchPrescription } =
    useQuery<PrescriptionData>({
      queryKey: ["prescriptions", selectedPatientId],
      queryFn: () => {
        return token_api(accessToken)
          .get(`doctor/prescriptions/?customer=${selectedPatientId}`)
          .then((res) => {
            return res.data;
          });
      },
      enabled: !!selectedPatientId,
    });

  const addPatientData = useMutation({
    mutationKey: ["customer_details_update"],
    mutationFn: (data: Payload) =>
      token_api(accessToken)
        .post("doctor/customer_details_update/", data)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Assesment Completed successfully.", "success");
      refetchPrescription();
    },
    onError: () => {
      showToast("Failed to add. Try again", "error");
    },
  });

  const addPrescription = useMutation({
    mutationKey: ["prescribe_medicine"],
    mutationFn: (data: PayloadPrescription) =>
      token_api(accessToken)
        .post("doctor/prescribe_medicine/", data)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Prescription successfully.", "success");
      refetchPrescription();
      setPrescription({
        medication: "",
        strength: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });
    },
    onError: () => {
      showToast("Failed to add. Try again", "error");
    },
  });

  const addObservationNote = useMutation({
    mutationKey: ["obs_notes_add"],
    mutationFn: (data: string) =>
      token_api(accessToken)
        .post("doctor/obs_notes_add/", {
          appointment: aid,
          note: data,
          customer: selectedPatientId,
        })
        .then((res) => res.data),
    onSuccess: (res) => {
      refetchPrescription();
      setCurrentObservationNote((prev) => {
        const updated = prev ? [...prev, res.note] : [res.note];
        return updated;
      });
      showToast("Observation note added successfully.", "success");
      setObservationNote("");
    },
    onError: () => {
      showToast("Failed to add observation note. Try again", "error");
    },
  });

  const addInvestigation = useMutation({
    mutationKey: ["prescribe_tests"],
    mutationFn: (data: {
      test_name: string;
      instruction?: string;
      appointment: string;
      customer: number;
    }) =>
      token_api(accessToken)
        .post("doctor/prescribe_tests/", data)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Investigations advised added successfully.", "success");
      refetchPrescription();
      setInvestigation({
        testName: "",
        instructions: "",
      });
    },
    onError: () => {
      showToast("Failed to add investigations advised. Try again", "error");
    },
  });

  const completeAppointment = useMutation({
    mutationKey: ["status_update"],
    mutationFn: (data: { completed: boolean; reason: string | undefined }) =>
      token_api(accessToken)
        .post("doctor/status_update/", {
          appointment_id: aid,
          completed: data.completed,
          reason: data.reason,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Appointment completed successfully.", "success");
      refetch();
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showToast(`${error.response?.data || "Something went wrong"}`, "error");
      } else {
        showToast("An unexpected error occurred", "error");
      }
    },
  });

  const addFollowUpAdive = useMutation({
    mutationKey: ["fp_notes_add"],
    mutationFn: (data: string) =>
      token_api(accessToken)
        .post("doctor/fp_notes_add/", {
          appointment: aid,
          note: data,
          customer: selectedPatientId,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Follow-up Advice added successfully.", "success");
      refetchPrescription();
      setFollowUpAdvice({
        instructions: "",
      });
    },
    onError: () => {
      showToast("Failed to add Follow-up Advice. Try again", "error");
    },
  });

  const addPatientNotes = useMutation({
    mutationKey: ["notes_for_patient"],
    mutationFn: (data: string) =>
      token_api(accessToken)
        .post("doctor/notes_for_patient/", {
          appointment: aid,
          note: data,
          customer: selectedPatientId,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Patient notes added successfully.", "success");
      refetchPrescription();
      setNotes("");
    },
    onError: () => {
      showToast("Failed . Try again", "error");
    },
  });

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setShowLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  useEffect(() => {
    if (prescriptionData?.patient_details) {
      setValue(
        "height",
        prescriptionData?.patient_details?.height?.toString() || ""
      );
      setValue(
        "weight",
        prescriptionData?.patient_details?.weight?.toString() || ""
      );
      setValue(
        "height_unit",
        prescriptionData?.patient_details?.height_unit || ""
      );
      setValue(
        "weight_unit",
        prescriptionData?.patient_details?.weight_unit || ""
      );
    }

    prescriptionData?.extra_questions?.forEach((group, index) => {
      const fieldName = `extra_${index}`;
      setValue(fieldName as keyof FormData, group.answer || "");
    });
  }, [setValue, prescriptionData]);

  useEffect(() => {
    if (data && data?.patients && selectedPatientId === 0) {
      setSelectedPatientId(data?.patients[0]?.id);
    }
  }, [data]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAppointmentDate = (dateString: string): string => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const targetDate = new Date(dateString);

    const isToday = today.toDateString() === targetDate.toDateString();
    const isTomorrow = tomorrow.toDateString() === targetDate.toDateString();

    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";

    return targetDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleReferral = async (appointmentId: number | undefined) => {
    if (
      data?.appointment.appointment_status === "rescheduled_by_customer" ||
      data?.appointment.appointment_status === "rescheduled_by_doctor"
    ) {
      const rescheduledBy =
        data?.appointment.appointment_status === "rescheduled_by_customer"
          ? "the patient"
          : "you";

      showToast(
        `You cannot refer. This appointment was rescheduled by ${rescheduledBy}.`,
        "error"
      );

      return;
    } else if (data?.appointment?.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    let patientIds;
    if (!data?.is_couple) {
      patientIds = data?.patients
        ?.map((p) => p?.id)
        .filter(Boolean)
        .join(",");
    } else {
      const selected = await choosePatient();
      if (selected === "both") {
        patientIds = data?.patients?.map((p) => p?.id).join(",");
      } else {
        patientIds = selected;
      }
    }
    navigate(
      `/reffer-doctor?appointment_id=${appointmentId}&patient_ids=${patientIds}`
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPrescription((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors2[name as keyof PrescriptionForm]) {
      setErrors2((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit2 = () => {
    if (data?.appointment?.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    if (!validateForm()) return;
    const newErrors: { [key: string]: string } = {};
    Object.entries(prescription).forEach(([key, value]) => {
      if (!value) newErrors[key] = "This field is required";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors2(newErrors);
      return;
    }
    addPrescription.mutate({
      appointment: aid,
      instruction: prescription.instructions,
      duration: prescription.duration,
      frequency: prescription.frequency,
      dosage: prescription.dosage,
      strength: prescription.strength,
      medicine_name: prescription.medication,
      customer: selectedPatientId,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors2 = {};

    for (const key in prescription) {
      if (!prescription[key as keyof PrescriptionForm]?.trim()) {
        newErrors[key as keyof PrescriptionForm] = "This field is required";
      }
    }

    setErrors2(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitFollowUp = () => {
    if (!followUpAdvice.instructions.trim()) {
      showToast("Please enter follow-up advice before submitting.", "error");
      return;
    }
    if (data?.appointment?.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    addFollowUpAdive.mutate(followUpAdvice.instructions);
  };

  const handleAddInvestigation = () => {
    if (!aid) return;
    if (!investigation.testName.trim()) {
      showToast("Please add investigation before submitting.", "error");
      return;
    }
    if (data?.appointment?.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    addInvestigation.mutate({
      test_name: investigation.testName,
      instruction: investigation.instructions,
      appointment: aid,
      customer: selectedPatientId,
    });
  };

  function submitClinicalNotes() {
    if (observatioNote === "") {
      showToast("Please enter an observation note before submitting.", "error");
      return;
    }
    if (data?.appointment?.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    addObservationNote.mutate(observatioNote);
  }

  const joinMeeting = () => {
    if (!data) return;
    if (
      data.appointment.appointment_status === "rescheduled_by_customer" ||
      data.appointment.appointment_status === "rescheduled_by_doctor"
    ) {
      const rescheduledBy =
        data.appointment.appointment_status === "rescheduled_by_customer"
          ? "the patient"
          : "you";

      showToast(
        `This appointment was rescheduled by ${rescheduledBy}.`,
        "error"
      );
      return;
    } else if (data.appointment.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    const now: Date = new Date();
    const appointmentDateTime = new Date(
      `${data.appointment.appointment_date}T${data.appointment.start_time}`
    );

    const oneHourBefore = subHours(appointmentDateTime, 1);

    if (
      isAfter(now, oneHourBefore) &&
      isBefore(now, appointmentDateTime) &&
      data.appointment.meeting_link
    ) {
      window.open(data.appointment.meeting_link, "_blank");
    } else {
      showToast(
        "The consultation link will be available 1 hour before your appointment.",
        "error"
      );
    }
  };

  const handleReschedule = () => {
    if (
      data?.appointment?.appointment_status === "rescheduled_by_customer" ||
      data?.appointment?.appointment_status === "rescheduled_by_doctor"
    ) {
      const rescheduledBy =
        data?.appointment?.appointment_status === "rescheduled_by_customer"
          ? "the patient"
          : "you";

      showToast(
        `This appointment has already been rescheduled by ${rescheduledBy}.`,
        "error"
      );

      return;
    } else if (data?.appointment?.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    if (data?.nextbooked_or_refered) {
      showToast("A follow-up or referral is already assigned.", "error");
      return;
    }

    setIsOpen(true);
  };

  const handleFollowUp = async () => {
    if (!data) return;
    if (data?.appointment?.appointment_status === "completed") {
      showToast(
        "This appointment has already been completed. No further actions can be taken.",
        "error"
      );
      return;
    }
    let patientIds;
    if (!data?.is_couple) {
      patientIds = data?.patients
        ?.map((p) => p?.id)
        .filter(Boolean)
        .join(",");
    } else {
      const selected = await choosePatient();
      if (selected === "both") {
        patientIds = data?.patients?.map((p) => p?.id).join(",");
      } else {
        patientIds = selected;
      }
    }
    const pid = data?.booked_customer;
    navigate(
      `/follow-up?did=${data?.doctor_id}&aid=${data?.appointment.appointment_id}&patient_ids=${patientIds}&pid=${pid}`
    );
  };

  const handleSavePatientNotes = () => {
    addPatientNotes.mutate(notes);
  };

  const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value }) => (
    <motion.div
      className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-white transition-colors"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <div className="mr-2 p-1 bg-primary-50 rounded-full">{icon}</div>
        <span>{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-800">
        {value || <span className="text-gray-400">Not provided</span>}
      </p>
    </motion.div>
  );

  const calculateAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const m = today.getMonth() - dob.getMonth();
    const d = today.getDate() - dob.getDate();

    if (m < 0 || (m === 0 && d < 0)) {
      age--;
    }

    return age;
  };

  return (
    <div className="min-h-screen">
      <main className=" mx-14 px-4 py-6 sm:px-6 lg:px-8">
        <BackButton />
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-200">
          <div className="p-6 md:p-8">
            <div className={`flex gap-8 `}>
              {/* Patient Profile Section */}
              {data?.patients?.map((patient, index) => {
                const isSelected = selectedPatientId === patient.id;
                return (
                  <motion.div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`relative ${
                      data?.patients?.length === 1 ? "w-8/12" : ""
                    }  p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-[#c6658e]/50 bg-gradient-to-r from-[#fbeaf0] to-[#f7f0fa] shadow-md"
                        : "border-gray-200 bg-white hover:border-[#d7a9c0]/60 hover:shadow-sm"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    {/* Patient Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={`p-3 rounded-xl shadow-sm border ${
                          isSelected
                            ? "bg-gradient-to-br from-[#8a4baf] to-[#c6658e] border-transparent"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <User
                          className={`h-6 w-6 ${
                            isSelected ? "text-white" : "text-[#c6658e]"
                          }`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h2
                            className={`text-xl font-semibold ${
                              isSelected ? "text-[#592668]" : "text-gray-900"
                            }`}
                          >
                            {patient?.first_name || "Patient Name"}
                            {patient?.last_name && ` ${patient.last_name}`}
                          </h2>

                          {patient?.preferred_name && (
                            <span
                              className={`text-sm font-medium px-2.5 py-1 rounded-full border ${
                                isSelected
                                  ? "bg-white/80 text-[#592668] border-white/30"
                                  : "bg-pink-50 text-[#c6658e] border-pink-100"
                              }`}
                            >
                              {patient.preferred_name}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center bg-gray-50 px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-100">
                            <UserCog className="h-4 w-4 mr-1.5 text-[#c6658e]" />
                            {patient?.gender
                              ? capitalizeFirstLetter(patient.gender)
                              : "Gender not specified"}
                          </span>

                          <span className="inline-flex items-center bg-gray-50 px-3 py-1.5 rounded-full text-sm text-gray-700 border border-gray-100">
                            <IdCard className="h-4 w-4 mr-1.5 text-[#c6658e]" />
                            ID: {patient.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailCard
                        icon={<Calendar className="h-4 w-4 text-[#c6658e]" />}
                        label="Date of Birth"
                        value={
                          patient?.date_of_birth
                            ? formatDate(patient.date_of_birth)
                            : null
                        }
                      />

                      <DetailCard
                        icon={<Ruler className="h-4 w-4 text-[#c6658e]" />}
                        label="Height"
                        value={
                          patient?.height
                            ? `${patient.height} ${patient.height_unit}`
                            : null
                        }
                      />

                      <DetailCard
                        icon={<Weight className="h-4 w-4 text-[#c6658e]" />}
                        label="Weight"
                        value={
                          patient?.weight
                            ? `${patient.weight} ${patient.weight_unit}`
                            : null
                        }
                      />

                      <DetailCard
                        icon={<User className="h-4 w-4 text-[#c6658e]" />}
                        label="Age"
                        value={
                          calculateAge(patient?.date_of_birth) + " yrs" || null
                        }
                      />
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <div className="w-3 h-3 bg-gradient-to-r from-[#8a4baf] to-[#c6658e] rounded-full ring-2 ring-white" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* Appointment Card */}
              <div className="w-4/12 h-full">
                <div
                  className={`bg-white p-5 rounded-xl border ${
                    data?.appointment?.appointment_status ===
                      "rescheduled_by_customer" ||
                    data?.appointment?.appointment_status ===
                      "rescheduled_by_doctor"
                      ? "border-amber-300 bg-amber-50/30"
                      : "border-gray-200"
                  } shadow-sm relative`}
                >
                  {/* Rescheduled Badge */}
                  {(data?.appointment?.appointment_status ===
                    "rescheduled_by_customer" ||
                    data?.appointment?.appointment_status ===
                      "rescheduled_by_doctor") && (
                    <div className="absolute -top-2 -right-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          data.appointment.appointment_status ===
                          "rescheduled_by_doctor"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-purple-100 text-purple-800 border border-purple-200"
                        }`}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {data.appointment.appointment_status ===
                        "rescheduled_by_doctor"
                          ? "Doctor Rescheduled"
                          : "Patient Rescheduled"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <CalendarClock
                        className={`h-5 w-5 ${
                          data?.appointment?.appointment_status?.includes(
                            "rescheduled"
                          )
                            ? "text-amber-600"
                            : "text-indigo-600"
                        }`}
                      />
                      <span>Appointment Details</span>
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    {/* Rescheduled Info Box */}
                    {(data?.appointment?.appointment_status ===
                      "rescheduled_by_customer" ||
                      data?.appointment?.appointment_status ===
                        "rescheduled_by_doctor") && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-3">
                        <div className="flex items-center text-sm text-amber-800">
                          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>This appointment was rescheduled</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>Date</span>
                        </p>
                        <p
                          className={`text-sm font-medium mt-1 ${
                            data?.appointment?.appointment_status?.includes(
                              "rescheduled"
                            )
                              ? "line-through text-gray-400"
                              : ""
                          }`}
                        >
                          {data?.appointment?.appointment_date
                            ? formatAppointmentDate(
                                data.appointment.appointment_date
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Languages className="h-3.5 w-3.5" />
                          <span>Language Pref</span>
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {data?.appointment?.language_pref || (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Time</span>
                        </p>
                        <p
                          className={`text-sm font-medium mt-1 ${
                            data?.appointment?.appointment_status?.includes(
                              "rescheduled"
                            )
                              ? "line-through text-gray-400"
                              : ""
                          }`}
                        >
                          {data?.appointment?.start_time &&
                          data?.appointment?.end_time
                            ? `${formatTime(
                                data.appointment.start_time
                              )} - ${formatTime(data.appointment.end_time)}`
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5" />
                          <span>Gender Pref.</span>
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {data?.appointment?.gender_pref || (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={joinMeeting}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                        data?.appointment?.appointment_status?.includes(
                          "rescheduled"
                        )
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-[#582768] hover:bg-[#6a3085]"
                      }`}
                    >
                      <Video className="h-5 w-5" />
                      <span>Start Video Consultation</span>
                    </button>

                    <div
                      className={`grid ${
                        doctor_flag !== "junior" ? "grid-cols-4" : "grid-cols-3"
                      } gap-2`}
                    >
                      <button
                        onClick={handleReschedule}
                        className={`flex flex-col items-center cursor-pointer justify-center p-2 rounded-lg border hover:bg-indigo-50 transition-colors ${
                          data?.appointment?.appointment_status?.includes(
                            "rescheduled"
                          )
                            ? "border-amber-300 text-amber-600 bg-amber-50"
                            : "border-gray-300 text-indigo-600 bg-white"
                        }`}
                        title="Reschedule"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="text-xs mt-1">Reschedule</span>
                      </button>

                      <button
                        onClick={() =>
                          handleReferral(data?.appointment.appointment_id)
                        }
                        className="flex flex-col cursor-pointer items-center justify-center p-2 bg-white text-blue-600 rounded-lg border border-gray-300 hover:bg-blue-50 transition-colors"
                        title="Refer"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="text-xs mt-1">Refer</span>
                      </button>

                      {doctor_flag !== "junior" && (
                        <button
                          onClick={handleFollowUp}
                          className="flex flex-col items-center cursor-pointer justify-center p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors group"
                          title="Schedule Follow Up"
                        >
                          <CalendarPlus className="h-4 w-4 text-purple-600 group-hover:text-purple-700" />
                          <span className="text-xs mt-1 text-purple-700">
                            Book again
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (
                            data?.appointment?.appointment_status ===
                            "completed"
                          ) {
                            showToast(
                              "This appointment has already been completed. No further actions can be taken.",
                              "error"
                            );
                            return;
                          }
                          setIsCompleteModalOpen(true);
                        }}
                        className="flex flex-col cursor-pointer items-center justify-center p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors group"
                        title="Confirm Appointment"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-600 group-hover:text-emerald-700" />
                        <span className="text-xs mt-1 text-emerald-700">
                          Complete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("assessment")}
                className={`py-4 px-6 text-center border-b-2 cursor-pointer font-medium text-sm ${
                  activeTab === "assessment"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Patient Assessment
              </button>
              <button
                onClick={() => setActiveTab("clinicalnotes")}
                className={`py-4 px-6 text-center border-b-2 cursor-pointer font-medium text-sm ${
                  activeTab === "clinicalnotes"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Clinical Notes
              </button>
              <button
                onClick={() => setActiveTab("prescription")}
                className={`py-4 px-6 text-center border-b-2 cursor-pointer font-medium text-sm ${
                  activeTab === "prescription"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Prescription
              </button>
            </nav>
          </div>

          {activeTab === "clinicalnotes" && data && (
            <ClinicalNotes
              errors={errors}
              observatioNote={observatioNote}
              setObservationNote={setObservationNote}
              currentObservatioNote={currentObservatioNote}
              showPreviousNotes={showPreviousNotes}
              setShowPreviousNotes={setShowPreviousNotes}
              submitClinicalNotes={submitClinicalNotes}
            />
          )}
          {activeTab === "assessment" && data && (
            <PatientAssessmentForm
              data={data}
              register={register}
              errors={errors}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
            />
          )}
          {activeTab === "prescription" && data && prescriptionData && (
            <PrescriptionForm
              refetchPrescription={refetchPrescription}
              setNotes={setNotes}
              notes={notes}
              selectedPatientId={selectedPatientId}
              data={data}
              prescription={prescription}
              errors2={errors2}
              handleChange={handleChange}
              handleSubmit2={handleSubmit2}
              setFollowUpAdvice={setFollowUpAdvice}
              followUpAdvice={followUpAdvice}
              handleSubmitFollowUp={handleSubmitFollowUp}
              investigation={investigation}
              setInvestigation={setInvestigation}
              handleAddInvestigation={handleAddInvestigation}
              prescriptionData={prescriptionData}
              handleSavePatientNotes={handleSavePatientNotes}
            />
          )}
        </div>
      </main>
      {showPreviousNotes && prescriptionData?.observation_notes && (
        <PreviousNotesModal
          onClose={() => setShowPreviousNotes(false)}
          notes={prescriptionData?.observation_notes}
        />
      )}
      {aid && (
        <WarningModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          aid={aid}
          title="Reschedule Appointment"
          disclaimer="You're about to reschedule this appointment. Please provide a reason for the change."
          confirmText="Reschedule"
        />
      )}

      {data && isCompleteModalOpen && (
        <CompleteAppointmentModal
          onClose={() => setIsCompleteModalOpen(false)}
          onSubmit={(reason: string) => {
            completeAppointment.mutate({ completed: true, reason: reason });
            setIsCompleteModalOpen(false);
          }}
          requiresReason={data?.nextbooked_or_refered}
        />
      )}
      <DoctorPatientChat />
      {!data && !prescriptionData && showLoading && <AppointmentLoading />}
      {data && openPatientModal && (
        <CoupleConsultationModal
          setOpen={setOpenPatientModal}
          patients={data?.patients}
          handleSelection={handleSelection}
        />
      )}
    </div>
  );
};

export default DoctorPatientAssessment;
