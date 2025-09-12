import { X, AlertTriangle, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../context/ToastProvider";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { token_api } from "../../lib/api";
import { useAuthStore } from "../../features/Auth/authSlice";

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  disclaimer: string;
  confirmText?: string;
  cancelText?: string;
  aid: string;
}

export const WarningModal = ({
  isOpen,
  onClose,
  title = "Confirm Action",
  disclaimer = "This action cannot be undone. Please confirm you want to proceed.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  aid,
}: WarningModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  const rescheduleAppointment = useMutation({
    mutationKey: ["reschedule"],
    mutationFn: (data: string) =>
      token_api(accessToken)
        .post("doctor/reschedule/", { appointment: aid, reason: data })
        .then((res) => res.data),
    onSuccess: () => {
      setIsSubmitting(false);
      showToast("Appointment rescheduled successfully.", "success");
      navigate('/')
    },
    onError: () => {
      setIsSubmitting(false);
      showToast("Failed to add Follow-up Advice. Try again", "error");
    },
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    rescheduleAppointment.mutate(reason);
  };

  if (!isOpen) return null;

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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="mt-3 text-xl font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{disclaimer}</p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="reason"
              className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5"
            >
              <ClipboardList className="h-4 w-4 text-amber-600" />
              Reason for Action <span className="text-red-500">*</span>
            </label>

            <textarea
              id="reason"
              name="reason"
              rows={4}
              className="block w-full p-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm text-gray-800 placeholder-gray-400 transition-all duration-150"
              placeholder="Briefly explain the reason for this action (e.g. patient request, clinical judgement)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`px-4 py-2 cursor-pointer text-sm font-medium text-white bg-[#582768] rounded-md shadow-sm  ${
                isSubmitting || !reason.trim()
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
