import { useState } from "react";
import {
  Upload,
  FileText,
  Calendar,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { baseurl, get_api_form, token_api } from "../../lib/api";
import { useToast } from "../../context/ToastProvider";
import { useAuthStore } from "../../features/Auth/authSlice";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

interface FileItem {
  id: number;
  common_file: string;
  file_name: string | null;
  uploaded_on: string;
  appointment: number;
}

interface PatientFileUploaderProbs {
  patientFiles: FileItem[];
  aid: string | null;
}

export default function PatientFileUploader({
  patientFiles,
  aid,
}: PatientFileUploaderProbs) {
  const [note, setNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"doctor" | "patient">(
    patientFiles?.length !== 0 ? "patient" : "doctor"
  );
  const accessToken = useAuthStore((state) => state.accessToken);
  const { showToast } = useToast();

  const uploadFiles = useMutation({
    mutationKey: ["file_upload"],
    mutationFn: (file: File) =>
      get_api_form(accessToken)
        .post("general/file_upload/", {
          common_file: file,
          appointment_id: aid,
          file_name: note,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast("File has been uploaded successfully.", "success");
      refetch();
      setSelectedFile(null);
      setNote("");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.error || "Something went wrong",
          "error"
        );
      } else {
        showToast("An unexpected error occurred", "error");
      }
    },
  });

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadFiles.mutate(selectedFile);
  };

  const { data, refetch } = useQuery<FileItem[]>({
    queryKey: ["patient_files"],
    queryFn: () => {
      return token_api(accessToken)
        .get(`doctor/patient_files/?appointment_id=${aid}`)
        .then((res) => {
          return res.data;
        });
    },
  });

  const renderFileCard = (file: FileItem) => {
    const displayName = file.file_name || `File`;
    const formattedDate = new Date(file.uploaded_on).toLocaleDateString();
    return (
      <div
        key={file.id}
        className="flex items-start justify-between rounded-xl border border-gray-200 bg-white shadow-sm p-4 hover:shadow-md transition"
      >
        <div className="flex items-start space-x-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{displayName}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {formattedDate}
            </div>
          
          </div>
        </div>

        <a
          href={baseurl + file.common_file}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition"
        >
          View
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    );
  };

  return (
    <div className="w-full p-5 space-y-6">
      <div className="flex border-b border-gray-200">
        {patientFiles?.length !== 0 && (
          <button
            onClick={() => setActiveTab("patient")}
            className={`px-4 py-2 cursor-pointer text-sm font-medium ${
              activeTab === "patient"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            Patient Uploaded Files
          </button>
        )}
        <button
          onClick={() => setActiveTab("doctor")}
          className={`px-4 py-2 cursor-pointer text-sm font-medium ${
            activeTab === "doctor"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-indigo-600"
          }`}
        >
          Doctor Uploaded Files
        </button>
      </div>

      {/* Doctor Upload Section */}
      {activeTab === "doctor" && (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upload File for Patient
            </h2>

            <div className="space-y-4">
              {/* File Input */}
              <label className="flex items-center justify-center w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg py-8 hover:border-indigo-400 transition">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag & drop
                  </p>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-indigo-600 font-medium">
                      {selectedFile.name}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {/* Message Box */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
                  Message regarding this file
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Eg. Patient scan report explanation..."
                  className="w-full border rounded-lg border-gray-200 shadow-sm outline-0 focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-3 py-2.5 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Upload Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center ${
                    selectedFile
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </button>
              </div>
            </div>
          </div>

          {/* Doctor Uploaded Files */}
          <div className="space-y-4">
            {data && data?.length > 0 ? (
              data?.map(renderFileCard)
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No files uploaded yet.
              </p>
            )}
          </div>
        </>
      )}

      {/* Patient Uploaded Files */}
      {activeTab === "patient" && (
        <div className="space-y-4">
          {patientFiles.length > 0 ? (
            patientFiles.map(renderFileCard)
          ) : (
            <p className="text-sm text-gray-500 text-center">
              No patient files available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
