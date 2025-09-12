import { NotepadText, PenLine } from "lucide-react";
import type { FieldErrors } from "react-hook-form";

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

interface ClinicalNotesProps {
  errors: FieldErrors<FormData>;
  observatioNote: string;
  setObservationNote: React.Dispatch<React.SetStateAction<string>>;
  currentObservatioNote: string[] | null;
  showPreviousNotes: boolean;
  setShowPreviousNotes: React.Dispatch<React.SetStateAction<boolean>>;
  submitClinicalNotes: () => void;
}

const ClinicalNotes = ({
  errors,
  observatioNote,
  setObservationNote,
  currentObservatioNote,
  showPreviousNotes,
  setShowPreviousNotes,
  submitClinicalNotes,
}: ClinicalNotesProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all hover:shadow-[0_6px_24px_rgba(79,70,229,0.1)]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-2 rounded-lg shadow-inner">
            <NotepadText className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Clinical Notes
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowPreviousNotes(true)}
          className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-800  flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg shadow-sm"
        >
          {showPreviousNotes ? "Hide" : "Show"} previous notes
        </button>
      </div>

      {currentObservatioNote && currentObservatioNote?.length > 0 && (
        <div className="space-y-4 mt-6 mb-3">
          {currentObservatioNote.map((note, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <span className=" text-xs font-bold">•</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {note}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <label
          htmlFor="observationNote"
          className="text-sm font-medium text-gray-700 mb-2 flex items-center"
        >
          <PenLine className="h-4 w-4 mr-2 text-gray-400" />
          Observations & Recommendations*{" "}
          <span className="ml-2 text-xs text-gray-500">
            (Not visible to patient)
          </span>
        </label>
        <textarea
          id="observationNote"
          rows={5}
          className={`block w-full rounded-lg outline-0 border border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-4 py-3 transition-all ${
            errors.observations
              ? "border-red-300 focus:border-red-300 focus:ring-red-200/50"
              : ""
          }`}
          value={observatioNote}
          placeholder="Document your clinical findings, diagnosis, and treatment plan..."
          onChange={(e) => {
            setObservationNote(e.target.value);
          }}
        />
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={submitClinicalNotes}
            className="px-5 cursor-pointer py-2.5 border border-transparent rounded-lg shadow-[0_2px_8px_rgba(79,70,229,0.3)] text-sm font-medium text-white bg-[#582768] hover:shadow-[0_4px_14px_rgba(79,70,229,0.4)] transition-all"
          >
            Submit Clinical Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalNotes;
