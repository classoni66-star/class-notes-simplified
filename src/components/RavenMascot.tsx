import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  size?: number;
  animated?: boolean;
}

export default function RavenMascot({ size = 80, animated = false }: Props) {
  const [phase, setPhase] = useState<"reading" | "looking">("reading");
  const [blinking, setBlinking] = useState(false);

  // Behaviour cycle:
  //   Reading (head bowed, eyes down) for 3 seconds
  //   Looking at student (head up, eyes forward) for 4 seconds with 2 blinks
  //   Repeat
  useEffect(() => {
    if (!animated) return;
    let mounted = true;

    const cycle = async () => {
      while (mounted) {
        // Phase 1 — reading for 3 seconds
        setPhase("reading");
        setBlinking(false);
        await new Promise((r) => setTimeout(r, 3000));
        if (!mounted) return;

        // Phase 2 — looking for 4 seconds with 2 blinks
        setPhase("looking");
        await new Promise((r) => setTimeout(r, 500));
        if (!mounted) return;

        // Blink 1
        setBlinking(true);
        await new Promise((r) => setTimeout(r, 150));
        if (!mounted) return;
        setBlinking(false);
        await new Promise((r) => setTimeout(r, 1400));
        if (!mounted) return;

        // Blink 2
        setBlinking(true);
        await new Promise((r) => setTimeout(r, 150));
        if (!mounted) return;
        setBlinking(false);
        await new Promise((r) => setTimeout(r, 1800));
        if (!mounted) return;
      }
    };

    cycle();
    return () => {
      mounted = false;
    };
  }, [animated]);

  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: "auto",
    display: "inline-block",
  };

  const isReading = phase === "reading";
  const pupilY = isReading ? 6 : 0;
  const headRotate = isReading ? 6 : 0;

  const svg = (
    <svg
      viewBox="0 0 240 320"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <radialGradient id="ravenBodyGrad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#4DA6FF" />
          <stop offset="60%" stopColor="#0055FF" />
          <stop offset="100%" stopColor="#0033AA" />
        </radialGradient>
        <linearGradient id="ravenCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0A1F44" />
          <stop offset="100%" stopColor="#001133" />
        </linearGradient>
        <linearGradient id="ravenBookGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0055FF" />
          <stop offset="100%" stopColor="#0033AA" />
        </linearGradient>
      </defs>

      {/* Feet */}
      <ellipse cx="88" cy="290" rx="14" ry="9" fill="#FF9900" />
      <ellipse cx="152" cy="290" rx="14" ry="9" fill="#FF9900" />

      {/* Body */}
      <ellipse cx="120" cy="215" rx="78" ry="82" fill="url(#ravenBodyGrad)" />

      {/* Belly */}
      <ellipse cx="120" cy="230" rx="48" ry="52" fill="#4DA6FF" />

      {/* Wings — rest at sides */}
      <ellipse cx="44" cy="210" rx="18" ry="44" fill="#0033CC" />
      <ellipse cx="196" cy="210" rx="18" ry="44" fill="#0033CC" />

      {/* Head group — tilts when reading */}
      <motion.g
        animate={{ rotate: headRotate }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ originX: "120px", originY: "185px" }}
      >
        {/* Head */}
        <circle cx="120" cy="115" r="68" fill="url(#ravenBodyGrad)" />

        {/* Graduation cap */}
        <polygon points="42,68 198,68 220,86 20,86" fill="url(#ravenCapGrad)" />
        <polygon points="72,48 168,48 192,68 48,68" fill="#0A1F44" />
        <rect x="86" y="82" width="68" height="14" rx="5" fill="#001133" />

        {/* Tassel */}
        <path
          d="M 42 84 Q 28 105 30 138"
          stroke="#FFD700"
          strokeWidth="5"
          fill="none"
        />
        <circle cx="30" cy="143" r="7" fill="#FFD700" />
        <rect x="25" y="148" width="10" height="24" rx="3" fill="#FFD700" />

        {/* Eye whites */}
        <circle cx="95" cy="120" r="24" fill="#FFFFFF" />
        <circle cx="145" cy="120" r="24" fill="#FFFFFF" />

        {/* Pupils — move down when reading */}
        <motion.g
          animate={{ y: pupilY }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <circle cx="95" cy="120" r="13" fill="#0A1F44" />
          <circle cx="145" cy="120" r="13" fill="#0A1F44" />
          <circle cx="99" cy="115" r="4" fill="#FFFFFF" />
          <circle cx="149" cy="115" r="4" fill="#FFFFFF" />
        </motion.g>

        {/* Eyelids — blink */}
        <motion.g
          animate={{ opacity: blinking ? 1 : 0 }}
          transition={{ duration: 0.08 }}
          style={{ pointerEvents: "none" }}
        >
          <ellipse cx="95" cy="120" rx="26" ry="26" fill="#0055FF" />
          <ellipse cx="145" cy="120" rx="26" ry="26" fill="#0055FF" />
        </motion.g>

        {/* Beak */}
        <polygon points="120,142 108,162 132,162" fill="#FFD700" />
        <polygon points="120,155 111,162 129,162" fill="#FF9900" />
      </motion.g>

      {/* Book — brighter when reading, dimmer when looking */}
      <motion.g
        animate={{
          opacity: isReading ? 1 : 0.35,
          y: isReading ? 0 : 8,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Book cover */}
        <path
          d="M 55 248 Q 55 236 70 236 L 170 236 Q 185 236 185 248 L 185 288 Q 185 296 170 296 L 70 296 Q 55 296 55 288 Z"
          fill="url(#ravenBookGrad)"
        />
        {/* Left page */}
        <path d="M 62 244 L 118 248 L 118 290 L 62 288 Z" fill="#F3F4F6" />
        {/* Right page */}
        <path d="M 178 244 L 122 248 L 122 290 L 178 288 Z" fill="#E5E7EB" />
        {/* Spine */}
        <line x1="120" y1="242" x2="120" y2="292" stroke="#0A1F44" strokeWidth="2" />
        {/* Tiny text lines on pages */}
        <line x1="72" y1="258" x2="112" y2="259" stroke="#B8BCC4" strokeWidth="1.5" />
        <line x1="72" y1="268" x2="112" y2="269" stroke="#B8BCC4" strokeWidth="1.5" />
        <line x1="72" y1="278" x2="106" y2="279" stroke="#B8BCC4" strokeWidth="1.5" />
        <line x1="128" y1="259" x2="168" y2="258" stroke="#B8BCC4" strokeWidth="1.5" />
        <line x1="128" y1="269" x2="168" y2="268" stroke="#B8BCC4" strokeWidth="1.5" />
        <line x1="128" y1="279" x2="162" y2="278" stroke="#B8BCC4" strokeWidth="1.5" />
      </motion.g>
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={wrapperStyle}
      >
        {svg}
      </motion.div>
    );
  }

  return <div style={wrapperStyle}>{svg}</div>;
      }
