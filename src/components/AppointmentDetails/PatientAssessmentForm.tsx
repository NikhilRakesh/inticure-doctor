import React from "react";
import {
  UserCircle,
  Ruler,
  Weight,
  AlertCircle,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import type {
  FieldErrors,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import LifestyleForm from "./LifestyleForm";

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

interface PatientAssessmentFormProps {
  data: AppointmentData;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  onSubmit: SubmitHandler<FormData>;
}

const PatientAssessmentForm: React.FC<PatientAssessmentFormProps> = ({
  data,
  register,
  errors,
  handleSubmit,
  onSubmit,
}) => {
  return (
    <div className="p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all hover:shadow-[0_6px_24px_rgba(79,70,229,0.1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 rounded-lg shadow-inner">
                <UserCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>
            </div>

            <div className="space-y-5 flex w-full gap-6">
              {/* Height Input with Unit Selection */}
              <div className="flex-1 max-w-xs">
                <label
                  htmlFor="height"
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <Ruler className="h-4 w-4 mr-2 text-gray-400" />
                  Height
                </label>
                <div className="flex gap-2">
                  <input
                    id="height"
                    type="number"
                    className={`block w-24 no-arrows border rounded-lg border-gray-200 shadow-sm outline-0 focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-3 py-2 transition-all ${
                      errors.height
                        ? "border-red-300 focus:border-red-300 focus:ring-red-200/50"
                        : ""
                    }`}
                    {...register("height", { required: true })}
                  />
                  <select
                    {...register("height_unit", { required: true })}
                    defaultValue="cm"
                    className="block w-20 border rounded-lg outline-0 border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-2 py-2 transition-all"
                  >
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
                {errors.height && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Height is required
                  </p>
                )}
              </div>

              {/* Weight Input with Unit Selection */}
              <div className="flex-1 max-w-xs">
                <label
                  htmlFor="weight"
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <Weight className="h-4 w-4 mr-2 text-gray-400" />
                  Weight
                </label>
                <div className="flex gap-2">
                  <input
                    id="weight"
                    type="number"
                    className={`block w-24 no-arrows border rounded-lg border-gray-200 shadow-sm outline-0 focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-3 py-2 transition-all ${
                      errors.weight
                        ? "border-red-300 focus:border-red-300 focus:ring-red-200/50"
                        : ""
                    }`}
                    {...register("weight", { required: true })}
                  />
                  <select
                    {...register("weight_unit", { required: true })}
                    defaultValue="kg"
                    className="block w-20 border rounded-lg border-gray-200 outline-0 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-2 py-2 transition-all"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
                {errors.weight && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Weight is required
                  </p>
                )}
              </div>
            </div>
          </div>
          <LifestyleForm />
          {/* Medical History Section */}
          <div className="bg-white rounded-xl shadow-md mt-5 border border-gray-200 p-6 transition-all hover:shadow-[0_6px_24px_rgba(79,70,229,0.1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 rounded-lg shadow-inner">
                <Stethoscope className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Medical History
              </h3>
            </div>

            {data?.extra_questions?.map((group, groupIndex) => {
              const fieldName = `extra_${groupIndex}`;
              return (
                <div key={groupIndex} className="mb-8">
                  <div className="mb-4">
                    <label className="text-sm pt-4 font-medium text-gray-700 mb-2 flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2 text-gray-400" />
                      {group.question}
                    </label>
                    <textarea
                      id={fieldName}
                      rows={4}
                      className="block w-full rounded-lg border outline-0 border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-4 py-2.5 transition-all"
                      {...register(fieldName as keyof FormData)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="px-5 cursor-pointer py-2.5 border border-transparent rounded-lg shadow-[0_2px_8px_rgba(79,70,229,0.3)] text-sm font-medium text-white bg-[#582768] hover:shadow-[0_4px_14px_rgba(79,70,229,0.4)] transition-all"
          >
            Complete Assessment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientAssessmentForm;
