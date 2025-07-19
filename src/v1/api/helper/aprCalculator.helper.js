/**
 * APR Calculator based on FINCOOPERS APR Calculator Model
 * Calculates EMI, amortization schedule, and APR for a loan
 */

// Function to calculate APR for a loan
function calculateAPR({
    loanTenure, // in months
    loanAmount,
    rateOfInterest, // annual, in decimal (e.g., 0.26 for 26%)
    processingFees = 0,
    documentationCharges = 0,
    insuranceFees = 0,
    valuationFees = 0,
    otherCharges = 0,
    securityDeposit = 0, // DSRA
    advanceEMI = 0,
    subvention = 0,
  }) {
    // Calculate EMI using PMT formula: PMT(rate/12, term, principal) * -1
    const monthlyRate = rateOfInterest / 12;
    const emi = calculateEMI(loanAmount, monthlyRate, loanTenure);
  // console.log(emi,"emi??????????????/")
    // Calculate total charges
    const totalCharges = processingFees + documentationCharges + insuranceFees + 
                         valuationFees + otherCharges;
  
    // Generate amortization schedule with cash flows
    const amortizationSchedule = generateAmortizationSchedule({
      loanAmount,
      loanTenure,
      rateOfInterest,
      emi,
      totalCharges,
      securityDeposit,
      advanceEMI,
      subvention
    });
  
    // Extract cash flows for IRR calculation
    const cashFlows = amortizationSchedule.map(row => row.netCashFlow);
  
    // Calculate APR (IRR * 12)
    const apr = calculateIRR(cashFlows) * 12;
  
    return {
      loanTenure,
      loanAmount,
      rateOfInterest,
      emi,
      processingFees,
      documentationCharges,
      insuranceFees,
      valuationFees,
      otherCharges,
      totalCharges,
      securityDeposit,
      advanceEMI,
      subvention,
      apr,
      amortizationSchedule
    };
  }
  
  // Function to calculate EMI (Equated Monthly Installment)
  function calculateEMI(principal, monthlyRate, term) {
    // PMT formula: PMT(rate, nper, pv) * -1
    // This formula calculates the payment amount for a loan
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
           (Math.pow(1 + monthlyRate, term) - 1);
  }
  
  // Generate the complete amortization schedule with cash flows
  function generateAmortizationSchedule({
    loanAmount,
    loanTenure,
    rateOfInterest,
    emi,
    totalCharges,
    securityDeposit,
    advanceEMI,
    subvention
  }) {
    const schedule = [];
    const monthlyRate = rateOfInterest / 12;
    let outstandingPrincipal = loanAmount;
  
    // Initial row (time = 0)
    schedule.push({
      srNo: 0,
      openingPrincipal: loanAmount,
      emi: 0,
      interest: 0,
      principal: 0,
      dropLine: 0,
      outstandingPrincipal: loanAmount,
      date: new Date(), // Current date
      totalCharges: totalCharges,
      securityDeposit: securityDeposit,
      advanceEMI: advanceEMI,
      subvention: subvention,
      // Net cash flow = -Opening Principal + Total Charges + Security Deposit + Advance EMI + Subvention
      netCashFlow: (loanAmount * -1) + totalCharges + securityDeposit + advanceEMI + subvention
    });
  
    // Generate remaining rows of the schedule
    for (let month = 1; month <= loanTenure; month++) {
      // Skip if loan fully repaid
      if (outstandingPrincipal <= 0) break;
  
      // Calculate interest for this month
      const interestPayment = outstandingPrincipal * monthlyRate;
  
      // Calculate principal component of EMI
      const principalPayment = emi - interestPayment;
  
      // New outstanding principal
      outstandingPrincipal = Math.max(0, outstandingPrincipal - principalPayment);
  
      // Date for this installment (just add months to current date)
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + month);
  
      // Add row to schedule
      schedule.push({
        srNo: month,
        openingPrincipal: outstandingPrincipal + principalPayment,
        emi: emi,
        interest: interestPayment,
        principal: principalPayment,
        dropLine: 0, // No drop line / prepayment by default
        outstandingPrincipal: outstandingPrincipal,
        date: currentDate,
        totalCharges: 0, // Charges only in first row
        securityDeposit: 0, // Security deposit only in first row
        advanceEMI: 0, // Advance EMI only in first row
        subvention: 0, // Subvention only in first row
        // Net cash flow for subsequent months is just the EMI
        netCashFlow: emi
      });
    }
  
    return schedule;
  }
  
  // Calculate IRR (Internal Rate of Return)
  function calculateIRR(cashFlows, guess = 0.1, maxIterations = 100, precision = 1e-10) {
    // Newton-Raphson method to find IRR
    let rate = guess;
    let iteration = 0;
    
    while (iteration < maxIterations) {
      const npv = calculateNPV(cashFlows, rate);
      if (Math.abs(npv) < precision) {
        return rate; // Found the IRR
      }
      
      const derivative = calculateNPVDerivative(cashFlows, rate);
      const newRate = rate - npv / derivative;
      
      if (Math.abs(newRate - rate) < precision) {
        return newRate; // Convergence achieved
      }
      
      rate = newRate;
      iteration++;
    }
    
    // If no convergence, return the best approximation
    return rate;
  }
  
  // Calculate Net Present Value (NPV) for a given rate
  function calculateNPV(cashFlows, rate) {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + rate, i);
    }
    return npv;
  }
  
  // Calculate derivative of NPV function for Newton-Raphson method
  function calculateNPVDerivative(cashFlows, rate) {
    let derivative = 0;
    for (let i = 1; i < cashFlows.length; i++) { // Start from i=1 (not i=0) for derivative
      derivative -= i * cashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    return derivative;
  }
  
  // Function to format the amortization schedule to a more readable format
  function formatAmortizationSchedule(schedule) {
    return schedule.map(row => ({
      'Sr. No': row.srNo,
      'Opening Principal': row.openingPrincipal.toFixed(2),
      'EMI': row.emi.toFixed(2),
      'Interest': row.interest.toFixed(2),
      'Principal': row.principal.toFixed(2),
      'Outstanding Principal': row.outstandingPrincipal.toFixed(2),
      'Date': row.date.toISOString().split('T')[0],
      'Net Cash Flow': row.netCashFlow.toFixed(2)
    }));
  }
  
  // Example usage with a custom date formatting
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  // Main function to calculate and display results
  function calculateAndDisplayAPR(options) {
    const result = calculateAPR(options);
    
    // console.log('========== LOAN DETAILS ==========');
    // console.log(`Loan Amount: ${formatCurrency(result.loanAmount)}`);
    // console.log(`Loan Tenure: ${result.loanTenure} months`);
    // console.log(`Rate of Interest: ${(result.rateOfInterest * 100).toFixed(2)}%`);
    // console.log(`EMI: ${formatCurrency(result.emi)}`);
    // console.log('\n========== CHARGES ==========');
    // console.log(`Processing Fees: ${formatCurrency(result.processingFees)}`);
    // console.log(`Documentation Charges: ${formatCurrency(result.documentationCharges)}`);
    // console.log(`Insurance Fees: ${formatCurrency(result.insuranceFees)}`);
    // console.log(`Valuation Fees: ${formatCurrency(result.valuationFees)}`);
    // console.log(`Other Charges: ${formatCurrency(result.otherCharges)}`);
    // console.log(`Total Charges: ${formatCurrency(result.totalCharges)}`);
    // console.log('\n========== OTHER PARAMETERS ==========');
    // console.log(`Security Deposit/DSRA: ${formatCurrency(result.securityDeposit)}`);
    // console.log(`Advance EMI: ${formatCurrency(result.advanceEMI)}`);
    // console.log(`Subvention: ${formatCurrency(result.subvention)}`);
    // console.log('\n========== RESULT ==========');
    // console.log(`APR: ${(result.apr * 100).toFixed(4)}%`);
  
    // console.log('\n========== AMORTIZATION SCHEDULE (FIRST 5 ROWS) ==========');
    // const formattedSchedule = formatAmortizationSchedule(result.amortizationSchedule);
    // console.table(formattedSchedule);
    // console.log(result);
    
    
    return result;
  }
  
  // Example usage
  const loanParameters = {
    loanTenure: 50, // 5 years
    loanAmount: 500000,
    rateOfInterest: 0.26, // 26%
    processingFees: 11800,
    documentationCharges: 11800,
    insuranceFees: 1929,
    valuationFees: 0,
    otherCharges: 59,
    securityDeposit: 0,
    advanceEMI: 0,
    subvention: 0
  };
  
  // Calculate and display results
//   calculateAndDisplayAPR(loanParameters);
  
  // Export functions for use in other modules
module.exports = {
    calculateAPR,
    calculateEMI,
    generateAmortizationSchedule,
    formatAmortizationSchedule,
    calculateIRR
  };