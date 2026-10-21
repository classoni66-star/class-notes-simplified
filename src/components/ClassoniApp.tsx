import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import Welcome from "../screens/Welcome";
import Onboarding from "../screens/Onboarding";
import Home from "../screens/Home";
import AddSale from "../screens/AddSale";
import PriceList from "../screens/PriceList";
import Stock from "../screens/Stock";
import Analytics from "../screens/Analytics";
import Rewards from "../screens/Rewards";
import BuyStorage from "../screens/BuyStorage";
import Profile from "../screens/Profile";
import InstallPrompt from "../components/InstallPrompt";

export default function SmartSaleApp() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [language, setLanguage] = useState("en");
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // State for the Premium Popup
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW failed:', err));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem("smartsale_invited_by", ref);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const savedBusiness = localStorage.getItem("smartsale_business");
    if (savedBusiness) {
      setBusinessInfo(JSON.parse(savedBusiness));
      setCurrentScreen("home");
    }
    setIsHydrated(true);
  }, []);

  // 🛑 THE GATEKEEPER
  const navigate = useCallback((screen: string) => {
    const isPremium = Number(localStorage.getItem("smartsale_premium_until") || 0) > Date.now();
    const gatedScreens = ["analytics", "stock"]; // These require Premium

    if (!isPremium && gatedScreens.includes(screen)) {
      setShowPremiumModal(true);
      return;
    }
    setCurrentScreen(screen);
  }, []);

  const handleOnboardingComplete = useCallback((data: any) => {
    setBusinessInfo(data);
    localStorage.setItem("smartsale_business", JSON.stringify(data));
    navigate("home");
  }, [navigate]);

  const startDemo = (type: "new" | "returning") => {
    if (type === "new") {
      localStorage.clear();
      setLanguage("en");
      setBusinessInfo(null);
      navigate("onboarding");
    } else {
      const fakeData = {
        name: "Saviour's Shop",
        phone: "0700000000",
        isDemo: true,
        priceList: [],
      };
      setBusinessInfo(fakeData);
      localStorage.setItem("smartsale_business", JSON.stringify(fakeData));
      // Give demo user 2 days premium for testing
      localStorage.setItem("smartsale_premium_until", (Date.now() + (2 * 24 * 60 * 60 * 1000)).toString());
      navigate("home");
    }
  };

  const screens: Record<string, React.ReactNode> = {
    welcome: <Welcome navigate={navigate} language={language} setLanguage={setLanguage} startDemo={startDemo} />,
    onboarding: <Onboarding navigate={navigate} onComplete={handleOnboardingComplete} language={language} />,
    home: <Home navigate={navigate} businessInfo={businessInfo} language={language} />,
    addSale: <AddSale navigate={navigate} businessInfo={businessInfo} language={language} />,
    priceList: <PriceList navigate={navigate} businessInfo={businessInfo} language={language} />,
    stock: <Stock navigate={navigate} businessInfo={businessInfo} language={language} />,
    analytics: <Analytics navigate={navigate} businessInfo={businessInfo} language={language} />,
    rewards: <Rewards navigate={navigate} businessInfo={businessInfo} language={language} />,
    buyStorage: <BuyStorage navigate={navigate} language={language} />,
    profile: <Profile navigate={navigate} businessInfo={businessInfo} language={language} />,
  };

  if (!isHydrated) return <div className="h-screen bg-[#F3F4F6]" />;

  return (
    <div className="mx-auto h-[100dvh] w-full max-w-lg overflow-hidden bg-[#F3F4F6] relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {screens[currentScreen] || <div className="p-4 text-center mt-10 font-bold text-gray-500">Screen not found</div>}
        </motion.div>
      </AnimatePresence>

      <InstallPrompt />

      {/* 🛑 PREMIUM UPGRADE MODAL */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-[#FF9800]" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-800 mb-2">Upgrade to Premium</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Free plan includes only making sales. For advanced analytics, upgrade to premium to unlock more analytics, manage your business with less stress, and know how you are performing.
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => { setShowPremiumModal(false); navigate("buyStorage"); }} 
                  className="w-full bg-[#FF9800] text-white py-3 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                >
                  View Premium Plans
                </button>
                <button 
                  onClick={() => setShowPremiumModal(false)} 
                  className="w-full text-gray-500 py-2 text-sm font-bold"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
    }
