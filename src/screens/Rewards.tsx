import { useState, useEffect } from "react";
import { ArrowLeft, Gift, Share2, Users, Check, CheckCircle2 } from "lucide-react";

export default function Rewards({ navigate, businessInfo, language }: any) {
  const [copied, setCopied] = useState(false);
  const [friendPhone, setFriendPhone] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [premiumDaysLeft, setPremiumDaysLeft] = useState(0);

  const t = (en: string, run: string) => (language === "run" ? run : en);

  // Check how many premium days are left
  useEffect(() => {
    const checkPremium = () => {
      const premiumUntil = Number(localStorage.getItem("smartsale_premium_until") || 0);
      const now = Date.now();
      if (premiumUntil > now) {
        const daysLeft = Math.ceil((premiumUntil - now) / (1000 * 60 * 60 * 24));
        setPremiumDaysLeft(daysLeft);
      } else {
        setPremiumDaysLeft(0);
      }
    };
    checkPremium();
  }, []);

  const handleInvite = async () => {
    // Dynamically get the current URL (works without a custom domain)
    const currentUrl = window.location.origin; 
    
    // Attach the user's phone number to the link as a referral code
    const refLink = `${currentUrl}?ref=${businessInfo?.phone || "friend"}`;
    const text = `Join me on SmartSale! Manage your business with less stress. Use my link to get 7 days of free Premium access: ${refLink}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "SmartSale", text: text, url: refLink });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.log("Share failed:", err);
    }
  };

  const handleClaimReward = () => {
    if (!friendPhone || friendPhone.trim().length < 9) {
      return alert("Please enter a valid phone number.");
    }

    const cleanFriendPhone = friendPhone.trim();

    // 🛑 ANTI-CHEAT 1: Prevent claiming your own number
    if (businessInfo && cleanFriendPhone === businessInfo.phone.trim()) {
      return alert("You cannot claim a reward for your own phone number.");
    }

    // 🛑 ANTI-CHEAT 2: Prevent claiming the same friend twice
    const claimedList = JSON.parse(localStorage.getItem("smartsale_claimed_friends") || "[]");
    if (claimedList.includes(cleanFriendPhone)) {
      return alert("You have already claimed a reward for this friend!");
    }

    // Grant 7 days premium
    const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
    const newPremium = currentPremium + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem("smartsale_premium_until", newPremium.toString());

    // Save to claimed list
    claimedList.push(cleanFriendPhone);
    localStorage.setItem("smartsale_claimed_friends", JSON.stringify(claimedList));

    setClaimSuccess(true);
    setFriendPhone("");
    setTimeout(() => setClaimSuccess(false), 5000);
    
    // Refresh to show new days
    setTimeout(() => window.location.reload(), 1500); 
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6]">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Rewards", "Empeera")}</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto pb-24">
        
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <Gift size={48} className="text-[#FF9800]" />
        </div>
        
        <h2 className="text-xl font-extrabold text-gray-800 text-center mb-2">Get 7 Days Free!</h2>
        <p className="text-sm text-gray-500 text-center mb-6 px-4">
          {t(
            "Invite a fellow friend to SmartSale. When they join, you both get 1 week of unlimited storage and analytics free!",
            "Shaba omukwano wawe omuri SmartSale. Ijwe mwena muheebwa esaabiiti emwe ey'okukoresya amakuru n'amafakisi."
          )}
        </p>

        {/* CURRENT STATUS */}
        <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">{t("Your Premium Status", "Omutindo gwawe")}</p>
            <p className="text-lg font-extrabold text-[#FF9800]">
              {premiumDaysLeft > 0 ? `${premiumDaysLeft} Days Left` : "Free Plan"}
            </p>
          </div>
          <CheckCircle2 size={24} className={premiumDaysLeft > 0 ? "text-green-500" : "text-gray-300"} />
        </div>

        {/* SHARE BUTTON */}
        <button 
          onClick={handleInvite}
          className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-transform mb-8"
        >
          {copied ? <Check size={20} /> : <Share2 size={20} />}
          {copied ? "Link Copied!" : t("Invite a Friend", "Shaba Omukwano")}
        </button>

        {/* CLAIM REWARD SECTION */}
        <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Users size={20} className="text-[#0055FF]" />
            <p className="font-bold text-gray-800 text-sm">{t("Did a friend join?", "Omukwano wawe akashemera?")}</p>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            {t(
              "Enter your friend's phone number below to claim your 7 free days.",
              "Yandika enamba ya simu y'omukwano wawe ahaasi ngu oheebwe amazo 7 y'obwereere."
            )}
          </p>
          
          <div className="flex gap-2">
            <input 
              type="tel"
              value={friendPhone}
              onChange={(e) => setFriendPhone(e.target.value)}
              placeholder="e.g. 0770123456"
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF9800]"
            />
            <button 
              onClick={handleClaimReward}
              className="bg-[#0055FF] text-white px-4 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
            >
              Claim
            </button>
          </div>
          
          {claimSuccess && (
            <p className="text-xs font-bold text-green-600 mt-2 text-center animate-pulse">7 Days added successfully!</p>
          )}
        </div>

      </div>
    </div>
  );
        }
