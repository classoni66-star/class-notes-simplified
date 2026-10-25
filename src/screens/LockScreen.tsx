import { useState } from "react";
import { Lock, ArrowRight, ShieldQuestion, KeyRound } from "lucide-react";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [password, setPassword] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(false);

  const secQuestion = localStorage.getItem("smartsale_sec_question") || "What is your mother's name?";
  const savedAnswerHash = localStorage.getItem("smartsale_sec_answer");

  const handleUnlock = () => {
    const savedPassword = localStorage.getItem("smartsale_password");
    if (btoa(password) === savedPassword) {
      localStorage.setItem("smartsale_is_logged_in", "true");
      onUnlock();
    } else {
      setError(true);
      setPassword("");
    }
  };

  const handleVerifyAnswer = () => {
    if (!savedAnswerHash) {
      return alert("No security question was set up on this account.");
    }
    if (btoa(answer.trim().toLowerCase()) === savedAnswerHash) {
      setMode("reset");
    } else {
      alert("Incorrect answer. Please try again.");
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 4) return alert("Password must be at least 4 characters.");
    localStorage.setItem("smartsale_password", btoa(newPassword));
    alert("Password changed successfully! Please log in.");
    setMode("login");
    setPassword("");
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#F3F4F6]">
      
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 text-[#FF9800]">
        {mode === "login" ? <Lock size={36} /> : mode === "forgot" ? <ShieldQuestion size={36} /> : <KeyRound size={36} />}
      </div>
      
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
        {mode === "login" ? "Welcome Back" : mode === "forgot" ? "Account Recovery" : "Set New Password"}
      </h1>
      <p className="text-sm text-gray-500 mb-8 text-center px-4">
        {mode === "login" ? "Enter your password to access your records." : 
         mode === "forgot" ? secQuestion : 
         "Enter your new password below."}
      </p>

      <div className="w-full max-w-xs space-y-3">
        
        {mode === "login" && (
          <>
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password"
              className={`w-full p-4 bg-white border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9800]`}
            />
            {error && <p className="text-red-500 text-xs text-center font-bold">Incorrect password.</p>}
            
            <button onClick={handleUnlock} className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2">
              Unlock Account <ArrowRight size={20} />
            </button>
            
            <button onClick={() => setMode("forgot")} className="w-full text-gray-400 text-xs font-bold pt-2">Forgot Password?</button>
          </>
        )}

        {mode === "forgot" && (
          <>
            <input 
              type="text" 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your Answer"
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9800]"
            />
            <button onClick={handleVerifyAnswer} className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
              Verify Answer
            </button>
            <button onClick={() => setMode("login")} className="w-full text-gray-400 text-xs font-bold pt-2">Back to Login</button>
          </>
        )}

        {mode === "reset" && (
          <>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9800]"
            />
            <button onClick={handleResetPassword} className="w-full bg-[#0055FF] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
              Save New Password
            </button>
          </>
        )}

      </div>

      {mode === "login" && (
        <button onClick={() => {
          if(confirm("This will erase all local data. Are you sure?")) {
            localStorage.clear();
            window.location.reload();
          }
        }} className="mt-10 text-[10px] text-red-400 underline">
          Factory Reset App
        </button>
      )}
    </div>
  );
      }
