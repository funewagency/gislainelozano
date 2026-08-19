'use client';

import { motion } from 'framer-motion';
import { C } from './constants';

interface BioOverlayProps {
  name: string;
  role: string;
  isInView: boolean;
}

export function BioOverlay({ name, role, isInView }: BioOverlayProps) {
  return (
    <motion.div
      className="absolute bottom-4 left-6 right-6 border py-4 px-6 flex items-center justify-between z-10"
      style={{
        backgroundColor: "rgba(25,57,108,0.88)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(223,130,60,0.25)",
        boxShadow:
          "0 -8px 25px rgba(25,57,108,0.4), 0 4px 15px rgba(0,0,0,0.2)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 1 }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(25,57,108,0.95)" }}
    >
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 1.2 } }
        }}
      >
        <motion.p
          className="text-sm tracking-[0.15em]"
          style={{ fontFamily: 'var(--font-outfit)', color: C.white }}
          variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
        >
          {name}
        </motion.p>
        <motion.p
          className="text-[10px] uppercase tracking-[0.2em] mt-1"
          style={{ fontFamily: 'var(--font-jakarta)', color: C.accent }}
          variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
        >
          {role}
        </motion.p>
      </motion.div>
      <div className="w-8 h-8 flex items-center justify-center">
        <img src="/images/gislaine/logo-icon-only.png" alt="" className="w-8 h-8" />
      </div>
    </motion.div>
  );
}
