import { useEffect, useState } from "react";
import { DoctorReferralLoading } from "../components/Common/DoctorReferralLoading";
import { SessionTypeSelector } from "../components/RefferDoctor/SessionTypeSelector";
import { SpecializationSelector } from "../components/RefferDoctor/SpecializationSelector";
import { PreferencePrioritySelector } from "../components/RefferDoctor/PreferencePrioritySelector";
import { DoctorList } from "../components/RefferDoctor/DoctorList";
import { useLocation, useNavigate } from "react-router-dom";

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

const RefferDoctor = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const appointmentId = searchParams.get("appointment_id");
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
      date: getTomorrowDate(),
      is_couple: false,
      appointment_id: appointmentId,
    });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  function getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  const renderComponets = () => {
    switch (currentStep) {
      case 0:
        return (
          <SpecializationSelector
            onSelect={(value: number) =>
              setSessionPreferences((prev) => ({
                ...prev,
                specialization_id: value,
              }))
            }
            selectedSpecialization={sessionPreferences.specialization_id}
            nextStep={nextStep}
            nextNextStep={()=> setCurrentStep(currentStep + 2)}
          />
        );
      case 1:
        return (
          <SessionTypeSelector
            setCouplesConsultation={(value: boolean) =>
              setSessionPreferences((prev) => ({ ...prev, is_couple: value }))
            }
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <PreferencePrioritySelector
            onSubmit={(prefs) => {
              setSessionPreferences((prev) => ({
                ...prev,
                ...prefs,
              }));
              nextStep();
            }}
          />
        );
      case 3:
        return (
          <DoctorList
            sessionPreferences={sessionPreferences}
            appointment_id={appointmentId}
            selectedSpecialization={sessionPreferences.specialization_id}
            is_couple={sessionPreferences.is_couple}
          />
        );

      default:
        return null;
    }
  };

  if (!appointmentId) {
    navigate("/");
  }

  if (showLoading) {
    return <DoctorReferralLoading />;
  }

  return <div>{renderComponets()}</div>;
};

export default RefferDoctor;
