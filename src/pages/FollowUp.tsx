import { useEffect, useState } from "react";
import { DoctorReferralLoading } from "../components/Common/DoctorReferralLoading";
import { useLocation, useNavigate } from "react-router-dom";
import { SessionTypeSelector } from "../components/RefferDoctor/SessionTypeSelector";
import { useMutation } from "@tanstack/react-query";
import { token_api } from "../lib/api";
import { useAuthStore } from "../features/Auth/authSlice";
import FollowUpTimeSlots from "../components/FollowUp/FollowUpTimeSlots";
import { useToast } from "../context/ToastProvider";
import { ChevronLeft } from "lucide-react";

interface LanguageInfo {
  value: string;
  priority: number;
}

interface GenderInfo {
  value: string;
  priority: number;
}

interface SessionPreferences {
  specialization_id: number;
  language_info: LanguageInfo;
  gender_info: GenderInfo;
  date: string;
  is_couple: boolean;
  appointment_id: string | null;
}

interface Slot {
  start: string;
  end: string;
  available_doctors: number[];
  date?: string;
}

const FollowUp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const aid = searchParams.get("aid");
  const did = searchParams.get("did");
  const pid = searchParams.get("pid");
  const accessToken = useAuthStore((state) => state.accessToken);
  const [sessionPreferences, setSessionPreferences] =
    useState<SessionPreferences>({
      specialization_id: 0,
      language_info: {
        value: "",
        priority: 2,
      },
      gender_info: {
        value: "",
        priority: 1,
      },
      date: getCurrentDate(),
      is_couple: false,
      appointment_id: aid,
    });
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const { showToast } = useToast();
  const [patientIds, setPatientIds] = useState<number[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idsParam = params.get("patient_ids"); // "70,71"

    if (idsParam) {
      const ids = idsParam.split(",").map((id) => parseInt(id.trim(), 10));
      setPatientIds(ids);
    }
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  function getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  const handleBack = () => {
    if (currentStep === 0) {
      navigate(-1);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // const { data: specializations } = useQuery<Specialization[]>({
  //   queryKey: ["available-hours"],
  //   queryFn: () => {
  //     return token_api(accessToken)
  //       .get(`doctor/doctor_specializations/`)
  //       .then((res) => res.data);
  //   },
  // });

  const BookSlot = useMutation({
    mutationKey: ["doc_reffer_create_appointment"],
    mutationFn: (variables: {
      include_package: boolean;
      package_id?: number | null;
    }) =>
      token_api(accessToken)
        .post("doctor/create_appointment/", {
          appointment_id: aid,
          appointment_date: selectedDate,
          slot: selectedSlot,
          doctor: did,
          is_couple: sessionPreferences.is_couple,
          // specialization: selectedSpecialization?.specialization_id,
          followup: true,
          customers: patientIds,
          include_package: variables.include_package,
          package_id: variables?.package_id,
        })
        .then((res) => res.data),
    onSuccess: () => {
      navigate(-1);
    },
    onError: () => {
      showToast("Failed to assign slot", "error");
    },
  });

  const renderComponets = () => {
    switch (currentStep) {
      case 0:
        return (
          <SessionTypeSelector
            setCouplesConsultation={(value: boolean) =>
              setSessionPreferences((prev) => ({ ...prev, is_couple: value }))
            }
            nextStep={() => {
              // if (specializations && specializations.length === 1) {
              //   setCurrentStep(currentStep + 2);
              // } else {
              // }
              nextStep();
            }}
          />
        );
      // case 1:
      //   return (
      //     <FollowUpSpecializationSelector
      //       specializations={specializations}
      //       nextStep={nextStep}
      //       selectedSpecialization={selectedSpecialization}
      //       setSelectedSpecialization={setSelectedSpecialization}
      //     />
      //   );
      case 1:
        return (
          <FollowUpTimeSlots
            did={did}
            pid={pid}
            aid={aid}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            is_couple={sessionPreferences.is_couple}
            nextStep={(include_package: boolean, package_id?: number | null) =>
              BookSlot.mutate({ include_package, package_id })
            }
          />
        );

      default:
        return null;
    }
  };

  if (showLoading) {
    return <DoctorReferralLoading />;
  }
  return (
    <div className="mt-10">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-8 py-5 cursor-pointer text-sm font-medium rounded-lg transition-all duration-200"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" strokeWidth={2.5} />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
          Back
        </span>
      </button>
      {renderComponets()}
    </div>
  );
};

export default FollowUp;
