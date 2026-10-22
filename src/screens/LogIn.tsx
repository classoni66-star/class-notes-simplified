import { useState } from "react";
import { Lock, ArrowRight, Smartphone, KeyRound } from "lucide-react";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(false);

  const savedPhone = JSON.parse(localStorage.getItem("smartsale_business") || "{}")?.phone || "";

  const handleUnlock = () => {
    const savedPassword = localStorage.getItem("smartsale_password");
    if (btoa(password) === savedPassword) {
      localStorage.setItem("smartsale_is_logged_in", "true"); // Keep logged in
      onUnlock();
    } else {
      setError(true);
      setPassword("");
    }
  };

  const handleSendSms = () => {
    if (phone.trim() !== savedPhone.trim()) {
      return alert("This phone number does not match the account on this device.");
    }
    alert("Demo: SMS Code is 1234");
    setMode("reset");
  };

  const handleResetPassword = () => {
    if (smsCode !== "1234") return alert("Incorrect SMS code.");
    if (newPassword.length < 4) return alert("Password too short.");
    
    localStorage.setItem("smartsale_password", btoa(newPassword));
    alert("Password changed successfully! Please log in.");
    setMode("login");
    setPassword("");
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#F3F4F6]">
      
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 text-[#FF9800]">
        {mode === "login" ? <Lock size={36} /> : mode === "forgot" ? <Smartphone size={36} /> : <KeyRound size={36} />}
      </div>
      
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
        {mode === "login" ? "Welcome Back" : mode === "forgot" ? "Reset Password" : "Enter Code"}
      </h1>
      <p className="text-sm text-gray-500 mb-8 text-center">
        {mode === "login" ? "Enter your password to access your records." : 
         mode === "forgot" ? "Enter your registered phone number." : 
         "Enter the code sent to your phone and choose a new password."}
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
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0770123456"
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9800]"
            />
            <button onClick={handleSendSms} className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
              Send SMS Code
            </button>
            <button onClick={() => setMode("login")} className="w-full text-gray-400 text-xs font-bold pt-2">Back to Login</button>
          </>
        )}

        {mode === "reset" && (
          <>
            <input 
              type="number" 
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              placeholder="1 2 3 4"
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-center text-xl tracking-[0.5em] font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9800]"
            />
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9800]"
            />
            <button onClick={handleResetPassword} className="w-full bg-[#0055FF] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
              Change Password
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
