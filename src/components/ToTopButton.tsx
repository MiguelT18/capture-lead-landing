import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion";

export default function ToTopButton({ children }: any) {
  const [visible, setVisible] = useState(false)

  const handleSlideToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener("scroll", handleScroll);
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={handleSlideToTop}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-1/2 z-50 bg-gray-800/80 backdrop-blur-sm text-white rounded-full px-6 py-3 shadow-lg transform translate-x-1/2 hover:bg-gray-700 cursor-pointer flex gap-2 items-center"
        >
          {children}
          Ir arriba
        </motion.button>
      )}
    </AnimatePresence>
  )
}