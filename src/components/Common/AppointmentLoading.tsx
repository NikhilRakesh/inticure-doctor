"use client";
import { motion } from "framer-motion";
import { User, Calendar, Clock, Stethoscope } from "lucide-react";

const nodes = [
  { icon: <User className="h-5 w-5 text-white" />, delay: 0, label: "Patient" },
  { icon: <Calendar className="h-5 w-5 text-white" />, delay: 0.6, label: "Date" },
  { icon: <Clock className="h-5 w-5 text-white" />, delay: 1.2, label: "Time" },
  { icon: <Stethoscope className="h-5 w-5 text-white" />, delay: 1.8, label: "Doctor" },
];

const   AppointmentLoading = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white via-[#fbf3f6] to-[#f5e9f0] backdrop-blur-xl z-50 flex items-center justify-center overflow-hidden">
      <motion.div
        className="relative w-[320px] h-[320px] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Central Orb */}
        <motion.div
          className="w-28 h-28 rounded-full bg-gradient-to-br from-[#5a1e6b] to-[#a64d79] shadow-2xl flex items-center justify-center text-white"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="font-light tracking-wide text-sm">Appointment</p>
        </motion.div>

        {/* Floating Data Nodes */}
        {nodes.map((node, i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-[#a64d79] to-[#5a1e6b] shadow-lg flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.5, 1.2, 0.8, 0], 
              x: [Math.cos(i * 90) * 120, 0], 
              y: [Math.sin(i * 90) * 120, 0] 
            }}
            transition={{ 
              duration: 3, 
              delay: node.delay, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {node.icon}
          </motion.div>
        ))}
      </motion.div>

      {/* Text */}
      <motion.div
        className="absolute bottom-20 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h2 className="text-lg font-light text-gray-800">Preparing Appointment...</h2>
        <p className="text-sm text-gray-500 mt-2">Syncing patient • doctor • records</p>
      </motion.div>
    </div>
  );
};

export default AppointmentLoading;
