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

  const Wrapper: any = animated ? motion.div : 'div';
  const wrapperProps: any = animated
    ? { animate: { y: [0, -4, 0] }, transition: { duration: 3, repeat: Infinity } }
    : {};

  return (
    <Wrapper {...wrapperProps} style={{ width: size, height: 'auto', display: 'inline-block' }}>
      <svg viewBox="0 0 200 265" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#4DA6FF" />
            <stop offset="60%" stopColor="#0055FF" />
            <stop offset="100%" stopColor="#0033AA" />
          </radialGradient>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A3A7A" />
            <stop offset="100%" stopColor="#0A1F44" />
          </linearGradient>
        </defs>

        {/* Legs */}
        <rect x="78" y="215" width="8" height="20" rx="3" fill="#FF9900" />
        <rect x="114" y="215" width="8" height="20" rx="3" fill="#FF9900" />

        {/* Feet with toes */}
        <ellipse cx="72" cy="240" rx="15" ry="8" fill="#FF9900" />
        <ellipse cx="128" cy="240" rx="15" ry="8" fill="#FF9900" />
        <path d="M 60 240 L 54 245 M 60 240 L 54 235" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 140 240 L 146 245 M 140 240 L 146 235" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" />

        {/* Left wing — waves when animated */}
        <motion.g
          animate={animated ? { rotate: [0, -25, 0] } : {}}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '42px', originY: '155px' }}
        >
          <path d="M 42 140 Q 12 130 8 100 Q 25 120 48 130 Z" fill="#0033AA" />
        </motion.g>

        {/* Right wing */}
        <path d="M 158 140 Q 188 130 192 100 Q 175 120 152 130 Z" fill="#0033AA" />

        {/* Body */}
        <ellipse cx="100" cy="175" rx="72" ry="75" fill="url(#bodyGrad)" />

        {/* Belly */}
        <ellipse cx="100" cy="185" rx="44" ry="48" fill="#4DA6FF" />

        {/* Head */}
        <circle cx="100" cy="100" r="62" fill="url(#bodyGrad)" />

        {/* Graduation cap — mortarboard (real, belongs to Raven) */}
        <polygon points="30,55 170,55 190,72 10,72" fill="url(#capGrad)" />
        <polygon points="58,35 142,35 165,55 35,55" fill="#1A3A7A" />
        <rect x="70" y="65" width="60" height="14" rx="4" fill="#0A1F44" />
        {/* Cap highlight */}
        <polygon points="35,55 165,55 170,58 30,58" fill="#4DA6FF" opacity="0.4" />

        {/* Tassel */}
        <path d="M 30 65 Q 15 85 22 115" stroke="#FFD700" strokeWidth="5" fill="none" />
        <circle cx="22" cy="120" r="7" fill="#FFD700" />
        <rect x="17" y="125" width="10" height="22" rx="4" fill="#FFD700" />

        {/* Eyes — looking directly at student */}
        <circle cx="78" cy="105" r="22" fill="white" />
        <circle cx="122" cy="105" r="22" fill="white" />
        <circle cx="78" cy="105" r="12" fill="#0A1F44" />
        <circle cx="122" cy="105" r="12" fill="#0A1F44" />
        <circle cx="82" cy="100" r="4" fill="white" />
        <circle cx="126" cy="100" r="4" fill="white" />

        {/* Eyelids — blink */}
        <motion.g animate={{ opacity: blink ? 1 : 0 }} transition={{ duration: 0.1 }}>
          <circle cx="78" cy="105" r="24" fill="#0055FF" />
          <circle cx="122" cy="105" r="24" fill="#0055FF" />
        </motion.g>

        {/* Smiling open beak */}
        <path d="M 100 125 Q 85 125 82 137 Q 100 140 118 137 Q 115 125 100 125 Z" fill="#FFD700" />
        <path d="M 85 137 Q 100 155 115 137 Q 100 145 85 137 Z" fill="#FF9900" />
        {/* Tongue — the smile */}
        <ellipse cx="100" cy="144" rx="8" ry="5" fill="#FF6699" />
      </svg>
    </Wrapper>
  );
}
