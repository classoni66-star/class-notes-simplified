
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Welcome from "../screens/Welcome";
import Onboarding from "../screens/Onboarding";
import Home from "../screens/Home";
import AddSale from "../screens/AddSale";
import PriceList from "../screens/PriceList";

export default function SmartSaleApp() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [language, setLanguage] = useState("en");
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedBusiness = localStorage.getItem("smartsale_business");
    if (savedBusiness) {
      setBusinessInfo(JSON.parse(savedBusiness));
      setCurrentScreen("home");
    }
    setIsHydrated(true);
  }, []);

  const navigate = useCallback((screen: string) => {
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
      navigate("home");
    }
  };

  const screens: Record<string, React.ReactNode> = {
    welcome: <Welcome navigate={navigate} language={language} setLanguage={setLanguage} startDemo={startDemo} />,
    onboarding: <Onboarding navigate={navigate} onComplete={handleOnboardingComplete} language={language} />,
    home: <Home navigate={navigate} businessInfo={businessInfo} language={language} />,
    addSale: <AddSale navigate={navigate} businessInfo={businessInfo} language={language} />,
    priceList: <PriceList navigate={navigate} businessInfo={businessInfo} language={language} />,
  };

  if (!isHydrated) return <div className="h-screen bg-[#F3F4F6]" />;

  return (
    <div className="mx-auto h-[100dvh] w-full max-w-lg overflow-hidden bg-[#F3F4F6]">
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
    </div>
  );
  }
