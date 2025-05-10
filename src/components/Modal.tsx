import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, children }: any) {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-800 p-6 mx-4 rounded shadow-lg w-full max-w-md"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()} // Evitar que el click dentro cierre el modal
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body // El modal será agregado al body directamente
  );
}