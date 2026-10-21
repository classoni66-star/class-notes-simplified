const handleClaimReward = () => {
  if (!friendPhone || friendPhone.length < 9) {
    return alert("Please enter a valid phone number.");
  }

  // 🛑 PREVENT CLAIMING YOUR OWN NUMBER
  if (businessInfo && friendPhone.trim() === businessInfo.phone.trim()) {
    return alert("You cannot claim a reward for your own phone number.");
  }

  // Check if this phone number was already claimed on this device
  const claimedList = JSON.parse(localStorage.getItem("smartsale_claimed_friends") || "[]");
  if (claimedList.includes(friendPhone.trim())) {
    return alert("You have already claimed a reward for this friend!");
  }

  // Grant 7 days premium
  const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
  const newPremium = currentPremium + (7 * 24 * 60 * 60 * 1000);
  localStorage.setItem("smartsale_premium_until", newPremium.toString());

  // Save to claimed list
  claimedList.push(friendPhone.trim());
  localStorage.setItem("smartsale_claimed_friends", JSON.stringify(claimedList));

  setClaimSuccess(true);
  setFriendPhone("");
  setTimeout(() => setClaimSuccess(false), 5000);
  window.location.reload(); // Refresh to show new days
};
