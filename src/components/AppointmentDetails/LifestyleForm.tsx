import { type UseFormRegister } from "react-hook-form";
import { Wine } from "lucide-react";

interface HabitualQuestionOption {
  id: number;
  option: string;
  question: number;
  is_selected: boolean;
}

interface HabitualQuestion {
  id: number;
  question: string;
  answer_type: "radio_select";
  customer_gender: "male" | "female" | "other";
  category: number;
  options: HabitualQuestionOption[];
}

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

export default function LifestyleForm({
  habitual_questions,
  register,
}: {
  habitual_questions: HabitualQuestion[];
  register: UseFormRegister<FormData>;
}) {
  const QuestionBlock = ({
    icon: Icon,
    habitual_question,
  }: {
    icon: React.ElementType;
    habitual_question: HabitualQuestion;
  }) => (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-300 p-6">
      {/* Icon + Question */}
      <div className="flex items-start space-x-4">
        <div className="bg-gradient-to-tr from-purple-100 to-purple-50 p-3 rounded-xl shadow-inner">
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-gray-900 leading-relaxed">
            {habitual_question.question}
          </p>

          {/* Options */}
          <div className="flex flex-wrap gap-3 mt-4">
            {habitual_question.options.map((option) => {
              const fieldName = `habitual_${habitual_question.id}`;
              return (
                <label
                  key={option.id}
                  className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm text-sm cursor-pointer transition-all hover:border-purple-400 hover:shadow-md peer-checked:border-purple-600 peer-checked:bg-purple-50"
                >
                  <input
                    id={fieldName}
                    type="radio"
                    value={option.id}
                    {...register(fieldName as keyof FormData)}
                    className="text-purple-600 focus:ring-purple-500 accent-purple-600"
                  />
                  <span className="text-gray-700">{option.option}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pt-5">
      {habitual_questions?.map((habitual_question) => (
        <QuestionBlock
          key={habitual_question.id}
          icon={Wine}
          habitual_question={habitual_question}
        />
      ))}
    </div>
  );
}
