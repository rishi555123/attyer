/**
 * Calculates GST based on intra-state or inter-state transaction
 * @param {number} amount - Base amount before GST
 * @param {number} rate - GST rate percentage (e.g., 5, 12, 18)
 * @param {string} userState - State of the customer
 * @param {string} originState - State of the warehouse/business (default: 'Rajasthan')
 * @returns {Object} - Breakdown of CGST, SGST, IGST, and Total GST
 */
const calculateGST = (amount, rate, userState, originState = 'Rajasthan') => {
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let totalGst = (amount * rate) / 100;

  // Intra-state sale (CGST + SGST)
  if (userState.toLowerCase() === originState.toLowerCase()) {
    cgst = totalGst / 2;
    sgst = totalGst / 2;
  } 
  // Inter-state sale (IGST)
  else {
    igst = totalGst;
  }

  return {
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    totalGst: Number(totalGst.toFixed(2))
  };
};

module.exports = calculateGST;
