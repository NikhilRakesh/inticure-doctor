import { useForm } from "react-hook-form";
import { Wine, Cigarette, Pill } from "lucide-react";

const lifestyleOptions = ["Never", "Occasionally", "Frequently", "Daily"];

export default function LifestyleForm() {
  const { register } = useForm();

  const QuestionBlock = ({
    icon: Icon,
    label,
    name,
  }: {
    icon: React.ElementType;
    label: string;
    name: string;
  }) => (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start space-x-3">
        <div className="bg-purple-50 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {lifestyleOptions.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 border rounded-lg px-3 py-1.5 cursor-pointer hover:border-purple-500 transition"
              >
                <input
                  type="radio"
                  value={option}
                  {...register(name)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pt-5">
      <QuestionBlock
        icon={Wine}
        label="How often does the patient drink alcohol?"
        name="alcohol_use"
      />
      <QuestionBlock
        icon={Cigarette}
        label="How often does the patient smoke cigarettes?"
        name="smoking"
      />
      <QuestionBlock
        icon={Pill}
        label="How often does the patient use recreational drugs?"
        name="drug_use"
      />
    </div>
  );
}
