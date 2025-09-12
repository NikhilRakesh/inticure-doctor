import { User, Users, X } from "lucide-react";
import { useState } from "react";

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

export default function CoupleConsultationModal({
  patients,
  setOpen,
  handleSelection,
}: {
  patients: Patient[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelection: (value: number | string) => void;
}) {
      const [selected, setSelected] = useState<string | number>("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900">
          Select Patient for Consultation
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose one patient or both for this couple’s consultation.
        </p>

        {/* Patient Options */}
        <div className="space-y-3 mt-5">
          {patients &&
            patients?.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelected(patient.id)}
                className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl border transition-all 
                ${
                  selected === patient.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <User className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-800">
                  {patient.first_name} {patient.last_name}
                </span>
              </button>
            ))}

          {/* Both Option */}
          <button
            onClick={() => setSelected("both")}
            className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl border transition-all 
              ${
                selected === "both"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
              }`}
          >
            <Users className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-800">Both Patients</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            disabled={!selected}
            onClick={() => {
              handleSelection(selected);
              setOpen(false);
            }}
            className={`px-4 py-2 rounded-lg text-white transition-colors
              ${
                selected
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
