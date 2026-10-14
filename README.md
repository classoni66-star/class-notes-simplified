# Class Notes Simplified

Build a mobile-first React PWA called "Classoni" using Vite + React + TypeScript + Tailwind CSS + Framer Motion + lucide-react.



CRITICAL RULES:

- Follow every instruction EXACTLY

- NO SCROLLING on any screen. Everything must fit in ONE mobile viewport.

- After building, PUSH ALL FILES TO GITHUB. This is non-negotiable.

- All screens use currentScreen state in App.tsx with these values:

  "welcome" | "input" | "source" | "loading" | "player" | "premiumPlans" | "paywall" | "rewards" | "profile" | "classGate" | "search" | "contributions"



═══════════════════════════════════════

TAILWIND CONFIG

═══════════════════════════════════════



colors: {

  'classoni-blue': '#0055FF',

  'classoni-yellow': '#FFD700',

  'classoni-navy': '#0A1F44',

  'classoni-lavender': '#F3F4F6',

}



═══════════════════════════════════════

RAVEN MASCOT COMPONENT

═══════════════════════════════════════



File: src/components/RavenMascot.tsx

Props: size (number, default 80), animated (boolean, default false)



Use this EXACT inline SVG (do not modify coordinates or colors):



<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">

  <defs>

    <radialGradient id="bodyGrad" cx="50%" cy="40%" r="65%">

      <stop offset="0%" stop-color="#4DA6FF"/>

      <stop offset="60%" stop-color="#0055FF"/>

      <stop offset="100%" stop-color="#0033AA"/>

    </radialGradient>

    <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">

      <stop offset="0%" stop-color="#1A3A7A"/>

      <stop offset="100%" stop-color="#0A1F44"/>

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

  <path d="M 22 52 Q 2 70 4 100" stroke="#FFD700" stroke-width="4" fill="none"/>

  <circle cx="4" cy="105" r="7" fill="#FFD700"/>

  <path d="M -1 113 L 9 113 L 4 130 Z" fill="#FFD700"/>

  <circle cx="74" cy="90" r="24" fill="white"/>

  <circle cx="126" cy="90" r="24" fill="white"/>

  <circle cx="74" cy="93" r="14" fill="#001133"/>

  <circle cx="126" cy="93" r="14" fill="#001133"/>

  <circle cx="79" cy="85" r="5" fill="white"/>

  <circle cx="131" cy="85" r="5" fill="white"/>

  <polygon points="100,108 87,128 113,128" fill="#FFD700"/>

  <polygon points="100,120 91,128 109,128" fill="#FF9900"/>

</svg>



Wrap in a motion.div that floats (y: 0 → -4 → 0) over 3s, looping, when animated=true.



Raven appears on EXACTLY these screens:

- Welcome.tsx → size={180}, animated={true}

- Input.tsx → size={100}, animated={true}

- Player.tsx TopBar → size={64}, animated={false}



NO Raven on any other screen.



═══════════════════════════════════════

TOPBAR COMPONENT

═══════════════════════════════════════



File: src/components/TopBar.tsx

Props: title, uploader, points, onProfileTap, onRewardsTap, onPremiumTap



Row 1: [Gift icon → onRewardsTap] [Title bold + "By Uploader" small grey centered] [yellow "X pts"] [Profile icon → onProfileTap]

Row 2: [RavenMascot size={56} centered] [Go Premium button right, yellow bg, navy text, small, rounded-full]

Row 3: "Keypoint: Sliding Filament Theory" centered, bold, small



═══════════════════════════════════════

BOTTOMNAV COMPONENT

═══════════════════════════════════════



File: src/components/BottomNav.tsx

Props: active, onNavigate



4 tabs evenly spaced, height 64px, white bg, fixed bottom:

- Upload (upload icon) → onNavigate("upload")

- Courses (book icon) → onNavigate("courses") — default active

- Leaderboard (trophy icon) → onNavigate("leaderboard")

- Search (search icon) → onNavigate("search")



Active = classoni-blue. Inactive = grey.



═══════════════════════════════════════

SCREENS

═══════════════════════════════════════



**1. Welcome.tsx**

