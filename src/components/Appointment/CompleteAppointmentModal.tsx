import { X, CheckCircle, ClipboardList, AlertCircle } from "lucide-react";
import { useState } from "react";

interface CompleteAppointmentModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
  requiresReason: boolean;
}

export const CompleteAppointmentModal = ({
  onClose,
  onSubmit,
  requiresReason,
}: CompleteAppointmentModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm transition-opacity">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-3 text-xl font-bold text-gray-900">
              Complete Appointment
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Please confirm completion of this consultation
            </p>
          </div>

          {!requiresReason && (
            <div className="mt-5">
              <label
                htmlFor="reason"
                className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <ClipboardList className="h-4 w-4 text-amber-500" />
                <span>Consultation Summary</span>
                <span className="text-xs text-amber-600 ml-auto flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Required
                </span>
              </label>
              <div className="mt-4">
                <div className="relative">
                  <textarea
                    id="reason"
                    name="reason"
                    rows={4}
                    className="block w-full rounded-md border border-gray-300 shadow-sm outline-0 focus:border-amber-500 focus:ring-amber-500 text-sm px-3 py-2"
                    placeholder="Briefly summarize the consultation..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <p className="mt-1 text-xs text-amber-600">
                This helps us maintain quality care records when no follow-up or
                referral was created.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r cursor-pointer from-[#6d2b8a] to-[#9d4edd] hover:from-[#5a1e6b] hover:to-[#7d3c98] rounded-md shadow-sm ${
                (!requiresReason && !reason.trim()) || isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleSubmit}
              disabled={(!requiresReason && !reason.trim()) || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Appointment
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
