const handleVerify = () => {
  if (smsCode.length >= 4) {
    
    // 🎁 CHECK FOR REFERRAL REWARD
    const invitedBy = localStorage.getItem("smartsale_invited_by");
    if (invitedBy) {
      // 🛑 PREVENT SELF-REFERRAL
      if (invitedBy.trim() === phone.trim()) {
        alert("You cannot use your own invite link to get a reward.");
        localStorage.removeItem("smartsale_invited_by");
      } else {
        // Give new user 7 days of premium
        const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
        const newPremium = currentPremium + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem("smartsale_premium_until", newPremium.toString());
        
        localStorage.removeItem("smartsale_invited_by");
        alert("🎉 Welcome! Because you were invited by a friend, you have received 7 days of free Premium access!");
      }
    }

    onComplete({
      name: businessName,
      type: businessType,
      phone: phone,
      priceList: [], 
    });
  }
};
