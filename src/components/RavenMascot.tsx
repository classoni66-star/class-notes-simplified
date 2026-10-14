import { motion } from 'framer-motion';

interface Props {
  size?: number;
  animated?: boolean;
}

export default function RavenMascot({ size = 80, animated = false }: Props) {
  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: 'auto',
    display: 'inline-block',
  };

  const svg = (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#4DA6FF" />
          <stop offset="60%" stopColor="#0055FF" />
          <stop offset="100%" stopColor="#0033AA" />
        </radialGradient>
      </defs>

      {/* Body */}
      <ellipse cx="100" cy="165" rx="72" ry="75" fill="url(#bodyGrad)" />

      {/* Belly */}
      <ellipse cx="100" cy="180" rx="44" ry="48" fill="#4DA6FF" />

      {/* Left wing */}
      <ellipse cx="32" cy="160" rx="16" ry="38" fill="#0033CC" />

      {/* Right wing */}
      <ellipse cx="168" cy="160" rx="16" ry="38" fill="#0033CC" />

      {/* Head */}
      <circle cx="100" cy="95" r="62" fill="url(#bodyGrad)" />

      {/* Graduation cap — mortarboard */}
      <polygon points="30,50 170,50 190,66 10,66" fill="#0A1F44" />
      <polygon points="58,32 142,32 165,50 35,50" fill="#1A3A7A" />
      <rect x="70" y="62" width="60" height="12" rx="4" fill="#0A1F44" />

      {/* Tassel */}
      <path d="M 30 62 Q 20 80 22 110" stroke="#FFD700" strokeWidth="4" fill="none" />
      <circle cx="22" cy="115" r="6" fill="#FFD700" />
      <rect x="18" y="120" width="8" height="22" rx="3" fill="#FFD700" />

      {/* Eye whites */}
      <circle cx="78" cy="100" r="22" fill="white" />
      <circle cx="122" cy="100" r="22" fill="white" />

      {/* Pupils — centered, looking straight at the student */}
      <circle cx="78" cy="100" r="12" fill="#0A1F44" />
      <circle cx="122" cy="100" r="12" fill="#0A1F44" />

      {/* Eye highlights */}
      <circle cx="82" cy="95" r="4" fill="white" />
      <circle cx="126" cy="95" r="4" fill="white" />

      {/* Beak */}
      <polygon points="100,120 88,138 112,138" fill="#FFD700" />
      <polygon points="100,132 91,138 109,138" fill="#FF9900" />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={wrapperStyle}
      >
        {svg}
      </motion.div>
    );
  }

  return <div style={wrapperStyle}>{svg}</div>;
        }