Root: min-h-screen h-screen bg-classoni-navy flex flex-col overflow-hidden

- RavenMascot size={180} animated={true} centered at 25% from top

- "Hi, I'm Raven." white, 28px, bold, centered

- "I'm here to help you pass your course and graduate with less stress." white, 16px, opacity 80%, centered, px-6

- Bottom: button "Start Learning" (yellow bg, navy text, rounded-full, py-4, font-bold, w-full) → "input"



**2. Input.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-6 pt-4

- RavenMascot size={100} animated={true}

- "Classoni turns your notes into videos you can easily understand and apply." white, 16px, centered, mt-4

- "What would you like to learn today?" white, 20px, bold, mt-3, centered

- Input 1: "Course unit / Subject" (rounded-xl, bg-white/10, border border-white/20, text-white, placeholder-white/50, px-4 py-3, w-full, mt-3)

- Input 2: "Topic / Section" (same style, mt-2)

- Button "Start" (yellow, w-full, rounded-full, py-4, mt-6) → "source"



**3. Source.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-6 pt-6

- "How should we build your lesson?" white, 18px, bold, centered

- Card 1 (bg-classoni-yellow, text-navy, rounded-2xl, p-4, mb-3, mt-6): "Use standard curriculum notes" + subtitle "Instant, AI-generated, exam-ready"

- Card 2 (bg-white/10, text-white, border border-white/20, rounded-2xl, p-4): "Upload my own notes" + subtitle "PDF, images, or handwritten"

- Both → "loading"



**4. Loading.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-6 pt-6

- Vertical list of 11 steps, each fading in 1.2s apart, checkmark appears 1s after fade:

  1. "🔍 Analyzing your notes..."

  2. "🧠 Extracting keypoints..."

  3. "🏗️ Structuring your lesson..."

  4. "🎯 Creating a real-world question first..."

  5. "🎨 Searching for the best visuals..."

  6. "🎙️ Recording your narrator..."

  7. "📝 Adding captions and timing..."

  8. "🛡️ Checking for accuracy..."

  9. "🎯 Creating your Apply scenario..."

  10. "📝 Preparing your exam quiz..."

  11. "🚀 BOOM... your lesson is ready!"

- After last step, wait 1s → "player"



**5. Player.tsx (THE CORE SCREEN)**

Root: h-screen overflow-hidden flex flex-col bg-classoni-lavender



TopBar at top (flex-shrink-0), with title="Sliding Filament Theory", uploader="By You", points=12



VISUAL FEED SECTION (flex-1 min-h-0 relative):

This is a vertical TikTok-style feed. Each keypoint is a "clip". For the UI skeleton, show ONE keypoint clip.



Inside the clip:

- Top captions area (h-20, px-4):

  - Render sentence as word spans: "During muscle contraction, the myosin heads pull on actin filaments, causing them to slide inward."

  - setInterval every 400ms advances highlightedIndex

  - Highlighted word: className="bg-classoni-yellow text-classoni-navy rounded-md px-1 transition-all duration-150"

  - Other words: "transition-all duration-150"

  - Text: text-center, text-classoni-navy, text-base, leading-relaxed



- Middle visual canvas (flex-1 min-h-0, mx-4, mb-2):

  - rounded-2xl bg-white/60, clean empty canvas

  - NO dashed border, NO text, just empty white space waiting for LLM SVG



- Floating buttons (absolute bottom-24 right-4 flex flex-col gap-3):

  - Share button: 40px circle, white bg, shadow, Share2 icon. On tap: navigator.share({title:'Classoni', text:'Check out this lesson!', url: window.location.href}) wrapped in try/catch; on failure copy URL to clipboard and show "Link copied!" for 2s.

  - Feedback button: 40px circle, white bg, shadow, ThumbsUp icon. On tap: opens small modal (not full sheet) with title "How was this explanation?", two options "👍 Like" / "👎 Dislike". Selecting either shows textarea ("Tell us more" / "Please tell us what went wrong") + Submit button. On submit: console.log(feedback + reason) and show "Thank you! Your feedback has been sent." Close X top-right.



