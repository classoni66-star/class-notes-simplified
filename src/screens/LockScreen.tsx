import { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    const savedPassword = localStorage.getItem("smartsale_password");
    // Using btoa for basic hashing (it's not military grade, but hides plain text)
    if (btoa(password) === savedPassword) {
      onUnlock();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#F3F4F6]">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 text-[#FF9800]">
        <Lock size={36} />
      </div>
      
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Welcome Back</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">Enter your password to access your business records.</p>

      <div className="w-full max-w-xs space-y-3">
        <input 
          type="password" 
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          placeholder="Enter password"
          className={`w-full p-4 bg-white border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9800]`}
        />
        {error && <p className="text-red-500 text-xs text-center font-bold">Incorrect password. Try again.</p>}
        
        <button 
          onClick={handleUnlock}
          className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
        >
          Unlock Account <ArrowRight size={20} />
        </button>
      </div>

      <button 
        onClick={() => {
          if(confirm("If you forgot your password, you will lose access to this device's data. Are you sure?")) {
            localStorage.clear();
            window.location.reload();
          }
        }}
        className="mt-8 text-xs text-gray-400 underline font-medium"
      >
        Forgot Password?
      </button>
    </div>
  );
  }
