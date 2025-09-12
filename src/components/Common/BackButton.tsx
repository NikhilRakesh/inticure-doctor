import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-4 py-5 cursor-pointer text-sm font-medium rounded-lg transition-all duration-200"
    >
      <ChevronLeft className="h-5 w-5 text-gray-700" strokeWidth={2.5} />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
        Back
      </span>
    </button>
  );
};

export default BackButton;