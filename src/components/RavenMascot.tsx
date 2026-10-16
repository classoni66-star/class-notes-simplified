import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  size?: number;
  animated?: boolean;
}

export default function RavenMascot({ size = 80, animated = false }: Props) {
  const [phase, setPhase] = useState<"reading" | "looking">("reading");
  const [blinking, setBlinking] = useState(false);

  // Cycle: reading 3s → looking 4s with 2 blinks → repeat
  useEffect(() => {
    if (!animated) return;
    let mounted = true;

    const cycle = async () => {
      while (mounted) {
        setPhase("reading");
        setBlinking(false);
        await new Promise((r) => setTimeout(r, 3000));
        if (!mounted) return;

        setPhase("looking");
        await new Promise((r) => setTimeout(r, 500));
        if (!mounted) return;

        setBlinking(true);
        await new Promise((r) => setTimeout(r, 150));
        if (!mounted) return;
        setBlinking(false);
        await new Promise((r) => setTimeout(r, 1400));
        if (!mounted) return;

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
  const headRotate = isReading ? 4 : 0;

  const svg = (
    <svg
      viewBox="0 0 400 560"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="owl-title owl-description"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title id="owl-title">Classoni Learning Raven</title>
      <desc id="owl-description">
        A friendly blue raven looking directly at the viewer, wearing a graduation cap and holding an open book.
      </desc>

      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#16B8FF" />
          <stop offset="55%" stopColor="#0864F5" />
          <stop offset="100%" stopColor="#073DBB" />
        </radialGradient>

        <radialGradient id="bellyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#8FD5FF" />
          <stop offset="100%" stopColor="#4DA6FF" />
        </radialGradient>

        <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0755DB" />
          <stop offset="100%" stopColor="#06228A" />
        </linearGradient>

        <linearGradient id="capHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00B8FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00B8FF" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="irisGrad" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#16B8FF" />
          <stop offset="70%" stopColor="#087FF5" />
          <stop offset="100%" stopColor="#06228A" />
        </radialGradient>

        <linearGradient id="beakUpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFC928" />
          <stop offset="100%" stopColor="#FFB51B" />
        </linearGradient>

        <linearGradient id="beakDownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB51B" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>

        <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0750C9" />
          <stop offset="100%" stopColor="#06228A" />
        </linearGradient>

        <linearGradient id="footGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFC928" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>

        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0864F5" />
          <stop offset="100%" stopColor="#073DBB" />
        </linearGradient>
      </defs>

      {/* FEET */}
      <ellipse cx="160" cy="530" rx="24" ry="13" fill="url(#footGrad)" />
      <ellipse cx="240" cy="530" rx="24" ry="13" fill="url(#footGrad)" />
      <circle cx="146" cy="532" r="5" fill="#FF8C00" opacity="0.4" />
      <circle cx="174" cy="532" r="5" fill="#FF8C00" opacity="0.4" />
      <circle cx="226" cy="532" r="5" fill="#FF8C00" opacity="0.4" />
      <circle cx="254" cy="532" r="5" fill="#FF8C00" opacity="0.4" />

      {/* BODY */}
      <ellipse cx="200" cy="375" rx="145" ry="155" fill="url(#bodyGrad)" />

      {/* BELLY */}
      <ellipse cx="200" cy="410" rx="80" ry="95" fill="url(#bellyGrad)" opacity="0.85" />

      {/* WINGS (on either side, behind book) */}
      <ellipse cx="62" cy="390" rx="34" ry="78" fill="url(#wingGrad)" />
      <ellipse cx="338" cy="390" rx="34" ry="78" fill="url(#wingGrad)" />
      {/* subtle wing shadows */}
      <ellipse cx="62" cy="440" rx="26" ry="30" fill="#06228A" opacity="0.3" />
      <ellipse cx="338" cy="440" rx="26" ry="30" fill="#06228A" opacity="0.3" />

      {/* HEAD GROUP — rotates slightly when reading */}
      <motion.g
        animate={{ rotate: headRotate }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ originX: "200px", originY: "300px" }}
      >
        {/* HEAD SHAPE — large rounded dome */}
        <circle cx="200" cy="190" r="140" fill="url(#bodyGrad)" />

        {/* Side cheek fluff */}
        <path d="M 68 200 Q 50 195 55 215 Q 65 220 75 215 Z" fill="#0864F5" />
        <path d="M 332 200 Q 350 195 345 215 Q 335 220 325 215 Z" fill="#0864F5" />

        {/* GRADUATION CAP — mortarboard */}
        <g id="cap">
          {/* Mortarboard board (wide diamond, viewed frontally) */}
          <polygon
            points="40,105 200,78 360,105 340,132 200,152 60,132"
            fill="url(#capGrad)"
          />
          {/* Cyan highlight on upper edge */}
          <polygon
            points="40,105 200,78 360,105 200,118"
            fill="url(#capHighlight)"
          />
          {/* Crown band hugging head */}
          <path
            d="M 105 130 Q 200 105 295 130 L 300 165 Q 200 140 100 165 Z"
            fill="#06228A"
          />
          {/* Crown top */}
          <ellipse cx="200" cy="122" rx="98" ry="18" fill="#0755DB" />
        </g>

        {/* TASSEL — hangs on viewer's left */}
        <path
          d="M 48 118 Q 30 145 42 185"
          stroke="#FFC928"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="42" cy="190" r="8" fill="#FFC928" />
        <rect x="36" y="196" width="12" height="28" rx="4" fill="#FFC928" />
        {/* Strands */}
        <path d="M 38 224 Q 34 245 38 262" stroke="#FFB51B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 44 224 Q 44 247 45 264" stroke="#FFC928" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 50 224 Q 54 245 51 262" stroke="#FFB51B" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* EYEBROW TUFTS */}
        <path
          d="M 105 148 Q 125 132 160 138"
          stroke="#16B8FF"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 295 148 Q 275 132 240 138"
          stroke="#16B8FF"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />

        {/* LEFT EYE */}
        <g id="left-eye">
          {/* Eye white */}
          <ellipse cx="145" cy="200" rx="46" ry="48" fill="#F7FAFF" />
          {/* Iris + pupil (group moves down when reading) */}
          <motion.g
            animate={{ y: pupilY }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <circle cx="145" cy="205" r="28" fill="url(#irisGrad)" />
            <circle cx="145" cy="205" r="15" fill="#031B46" />
            {/* Catchlights */}
            <circle cx="138" cy="194" r="7" fill="#FFFFFF" />
            <circle cx="153" cy="214" r="3" fill="#FFFFFF" />
          </motion.g>
          {/* Eyelid for blink */}
          <motion.ellipse
            animate={{ opacity: blinking ? 1 : 0 }}
            transition={{ duration: 0.08 }}
            cx="145"
            cy="200"
            rx="46"
            ry="48"
            fill="#0864F5"
            style={{ pointerEvents: "none" }}
          />
        </g>

        {/* RIGHT EYE */}
        <g id="right-eye">
          <ellipse cx="255" cy="200" rx="46" ry="48" fill="#F7FAFF" />
          <motion.g
            animate={{ y: pupilY }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <circle cx="255" cy="205" r="28" fill="url(#irisGrad)" />
            <circle cx="255" cy="205" r="15" fill="#031B46" />
            <circle cx="248" cy="194" r="7" fill="#FFFFFF" />
            <circle cx="263" cy="214" r="3" fill="#FFFFFF" />
          </motion.g>
          <motion.ellipse
            animate={{ opacity: blinking ? 1 : 0 }}
            transition={{ duration: 0.08 }}
            cx="255"
            cy="200"
            rx="46"
            ry="48"
            fill="#0864F5"
            style={{ pointerEvents: "none" }}
          />
        </g>

        {/* BEAK — between eyes, below the horizontal midpoint */}
        <path
          d="M 200 240 L 178 278 Q 200 288 222 278 Z"
          fill="url(#beakUpGrad)"
        />
        <path
          d="M 184 282 Q 200 296 216 282 Q 200 288 184 282 Z"
          fill="url(#beakDownGrad)"
        />
        {/* Beak highlight */}
        <ellipse cx="196" cy="255" rx="4" ry="6" fill="#FFF4B8" opacity="0.7" />
      </motion.g>

      {/* OPEN BOOK — in front of body and wings */}
      <motion.g
        animate={{
          opacity: isReading ? 1 : 0.5,
          y: isReading ? 0 : 6,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Book cover (behind pages) */}
        <path
          d="M 68 425 Q 68 410 84 410 L 316 410 Q 332 410 332 425 L 332 505 Q 332 520 316 520 L 84 520 Q 68 520 68 505 Z"
          fill="url(#bookCoverGrad)"
        />

        {/* LEFT PAGES */}
        <path d="M 78 420 L 196 425 L 196 512 L 78 506 Z" fill="#F7FAFF" />
        <path d="M 86 428 L 190 432 L 190 505 L 86 500 Z" fill="#FFFFFF" />
        {/* Left page text lines */}
        <line x1="98" y1="446" x2="180" y2="448" stroke="#C9D3DC" strokeWidth="2" strokeLinecap="round" />
        <line x1="98" y1="462" x2="180" y2="464" stroke="#C9D3DC" strokeWidth="2" strokeLinecap="round" />
        <line x1="98" y1="478" x2="170" y2="480" stroke="#C9D3DC" strokeWidth="2" strokeLinecap="round" />

        {/* RIGHT PAGES */}
        <path d="M 322 420 L 204 425 L 204 512 L 322 506 Z" fill="#E8ECEF" />
        <path d="M 314 428 L 210 432 L 210 505 L 314 500 Z" fill="#F2F5F7" />
        {/* Right page text lines */}
        <line x1="220" y1="448" x2="302" y2="446" stroke="#C9D3DC" strokeWidth="2" strokeLinecap="round" />
        <line x1="220" y1="464" x2="302" y2="462" stroke="#C9D3DC" strokeWidth="2" strokeLinecap="round" />
        <line x1="220" y1="480" x2="290" y2="478" stroke="#C9D3DC" strokeWidth="2" strokeLinecap="round" />

        {/* SPINE */}
        <line x1="200" y1="418" x2="200" y2="516" stroke="#031B46" strokeWidth="4" />
        <line x1="200" y1="418" x2="200" y2="516" stroke="#0750C9" strokeWidth="2" />

        {/* Small spine shadow lines */}
        <line x1="196" y1="420" x2="196" y2="514" stroke="#06228A" strokeWidth="1" opacity="0.5" />
        <line x1="204" y1="420" x2="204" y2="514" stroke="#06228A" strokeWidth="1" opacity="0.5" />

        {/* Small muted mark on right cover (like a title tab) */}
        <rect x="288" y="492" width="32" height="6" rx="3" fill="#00B8FF" opacity="0.4" />
      </motion.g>
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={wrapperStyle}
      >
        {svg}
      </motion.div>
    );
  }

  return <div style={wrapperStyle}>{svg}</div>;
    }
