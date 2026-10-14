<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" style={{ width: '100%', height: 'auto', display: 'block' }}>
  <defs>
    {/* Head and body blue gradient */}
    <radialGradient id="headGrad" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stopColor="#5FB3FF" />
      <stop offset="55%" stopColor="#1565FF" />
      <stop offset="100%" stopColor="#0033AA" />
    </radialGradient>

    {/* Belly lighter blue */}
    <radialGradient id="bellyGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#A8D5FF" />
      <stop offset="100%" stopColor="#4DA6FF" />
    </radialGradient>

    {/* Cap dark blue */}
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1A3A7A" />
      <stop offset="100%" stopColor="#0A1F44" />
    </linearGradient>

    {/* Book cover */}
    <linearGradient id="bookGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1565FF" />
      <stop offset="100%" stopColor="#0033AA" />
    </linearGradient>

    {/* Upper beak gold */}
    <linearGradient id="beakUp" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#FFD700" />
      <stop offset="100%" stopColor="#FFB300" />
    </linearGradient>

    {/* Lower beak orange */}
    <linearGradient id="beakDown" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#FFA500" />
      <stop offset="100%" stopColor="#FF8C00" />
    </linearGradient>

    {/* Wing gradient */}
    <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#0033AA" />
      <stop offset="100%" stopColor="#1565FF" />
    </linearGradient>

    {/* Feet orange */}
    <linearGradient id="feetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#FFB300" />
      <stop offset="100%" stopColor="#FF8C00" />
    </linearGradient>

    {/* Iris radial */}
    <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#4DA6FF" />
      <stop offset="70%" stopColor="#1565FF" />
      <stop offset="100%" stopColor="#0A2E7A" />
    </radialGradient>
  </defs>

  {/* FEET */}
  <g id="feet">
    <ellipse cx="155" cy="525" rx="32" ry="15" fill="url(#feetGrad)" />
    <ellipse cx="245" cy="525" rx="32" ry="15" fill="url(#feetGrad)" />
  </g>

  {/* BODY */}
  <g id="body">
    <ellipse cx="200" cy="370" rx="130" ry="145" fill="url(#headGrad)" />
    <ellipse cx="200" cy="400" rx="80" ry="95" fill="url(#bellyGrad)" />
  </g>

  {/* WINGS */}
  <g id="leftWing">
    <path d="M 75 320 Q 45 370 55 440 Q 70 465 100 450 Q 85 400 100 340 Z" fill="url(#wingGrad)" />
  </g>
  <g id="rightWing">
    <path d="M 325 320 Q 355 370 345 440 Q 330 465 300 450 Q 315 400 300 340 Z" fill="url(#wingGrad)" />
  </g>

  {/* HEAD */}
  <g id="head">
    <circle cx="200" cy="215" r="115" fill="url(#headGrad)" />
  </g>

  {/* GRADUATION CAP */}
  <g id="cap">
    {/* Cap band */}
    <ellipse cx="200" cy="150" rx="90" ry="18" fill="#0A1F44" />
    {/* Mortarboard */}
    <path d="M 200 75 L 350 145 L 200 175 L 50 145 Z" fill="url(#capGrad)" />
    {/* Highlight */}
    <path d="M 200 85 L 335 145 L 200 165 L 65 145 Z" fill="#1A3A7A" opacity="0.4" />
    {/* Cap crown */}
    <path d="M 120 155 Q 200 130 280 155 L 280 165 Q 200 145 120 165 Z" fill="#0A1F44" />
  </g>

  {/* TASSEL */}
  <g id="tassel">
    <path d="M 90 155 Q 65 185 70 225" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="70" cy="230" r="7" fill="#FFD700" />
    <rect x="62" y="233" width="16" height="8" rx="3" fill="#FFB300" />
    <path d="M 65 242 Q 63 270 68 290" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M 72 244 Q 72 275 73 292" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M 79 242 Q 82 270 78 290" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>

  {/* EYES */}
  <g id="leftEye">
    <ellipse cx="155" cy="215" rx="42" ry="44" fill="#FFFFFF" />
    <circle cx="155" cy="220" r="26" fill="url(#irisGrad)" />
    <circle cx="155" cy="220" r="15" fill="#0A1F44" />
    <circle cx="145" cy="208" r="7" fill="#FFFFFF" />
    <circle cx="165" cy="232" r="3" fill="#FFFFFF" />
  </g>

  <g id="rightEye">
    <ellipse cx="245" cy="215" rx="42" ry="44" fill="#FFFFFF" />
    <circle cx="245" cy="220" r="26" fill="url(#irisGrad)" />
    <circle cx="245" cy="220" r="15" fill="#0A1F44" />
    <circle cx="235" cy="208" r="7" fill="#FFFFFF" />
    <circle cx="255" cy="232" r="3" fill="#FFFFFF" />
  </g>

  {/* EYEBROWS */}
  <g id="eyebrows">
    <path d="M 120 165 Q 145 145 180 155" stroke="#4DA6FF" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M 280 165 Q 255 145 220 155" stroke="#4DA6FF" strokeWidth="7" fill="none" strokeLinecap="round" />
  </g>

  {/* BEAK */}
  <g id="beak">
    <path d="M 200 245 L 178 282 Q 200 292 222 282 Z" fill="url(#beakUp)" />
    <path d="M 182 285 Q 200 300 218 285 Q 200 292 182 285 Z" fill="url(#beakDown)" />
  </g>

  {/* OPEN BOOK */}
  <g id="book">
    {/* Book back cover / shadow */}
    <path d="M 60 400 Q 60 385 80 385 L 320 385 Q 340 385 340 400 L 340 525 Q 340 540 320 540 L 80 540 Q 60 540 60 525 Z" fill="#0A1F44" />

    {/* Left page block */}
    <path d="M 75 395 L 195 400 L 195 525 L 75 520 Z" fill="#F0F0F0" />
    <path d="M 85 405 L 190 408 L 190 515 L 85 512 Z" fill="#FAFAFA" />
    <g stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round">
      <line x1="100" y1="425" x2="180" y2="426" />
      <line x1="100" y1="440" x2="180" y2="441" />
      <line x1="100" y1="455" x2="180" y2="456" />
      <line x1="100" y1="470" x2="180" y2="471" />
      <line x1="100" y1="485" x2="180" y2="486" />
      <line x1="100" y1="500" x2="170" y2="501" />
    </g>

    {/* Right page block */}
    <path d="M 325 395 L 205 400 L 205 525 L 325 520 Z" fill="#E8E8E8" />
    <path d="M 315 405 L 210 408 L 210 515 L 315 512 Z" fill="#F5F5F5" />
    <g stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round">
      <line x1="220" y1="426" x2="300" y2="425" />
      <line x1="220" y1="441" x2="300" y2="440" />
      <line x1="220" y1="456" x2="300" y2="455" />
      <line x1="220" y1="471" x2="300" y2="470" />
      <line x1="220" y1="486" x2="300" y2="485" />
      <line x1="220" y1="501" x2="280" y2="500" />
    </g>

    {/* Spine */}
    <line x1="200" y1="392" x2="200" y2="527" stroke="#0A1F44" strokeWidth="3" />
  </g>
</svg>
