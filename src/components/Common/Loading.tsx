import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className=" fixed bg-white top-0 z-50 inset-0 border h-screen flex w-full items-center justify-center backdrop-blur-xs ">
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
          className="h-6 w-6 border-2 border-gray-800 border-t-transparent rounded-full"
        />

        <div className="text-center">
          <h3 className="text-base font-medium text-gray-800">Loading...</h3>
          <p className="text-sm text-gray-500">Please wait a moment</p>
        </div>
      </motion.div>
    </div>
  );
}
