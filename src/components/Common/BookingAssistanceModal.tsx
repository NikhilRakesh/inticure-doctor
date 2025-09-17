import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MessageCircle, Mail, Sparkles } from "lucide-react";

const BookingAssistanceModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#F0E8F2]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6A1B78] to-[#8A56AC] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 cursor-pointer right-4 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Booking Assistance Required
              </h2>
              <p className="text-white/80 text-sm">
                Personalized booking support available
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F9F5FF] to-[#F0E8F2] rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-[#6A1B78]" />
            </div>

            <h3 className="text-xl font-semibold text-[#1e0a2c] mb-4">
              Booking Assistance Required
            </h3>
            <p className="text-[#6d2b8a]/80 mb-8 max-w-sm mx-auto leading-relaxed">
              This appointment requires personalized booking. Please contact our
              team for assistance.
            </p>

            <div className="space-y-4">
              {/* WhatsApp Button */}
              <motion.a
                href="https://wa.me/919778385292"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg group cursor-pointer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                Contact via WhatsApp
                <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>

              {/* Email Button */}
              <motion.a
                href="mailto:wecare@inticure.com"
                className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#6A1B78] to-[#8A56AC] text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg group cursor-pointer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-5 h-5 mr-3" />
                Contact via Email
                <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingAssistanceModal;
