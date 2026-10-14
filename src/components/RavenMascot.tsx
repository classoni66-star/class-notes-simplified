import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  size?: number;
  animated?: boolean;
}

export default function RavenMascot({ size = 80, animated = false }: Props) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, [animated]);

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? { animate: { y: [0, -4, 0] }, transition: { duration: 3, repeat: Infinity } }
    : {};


  return (
    <Wrapper {...wrapperProps} style={{ width: size, height: 'auto', display: 'inline-block' }}>
      <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
        {/* Feet */}
        <ellipse cx="72" cy="222" rx="11" ry="7" fill="#FF9900" />
        <ellipse cx="128" cy="222" rx="11" ry="7" fill="#FF9900" />

        {/* Left wing */}
        <ellipse cx="26" cy="160" rx="16" ry="38" fill="#0033CC" />
        
        {/* Right wing */}
        <ellipse cx="174" cy="160" rx="16" ry="38" fill="#0033CC" />

        {/* Body */}
        <ellipse cx="100" cy="165" rx="72" ry="75" fill="#0055FF" />

        {/* Belly */}
        <ellipse cx="100" cy="180" rx="44" ry="48" fill="#4DA6FF" />

        {/* Head */}
        <circle cx="100" cy="95" r="62" fill="#0055FF" />

        {/* Graduation cap — mortarboard */}
        <polygon points="30,50 170,50 190,66 10,66" fill="#0A1F44" />
        <polygon points="58,32 142,32 165,50 35,50" fill="#1A3A7A" />

        {/* Cap band */}
        <rect x="70" y="62" width="60" height="12" rx="4" fill="#0A1F44" />

        {/* Tassel cord */}
        <path d="M 30 62 Q 20 80 22 110" stroke="#FFD700" strokeWidth="4" fill="none" />
        {/* Tassel knot */}
        <circle cx="22" cy="115" r="6" fill="#FFD700" />
        {/* Tassel threads */}
        <rect x="18" y="120" width="8" height="22" rx="3" fill="#FFD700" />

        {/* Left eye white */}
        <circle cx="78" cy="100" r="22" fill="white" />
        {/* Right eye white */}
        <circle cx="122" cy="100" r="22" fill="white" />

        {/* Left pupil — centered so Raven looks directly at student */}
        <circle cx="78" cy="100" r="12" fill="#0A1F44" />
        {/* Right pupil — centered */}
        <circle cx="122" cy="100" r="12" fill="#0A1F44" />

        {/* Eye highlights */}
        <circle cx="82" cy="95" r="4" fill="white" />
        <circle cx="126" cy="95" r="4" fill="white" />

        {/* Eyelids — animate on blink */}
        <motion.g
          animate={{ opacity: blink ? 1 : 0 }}
          transition={{ duration: 0.1 }}
          style={{ pointerEvents: 'none' }}
        >
          <circle cx="78" cy="100" r="24" fill="#0055FF" />
          <circle cx="122" cy="100" r="24" fill="#0055FF" />
        </motion.g>

        {/* Beak — upper */}
        <polygon points="100,120 88,138 112,138" fill="#FFD700" />
        {/* Beak — lower */}
        <polygon points="100,132 91,138 109,138" fill="#FF9900" />
      </svg>
    </Wrapper>
  );
}
