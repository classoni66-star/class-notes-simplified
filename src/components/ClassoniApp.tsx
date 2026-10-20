import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Welcome from "../screens/Welcome";
import Onboarding from "../screens/Onboarding";
import Home from "../screens/Home";
// We will build these screens next:
// import AddSale from "../screens/AddSale";
// import Stock from "../screens/Stock";
// import Analytics from "../screens/Analytics";

export default function SmartSaleApp() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [language, setLanguage] = useState("en"); // 'en' or 'run'
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved data from phone memory when app opens
  useEffect(() => {
    const savedBusiness = localStorage.getItem("smartsale_business");
    if (savedBusiness) {
      setBusinessInfo(JSON.parse(savedBusiness));
      setCurrentScreen("home"); // Skip welcome if they already have an account
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

  // 🦋 OWNER DEMO MODE LOGIC
  const startDemo = (type: "new" | "returning") => {
    if (type === "new") {
      // Wipe memory and start fresh
      localStorage.clear();
      setLanguage("en");
      setBusinessInfo(null);
      navigate("onboarding");
    } else {
      // Inject fake data for a returning user (Yesterday's sales, etc.)
      const fakeData = {
        name: "Demo Shop",
        phone: "0700000000",
        isDemo: true,
        priceList: [
          { id: "1", name: "Sugar (Sukari)", unit: "kg", buyingPrice: 4000, sellingPrice: 4500 },
          { id: "2", name: "Soap (Sabuni)", unit: "bar", buyingPrice: 2500, sellingPrice: 3000 },
        ],
        yesterdaySales: 150000,
        yesterdayProfit: 25000,
        yesterdayDebtors: 15000,
        yesterdayCreditors: 5000,
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
    // We will uncomment these as we build them:
    // addSale: <AddSale navigate={navigate} businessInfo={businessInfo} />,
    // stock: <Stock navigate={navigate} businessInfo={businessInfo} />,
    // analytics: <Analytics navigate={navigate} businessInfo={businessInfo} />,
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
