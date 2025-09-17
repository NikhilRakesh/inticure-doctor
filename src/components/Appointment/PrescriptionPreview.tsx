import React, { useState } from "react";
import {
  Pill,
  FlaskConical,
  User,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

interface FollowupNote {
  id: number;
  note: string;
  doctor: string;
  date: string;
}

interface Test {
  id: number;
  test_name: string;
  instruction: string;
  created_at: string;
  updated_at: string;
  customer: number;
  doctor: number;
  appointment: number;
}

interface Medicine {
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

interface PatientNote {
  id: number;
  note: string;
  created_at: string;
  updated_at: string;
  customer: number;
  doctor: number;
  appointment: number;
}

interface FileItem {
  id: number;
  common_file: string;
  file_name: string | null;
  uploaded_on: string;
  appointment: number;
}

interface MedicalData {
  tests: Test[];
  medicine: Medicine[];
  patient_notes: PatientNote[];
  patient_first_name: string;
  patient_last_name: string;
  files: FileItem[];
  followup_advices: FollowupNote[];
}

const PrescriptionPreview: React.FC<{
  prescription: MedicalData;
  onSelectItem: (id: number) => void;
}> = ({ prescription, onSelectItem }) => {
  const [showActiveMeds, setShowActiveMeds] = useState<boolean>(true);

  if (!prescription) return null;

  const activeMeds = prescription.medicine?.filter((med) => med?.is_active);
  const inactiveMeds = prescription.medicine?.filter((med) => !med?.is_active);

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="mb-8 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Prescription</h3>
          <p className="text-gray-600 mt-1">
            Patient:{" "}
            <span className="font-medium">
              {prescription.patient_first_name} {prescription.patient_last_name}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This section displays the patient's current prescription. Any new
            medications you add will appear here as well. To remove a medication
            from the active list, click <strong>"Mark Inactive"</strong>.
          </p>
        </div>
      </div>

      {/* Wrapper Card */}
      <div className="bg-white rounded-xl border border-gray-200  shadow-sm overflow-hidden">
        {/* Medications Section */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-indigo-600" />
            Medications
          </h4>

          {/* Tabs */}
          <div className="flex mb-4 border-b border-gray-200">
            <button
              onClick={() => setShowActiveMeds(true)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors 
                ${
                  showActiveMeds
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Active {activeMeds?.length > 0 && `(${activeMeds.length})`}
            </button>
            <button
              onClick={() => setShowActiveMeds(false)}
              disabled={inactiveMeds?.length === 0}
              className={`ml-4 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  !showActiveMeds
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }
                ${
                  inactiveMeds?.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
            >
              In Active {inactiveMeds?.length > 0 && `(${inactiveMeds.length})`}
            </button>
          </div>

          {/* Active Meds */}
          {activeMeds?.length > 0 && showActiveMeds && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              {activeMeds.map((med) => (
                <div
                  key={med.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-900">
                        {med.medicine_name}
                      </h5>
                      <p className="text-gray-600 text-sm">{med.strength}</p>
                    </div>
                    <button
                      onClick={() => onSelectItem(med.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Mark Inactive
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <InfoBox label="Dosage" value={med.dosage} />
                    <InfoBox label="Frequency" value={med.frequency} />
                    <InfoBox label="Duration" value={med.duration} />
                  </div>
                  {med.instruction && (
                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">Instruction:</span>{" "}
                      {med.instruction}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <User className="h-3 w-3" /> Doctor #{med.doctor} •{" "}
                    {formatDateTime(med.created_at)}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Past Meds */}
          {inactiveMeds?.length > 0 && !showActiveMeds && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              {inactiveMeds.map((med) => (
                <div
                  key={med.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-800">
                        {med.medicine_name}
                      </h5>
                      <p className="text-gray-600 text-sm">{med.strength}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                      <Clock className="h-3 w-3" /> Completed
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <InfoBox label="Dosage" value={med.dosage} />
                    <InfoBox label="Frequency" value={med.frequency} />
                    <InfoBox label="Duration" value={med.duration} />
                  </div>
                  {med.instruction && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Instruction:</span>{" "}
                      {med.instruction}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <User className="h-3 w-3" /> Doctor #{med.doctor} •{" "}
                    {formatDateTime(med.created_at)}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Tests */}
        {prescription.tests?.length > 0 && (
          <Section
            title="Recommended Tests"
            icon={<FlaskConical className="h-5 w-5  text-indigo-600" />}
          >
            {prescription.tests.map((test) => (
              <div
                key={test.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <h5 className="font-medium text-gray-900">{test.test_name}</h5>
                {test.instruction && (
                  <p className="text-sm text-gray-600 mt-1">
                    {test.instruction}
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Follow-up */}
        {prescription.followup_advices?.length > 0 && (
          <Section
            title="Follow-up Instructions"
            icon={<FileText className="h-5 w-5 text-indigo-600" />}
          >
            {prescription.followup_advices.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <p className="text-gray-700">{note.note}</p>
              </div>
            ))}
          </Section>
        )}

        {/* Patient Notes */}
        {/* {prescription.patient_notes?.length > 0 && (
          <Section
            title="Patient Notes"
            icon={<MessageCircle className="h-5 w-5 text-indigo-600" />}
          >
            {prescription.patient_notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <p className="text-gray-700">{note.note}</p>
              </div>
            ))}
          </Section>
        )} */}
      </div>
    </div>
  );
};

/* Helper reusable card section */
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="p-6 border-t border-gray-200">
    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      {icon}
      {title}
    </h4>
    <div className="grid gap-3">{children}</div>
  </div>
);

/* InfoBox for dosage/frequency/duration */
const InfoBox: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200">
    <span className="text-gray-500 block text-xs mb-1">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

export default PrescriptionPreview;
