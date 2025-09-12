import { useMutation } from "@tanstack/react-query";
import { useToast } from "../../context/ToastProvider";
import { useAuthStore } from "../../features/Auth/authSlice";
import PrescriptionPreview from "../Appointment/PrescriptionPreview";
import { motion } from "framer-motion";
import { CalendarCheck, ClipboardEdit, FlaskConical } from "lucide-react";
import { token_api } from "../../lib/api";
import { FiPlus } from "react-icons/fi";

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

interface PrescriptionForm {
  medication: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
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

interface AppointmentData {
  appointment: Appointment;
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
}

interface Prescription {
  medication: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
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

interface FollowUpAdvice {
  instructions: string;
}

interface Investigation {
  testName: string;
  instructions: string;
}

interface PrescriptionFormProbs {
  refetchPrescription: () => void;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  selectedPatientId: number;
  data: AppointmentData;
  prescription: Prescription;
  prescriptionData: PrescriptionData;
  errors2: { [key: string]: string };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit2: () => void;
  setFollowUpAdvice: React.Dispatch<React.SetStateAction<FollowUpAdvice>>;
  followUpAdvice: FollowUpAdvice;
  handleSubmitFollowUp: () => void;
  handleAddInvestigation: () => void;
  handleSavePatientNotes: () => void;
  investigation: Investigation;
  setInvestigation: React.Dispatch<React.SetStateAction<Investigation>>;
  notes: string;
}

const PrescriptionForm = ({
  refetchPrescription,
  setNotes,
  notes,
  selectedPatientId,
  data,
  prescription,
  errors2,
  handleChange,
  handleSubmit2,
  setFollowUpAdvice,
  followUpAdvice,
  handleSubmitFollowUp,
  investigation,
  setInvestigation,
  handleAddInvestigation,
  prescriptionData,
  handleSavePatientNotes,
}: PrescriptionFormProbs) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { showToast } = useToast();

  const deactivate_medicine = useMutation({
    mutationKey: ["deactivate_medicine"],
    mutationFn: (mid: number) =>
      token_api(accessToken)
        .post("doctor/deactivate_medicine/", {
          medicine_id: mid,
          customer: selectedPatientId,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Medicine deactivated successfully.", "success");
      refetchPrescription();
      setNotes("");
    },
    onError: () => {
      showToast("Failed to deactivate medicine. Try again", "error");
    },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-[#2d1335]">
              Add New Prescription
            </h3>
          </div>
        </div>

        {data.is_prescription_allowed && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Medication */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800 mb-2">
                  Medication
                </label>
                <input
                  type="text"
                  name="medication"
                  value={prescription.medication}
                  onChange={handleChange}
                  placeholder="e.g. Paracetamol"
                  className={`w-full rounded-md border text-sm px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors2.medication ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors2.medication && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors2.medication}
                  </p>
                )}
              </div>

              {/* Strength */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800 mb-2">
                  Strength
                </label>
                <input
                  type="text"
                  name="strength"
                  value={prescription.strength}
                  onChange={handleChange}
                  placeholder="e.g. 500mg"
                  className={`w-full rounded-md border text-sm px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors2.strength ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors2.strength && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors2.strength}
                  </p>
                )}
              </div>

              {/* Dosage */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={prescription.dosage}
                  onChange={handleChange}
                  placeholder="e.g. 1 tablet"
                  className={`w-full rounded-md border text-sm px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors2.dosage ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors2.dosage && (
                  <p className="text-xs text-red-500 mt-1">{errors2.dosage}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Frequency */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800 mb-2">
                  Frequency
                </label>
                <input
                  type="text"
                  name="frequency"
                  value={prescription.frequency}
                  onChange={handleChange}
                  placeholder="e.g. Twice a day"
                  className={`w-full rounded-md border text-sm px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors2.frequency ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors2.frequency && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors2.frequency}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={prescription.duration}
                  onChange={handleChange}
                  placeholder="e.g. 5 days"
                  className={`w-full rounded-md border text-sm px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors2.duration ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors2.duration && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors2.duration}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800 mb-2">
                  Instructions
                </label>
                <input
                  type="text"
                  name="instructions"
                  value={prescription.instructions}
                  onChange={handleChange}
                  placeholder="e.g. After meals"
                  className={`w-full rounded-md border text-sm px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors2.instructions ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors2.instructions && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors2.instructions}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleSubmit2}
                className="inline-flex cursor-pointer items-center gap-2 bg-[#582768] transition text-white px-5 py-2.5 text-sm font-medium rounded-md shadow"
              >
                <FiPlus className="h-4 w-4" />
                Add Prescription
              </button>
            </div>
          </div>
        )}

        {data.is_prescription_allowed && (
          <>
            {/* Follow-up Advice Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md mt-6">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 p-2 rounded-md mr-3">
                  <CalendarCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Follow-up Advice
                </h3>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  name="followUpAdvice"
                  value={followUpAdvice.instructions}
                  onChange={(e) =>
                    setFollowUpAdvice({
                      ...followUpAdvice,
                      instructions: e.target.value,
                    })
                  }
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 text-sm px-4 py-2 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter follow-up instructions for the patient"
                />
              </div>

              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitFollowUp}
                  className="inline-flex items-center px-5 py-2.5 bg-[#582768] cursor-pointer text-white text-sm font-medium rounded-md shadow-sm transition"
                >
                  Save Follow-up Advice
                </button>
              </div>
            </div>

            {/* Investigations Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md mt-6">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 p-2 rounded-md mr-3">
                  <FlaskConical className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Investigations Advised
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={investigation.testName}
                    onChange={(e) =>
                      setInvestigation({
                        ...investigation,
                        testName: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 text-sm px-4 py-2 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. CBC, Lipid Profile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={investigation.instructions}
                    onChange={(e) =>
                      setInvestigation({
                        ...investigation,
                        instructions: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 text-sm px-4 py-2 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Fasting required"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={handleAddInvestigation}
                  className="inline-flex cursor-pointer items-center px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium rounded-md transition"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Another Test
                </button>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-xl shadow-md border border-gray-300 overflow-hidden mt-8">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <ClipboardEdit className="h-5 w-5 text-[#582768] mr-2" />
              Doctor's Notes
            </h3>
          </div>

          <div className="p-5">
            {prescriptionData?.patient_notes?.length === 0 ? (
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 outline-0 rounded-lg focus:ring-2 focus:ring-[#582768] focus:border-transparent transition-all"
                  rows={4}
                  placeholder="Enter your notes for the patient..."
                  autoFocus
                />
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSavePatientNotes}
                    disabled={!notes.trim()}
                    className={`px-6 py-2.5 cursor-pointer rounded-lg text-white font-medium transition-colors ${
                      !notes.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#582768] hover:bg-[#6a3180]"
                    }`}
                  >
                    Save Notes
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(prescriptionData?.patient_notes) &&
                  prescriptionData?.patient_notes?.length > 0 && (
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {prescriptionData?.patient_notes[0]?.note}
                    </div>
                  )}

                <div className="text-right">
                  <span className="text-xs text-gray-500">
                    Submitted on {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {prescriptionData &&
        (prescriptionData?.tests?.length > 0 ||
          prescriptionData?.medicine?.length > 0 ||
          prescriptionData?.followup_advices?.length > 0) && (
          <PrescriptionPreview
            prescription={prescriptionData}
            onSelectItem={(id: number) => {
              deactivate_medicine.mutate(id);
            }}
          />
        )}
    </div>
  );
};

export default PrescriptionForm;