BOTTOM PILL BUTTONS (flex-shrink-0 px-4 pb-2):

4 buttons in a row, gap-2:

- "Apply" (flex-1 bg-classoni-blue text-white rounded-full py-3 font-semibold)

- "Explain" (flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3)

- "Quiz" (same as Explain)

- "Posts" (same as Explain)



GLOW SEQUENCE LOGIC (visual only, for the skeleton):

- Add state glowSequence: "apply" | "explain" | "quiz" | "posts" | null

- Initial glow: "apply"

- When Apply sheet is closed: set glowSequence to "explain"

- When Explain sheet is closed: set glowSequence to "quiz"

- When Quiz sheet is closed: set glowSequence to "posts"

- When Posts sheet is closed: set glowSequence to null

- The glowing button gets className "ring-4 ring-classoni-yellow animate-pulse"



BOTTOM SHEETS (all open with Framer Motion, initial y: "100%", animate y: 0, exit y: "100%", spring, height 80vh, rounded-t-3xl, white bg, p-6, overflow-y-auto, close X top-right):



- Apply sheet (id="apply"):

  - Title: "Apply"

  - Scenario text: "A nurse in Mulago Hospital is preparing oral rehydration solution for a cholera outbreak and needs to calculate the exact sodium concentration. The ward has run out of pre-measured sachets, and the nursing staff are unsure of the correct ratio."

  - Before "Solve" is tapped: show scenario only, with a "Solve" button (bg-classoni-blue, text-white, w-full, rounded-full, py-3)

  - After "Solve" is tapped: reveal the solution paragraph below:

    "The nurse needs to recognize that concentration defines how much solute is in a given volume. Multiplying the target concentration (75 mmol/L) by the total volume (5 L) and the molar mass of NaCl (58.44 g/mol) yields approximately 21.9 grams of salt to weigh out. Given the ward's time pressure, pre-measuring sachets during morning rounds removes the measuring step from the staff entirely."

  - Add state `applySolved` (boolean)



- Explain sheet (id="explain"):

  - Title: "Explain"

  - Text: "Explain this concept in your own words. Score 8/10 or more and unlock Teacher Mode when posted to teach your peers and earn more rewards."

  - Textarea (w-full h-28, border border-classoni-blue rounded-xl p-3, placeholder "Type your explanation...")

  - Two small buttons above the textarea: [📝 Text] [🎤 Audio] — Text is selected by default. Audio just shows a message "Audio recording coming soon."

  - Submit button (bg-classoni-blue, text-white, w-full, rounded-full, py-3)

  - On submit: show mock score "7/10 — You missed the role of ATP in myosin detachment. Try again." + "Try Again" button that clears the textarea. Do NOT award points yet.



- Quiz sheet (id="quiz"):

  - Title: "Question 1 of 1"

  - The quiz needs to support BOTH multiple choice AND typed answers. Show one MCQ for the skeleton.

  - MCQ Question: "Which of the following best describes the mechanism by which a skeletal muscle fiber shortens during contraction?"

  - 4 option buttons (A, B, C, D), each w-full bg-classoni-lavender rounded-xl p-3 mb-2 text-left text-classoni-navy:

    A) The actin and myosin filaments both shorten in length.

    B) The myosin filaments slide past the actin filaments, pulling the Z-lines closer together.

    C) The sarcomere membrane folds inward, reducing its overall length.

    D) The actin filaments dissolve and reassemble in a more compact form.

  - On selecting an option: mark correct (B) with green bg, wrong with red bg, then show explanation below: "During contraction, the actin and myosin filaments do not change length; they slide past each other, which shortens the sarcomere."

  - Add a small toggle at the top: [MCQ] [Typed] — Typed mode shows a textarea + a keyboard that includes both letters and numbers (browsers do this by default when inputMode="text").

  - Do NOT award points for now (skeleton only).



- Posts sheet (id="posts"):

  - Title: "Class Contributions"

  - If empty: "No contributions from your class for this concept yet. You can be the first!" centered, text-classoni-navy

  - Add mock contribution card below (bg-classoni-lavender rounded-2xl p-4):

    - "Explained by Amina K." small, bold

    - "The myosin heads grab the actin and pull it inward, like rowing a boat. When ATP comes in, they let go and reset. That's why muscles need energy to relax too."

    - Rating row: [🔵 Helpful 3] [🟢 More Helpful 5] [🟣 Very Helpful 2] — three small pill buttons



