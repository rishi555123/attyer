/**
 * Stub function to check if a pincode is serviceable.
 * TODO: Integrate Shiprocket or Delhivery API later
 * @param {string} pincode - 6 digit Indian pincode
 * @returns {Promise<boolean>} - True if serviceable
 */
const checkPincodeServiceability = async (pincode) => {
  // Stub implementation: currently returns true for all valid 6-digit pincodes
  if (/^[1-9][0-9]{5}$/.test(pincode)) {
    return true; 
  }
  return false;
};

module.exports = checkPincodeServiceability;
