import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";

export const DoctorBookingLoading = () => {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-lg z-50 flex items-center justify-center">
      <motion.div
        className="text-center w-full max-w-sm px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.div
          className="relative mx-auto w-28 h-28 mb-8"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#5a1e6b] to-[#a64d79] rounded-full shadow-xl flex items-center justify-center">
            <HeartPulse className="h-12 w-12 text-white" />
          </div>
          <motion.div
            className="absolute bottom-0 left-1/2 w-16 h-4 bg-white/20 blur-md rounded-full"
            animate={{
              scaleX: [0.8, 1.2, 0.8],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ x: "-50%" }}
          />
        </motion.div>

        <motion.div className="overflow-hidden">
          <motion.h2
            className="text-2xl font-light text-gray-800 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Securing the Appointment
          </motion.h2>
          <motion.p
            className="text-gray-500 font-light mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            We're confirming the slot with the doctor
          </motion.p>
        </motion.div>

        <div className="relative h-px bg-gray-100 mb-10 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#5a1e6b] to-[#a64d79]"
            initial={{ width: 0 }}
            animate={{
              width: ["0%", "100%"],
              left: ["0%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: [0.83, 0, 0.17, 1],
            }}
            style={{ width: "30%" }}
          />
        </div>

        <motion.div
          className="text-xs text-gray-400 tracking-wider uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            className="inline-block"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            Verifying availability • Sending confirmation
          </motion.span>
        </motion.div>

        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-[#5a1e6b]/5 rounded-full"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 60 - 30],
              x: [0, Math.random() * 40 - 20],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