BOTTOM NAVIGATION (flex-shrink-0):

BottomNav with active="courses", onNavigate:

- "upload" → currentScreen = "input"

- "courses" → no-op

- "leaderboard" → currentScreen = "classGate"

- "search" → currentScreen = "search"



PAUSE/RESUME CONTRACT:

- Add state isSheetOpen (boolean)

- When any pill button is tapped: setIsSheetOpen(true) + console.log("[Player] Lesson paused")

- When sheet closes: setIsSheetOpen(false) + console.log("[Player] Lesson resumed from previous position")

- Do NOT reset highlightedIndex when the sheet opens

- Structure so adding audioRef.current.pause()/.play() later is a one-line change



**6. PremiumPlans.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-4 pt-4

- Back button top-left → "player"

- Title: "Go Premium — unlock unlimited learning, no ads, no limits." white, 18px, bold, centered, mt-4, px-2

- Three plan cards (bg-white/10, border border-white/20, rounded-2xl, p-4, mb-3, mt-4):

  - "Daily Plan" + "1000 UGX / day" + "Choose Plan" button (yellow, rounded-full, px-4 py-2)

  - "Weekly Plan" + "4000 UGX / week (Save 43%)" + "Choose Plan"

  - "Monthly Plan" + "10000 UGX / month (Save 67%)" + "Choose Plan"



**7. Paywall.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-4 pt-6

- "Good work done!" white, bold, 22px, centered, mt-8

- "You have completed my 10 daily recommended concepts for today. Would you like to proceed? Continue with..." white, 15px, centered, opacity 80%, mt-2

- Three option cards (bg-white/10, border border-white/20, rounded-2xl, p-4, mb-3, mt-4):

  - "Go Premium" → "premiumPlans"

  - "Invite a friend" → "rewards"

  - "Revisit today's recommended free concepts" → "player"

- NOT wired to any button. Reachable only by manually setting currentScreen = "paywall"



**8. Rewards.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-4 pt-4

- Back button top-left → "player"

- Stats cards (bg-white/10, rounded-2xl, p-4, mb-3, mt-4):

  - "Students in your class: 42"

  - "Friends you've invited: 3"

- Big button at bottom (mx-4 mb-4): "Invite a friend, earn more rewards when they join and create an account" (yellow bg, navy text, rounded-2xl, py-4, font-bold)



**9. Profile.tsx**

Root: bg-classoni-lavender h-screen flex flex-col overflow-hidden px-4 pt-4

- Back button top-left → "player"

- Editable fields (label above, input below, mt-2):

  - Name: "John Doe"

  - Email: "johndoe@gmail.com"

  - Institution: "KIU Western Campus"

  - Program: "Diploma in Pharmacy"

  - Year: "1"

  - Semester: "2"

- "Save Changes" button (yellow, w-full, rounded-full, py-3, mt-4)

- "Privacy Policy" link (small, underlined, grey, centered, mt-3)



**10. ClassGate.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-4 pt-6

- Back button top-left → "player"

- "You can only access Leaderboard after you join your class." white, 16px, centered, mt-8

- Button: "Join Your Class" (yellow, w-full, rounded-full, py-4, mt-4)

- On tap, show inline form below (mt-4):

  - Institution, Program, Year, Semester fields

  - Small text: "🔒 Your information is kept safely and strictly for educational purposes only to connect you with your classmates." (grey, small, italic, mt-2)

  - "Confirm" button (yellow, w-full, rounded-full, py-3, mt-3)



**11. Search.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-4 pt-4

- Back button top-left → "player"

- Search input (rounded-xl, bg-white/10, border border-white/20, text-white, placeholder-white/50, px-4 py-3, mt-2)

- "Recent searches will appear here" (grey, small, mt-3)

