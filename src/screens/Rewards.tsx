interface Props {
  setScreen: (s: string) => void;
  navigate?: (s: string) => void;
}

export default function Rewards({ setScreen, navigate }: Props) {
  const goBack = () => {
    if (navigate) navigate("player");
    else setScreen("player");
  };

  const handleInvite = () => {
    console.log("Invite tapped");
    alert("Invite link copied! Share it with your classmates.");
  };

  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-4 pt-4">
      <button
        onClick={goBack}
        className="text-white text-2xl mb-2 self-start w-10 h-10 flex items-center justify-center"
        aria-label="Back"
      >
        ←
      </button>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎁</span>
        <h1 className="text-white font-bold text-xl">Your rewards</h1>
      </div>

      <div className="bg-white/10 rounded-2xl p-4 mb-3">
        <p className="text-white/60 text-xs mb-1">Unlimited learning remaining</p>
        <p className="text-white font-bold text-3xl">5 days</p>
        <p className="text-white/60 text-xs mt-1">Keep inviting friends to add more days</p>
      </div>

      <div className="bg-white/10 rounded-2xl p-4 mb-3">
        <p className="text-white font-bold text-sm">
          Invite a friend and unlock more unlimited learning + points
        </p>
        <p className="text-white/60 text-xs mt-2">
          24 hours of free unlimited learning per invited friend who joins, plus 2 pts free.
        </p>
      </div>

      <div className="bg-white/10 rounded-2xl p-4 mb-3">
        <p className="text-white/60 text-xs">Your points today</p>
        <p className="text-classoni-yellow font-bold text-2xl mt-1">12 pts</p>
      </div>

      <div className="bg-white/10 rounded-2xl p-4 mb-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-white/60 text-sm">Students in your class</p>
          <p className="text-white font-bold">42</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-white/60 text-sm">Friends you've invited</p>
          <p className="text-white font-bold">3</p>
        </div>
      </div>

      <button
        onClick={handleInvite}
        className="mt-auto mb-4 w-full bg-classoni-yellow text-classoni-navy rounded-2xl py-4 font-bold"
      >
        Invite a friend and get my rewards when they create an account
      </button>
    </div>
  );
}
