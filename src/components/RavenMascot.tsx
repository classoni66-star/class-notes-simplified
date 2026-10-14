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
    <Wrapper {...wrapperProps} style={{ width: size, height: 'auto' }}>
      <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#4DA6FF"/>
            <stop offset="60%" stopColor="#0055FF"/>
            <stop offset="100%" stopColor="#0033AA"/>
          </radialGradient>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A3A7A"/>
            <stop offset="100%" stopColor="#0A1F44"/>
          </linearGradient>
        </defs>
        <ellipse cx="68" cy="228" rx="13" ry="8" fill="#FF9900"/>
        <ellipse cx="132" cy="228" rx="13" ry="8" fill="#FF9900"/>
        <ellipse cx="32" cy="155" rx="18" ry="42" fill="#0033AA"/>
        <ellipse cx="168" cy="155" rx="18" ry="42" fill="#0033AA"/>
        <ellipse cx="100" cy="155" rx="78" ry="82" fill="url(#bodyGrad)"/>
        <ellipse cx="100" cy="170" rx="48" ry="52" fill="#4DA6FF"/>
        <circle cx="100" cy="90" r="68" fill="url(#bodyGrad)"/>
        <polygon points="28,42 172,42 192,57 8,57" fill="url(#capGrad)"/>
        <polygon points="55,22 145,22 168,42 32,42" fill="#001166"/>
        <path d="M 22 52 Q 2 70 4 100" stroke="#FFD700" strokeWidth="4" fill="none"/>
        <circle cx="4" cy="105" r="7" fill="#FFD700"/>
        <path d="M -1 113 L 9 113 L 4 130 Z" fill="#FFD700"/>

        {/* Eyes - looking forward */}
        <circle cx="74" cy="90" r="24" fill="white"/>
        <circle cx="126" cy="90" r="24" fill="white"/>
        <circle cx="74" cy="90" r="14" fill="#001133"/>
        <circle cx="126" cy="90" r="14" fill="#001133"/>
        <circle cx="78" cy="85" r="5" fill="white"/>
        <circle cx="130" cy="85" r="5" fill="white"/>

        {/* Eyelids - animate on blink */}
        <motion.g
          animate={{ opacity: blink ? 1 : 0 }}
          transition={{ duration: 0.1 }}
        >
          <circle cx="74" cy="90" r="26" fill="#0055FF"/>
          <circle cx="126" cy="90" r="26" fill="#0055FF"/>
        </motion.g>

        <polygon points="100,108 87,128 113,128" fill="#FFD700"/>
        <polygon points="100,120 91,128 109,128" fill="#FF9900"/>
      </svg>
    </Wrapper>
  );
}