- 3 suggested lesson cards (bg-white/10, rounded-2xl, p-3, mb-2, mt-2):

  - "Pharmacokinetics — Drug Absorption"

  - "Sliding Filament Theory — Muscle Contraction"

  - "Cardiac Cycle — Systole and Diastole"

- BottomNav at bottom with active="search"



**12. Contributions.tsx**

Root: bg-classoni-navy h-screen flex flex-col overflow-hidden px-4 pt-4

- Back button top-left → "player"

- Title: "Class Contributions" white, bold, 18px, centered

- Vertical scroll feed of mock contribution cards (bg-white/10, rounded-2xl, p-4, mb-3):

  - Card 1: "Explained by Amina K." + explanation text + 3 rating pills (Helpful 3, More Helpful 5, Very Helpful 2)

  - Card 2: "Explained by Brian O." + explanation text + 3 rating pills

- The three rating pills: [🔵 Helpful] [🟢 More Helpful] [🟣 Very Helpful] — each small, rounded-full, with a count



═══════════════════════════════════════

STRICT RULES

═══════════════════════════════════════



1. Every button has an onClick. No dead buttons.

2. NO SCROLLING on any screen. All use h-screen and overflow-hidden.

3. Player content areas use flex-1 min-h-0 so they shrink to fit.

4. Raven appears ONLY on Welcome, Input, and Player TopBar. No other screen.

5. Upload tab → currentScreen = "input". No separate Upload screen.

6. Go Premium → "premiumPlans". Never "paywall".

7. Paywall reachable only via manual currentScreen = "paywall".

8. Player root background = classoni-lavender.

9. Quiz supports MCQ and Typed toggle.

10. Apply has scenario → Solve → solution flow.

11. Glow sequence: Apply → Explain → Quiz → Posts.

12. Tailwind classes only. No custom CSS files.

13. TypeScript strict. No any.

14. App compiles with ZERO errors.

15. AFTER BUILDING, PUSH ALL FILES TO GITHUB. THIS IS MANDATORY.



═══════════════════════════════════════

CREATE THESE FILES

═══════════════════════════════════════



- package.json, tailwind.config.js, index.html

- src/main.tsx, src/App.tsx

- src/components/RavenMascot.tsx, TopBar.tsx, BottomNav.tsx

- src/screens/Welcome.tsx, Input.tsx, Source.tsx, Loading.tsx, Player.tsx, PremiumPlans.tsx, Paywall.tsx, Rewards.tsx, Profile.tsx, ClassGate.tsx, Search.tsx, Contributions.tsx



DO NOT create Upload.tsx.

Ensure app runs on first load. Welcome screen appears immediately. Confirm zero TypeScript errors.<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">

  <defs>

    <radialGradient id="bodyGrad" cx="50%" cy="40%" r="65%">

      <stop offset="0%" stop-color="#4DA6FF"/>

      <stop offset="60%" stop-color="#0055FF"/>

      <stop offset="100%" stop-color="#0033AA"/>

    </radialGradient>

    <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">

      <stop offset="0%" stop-color="#1A3A7A"/>

      <stop offset="100%" stop-color="#0A1F44"/>

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

  <path d="M 22 52 Q 2 70 4 100" stroke="#FFD700" stroke-width="4" fill="none"/>

  <circle cx="4" cy="105" r="7" fill="#FFD700"/>

  <path d="M -1 113 L 9 113 L 4 130 Z" fill="#FFD700"/>

  <circle cx="74" cy="90" r="24" fill="white"/>

  <circle cx="126" cy="90" r="24" fill="white"/>

  <circle cx="74" cy="93" r="14" fill="#001133"/>

  <circle cx="126" cy="93" r="14" fill="#001133"/>

  <circle cx="79" cy="85" r="5" fill="white"/>

  <circle cx="131" cy="85" r="5" fill="white"/>

  <polygon points="100,108 87,128 113,128" fill="#FFD700"/>

  <polygon points="100,120 91,128 1https://github.com/classoni66-star/Classoni-web.git09,128" fill="#FF9900"/>

</svg>  https://github.com/classoni66-star/Classoni-web.git.  our git repo

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e16ef20d-8b4b-5bec-a3d1-196aefe92eef).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
