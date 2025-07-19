const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  

// ------------Bank Account Detail Fetching Api Using 3rd Party Api---------------------
async function calculateAmotization(amotizationData) {
    try {
        let {amount,roi,tenure,emi} = amotizationData
        let returnData ={
            ...amotizationData,
            repaymentSchedule:[] 
        }
        let remaingAmount = amount
        for (let index = 0; index < tenure+1; index++) {
            if(index == 0){
                returnData.repaymentSchedule.push({
                    month:index+1,
                    amountToPay:0,
                    remaingAmount:  remaingAmount  
                })
            }else{
                remaingAmount =  remaingAmount - emi  
                returnData.repaymentSchedule.push({
                    month:index+1,
                    amountToPay:emi,
                    remaingAmount:  remaingAmount  
                })
            }
            
        }
        return returnData
      } catch (error) {
        console.log(error);
        unknownError(res, error);
      }
}

function calculateLoanAmortization(loanAmount, tenureInMonths, annualInterestRate, startDate) {
    // 1. Convert the annual interest rate to a monthly decimal
    //    (e.g., 12% => 0.12 / 12 => 0.01)
    const monthlyInterestRate = (annualInterestRate / 100) / 12;
  
    // 2. Calculate the monthly payment using the standard annuity formula:
    //    monthlyPayment = P * (r / [1 - (1+r)^(-N)])
    const monthlyPayment = loanAmount * monthlyInterestRate / 
      (1 - Math.pow(1 + monthlyInterestRate, -tenureInMonths));
  
    // 3. Keep track of the remaining balance and total interest
    let remainingBalance = loanAmount;
    let totalInterestPaid = 0;
  
    // 4. Convert the `startDate` into a proper Date object (if needed)
    //    We'll increment this date by one month for each installment.
    let paymentDate = startDate instanceof Date 
      ? new Date(startDate.getTime()) 
      : new Date(startDate);
  
    const returnData = [];
  
    // 5. Loop from month = 0 to month = tenureInMonths
    //    so we can include an initial row (month=0) if desired.
    for (let month = 0; month <= tenureInMonths; month++) {
      if (month === 0) {
        // At month=0, no payment is made yet, so principalPayment=0, interestPayment=0
        // The opening principal is the total loan (remainingBalance).
        returnData.push({
          month,
          dateOfPayment: paymentDate.toISOString().split("T")[0], // or format as needed
          openingPrincipal: Math.round((remainingBalance * 100) / 100),
          principalPayment: 0,
          interestPayment: 0,
          monthlyPayment: 0,
          remainingBalance: Math.round((remainingBalance * 100) / 100)
        });
      } else {
        // Before we do any calculations, 
        // the openingPrincipal is the current `remainingBalance`.
        const openingPrincipal = remainingBalance;
  
        // 1) Interest portion
        const interestPayment = openingPrincipal * monthlyInterestRate;
  
        // 2) Principal portion
        const principalPayment = monthlyPayment - interestPayment;
  
        // 3) Update the remaining balance
        remainingBalance = openingPrincipal - principalPayment;
  
        // 4) Accumulate total interest (if you need it)
        totalInterestPaid += interestPayment;
  
        // 5) Push to our result array
        returnData.push({
          month,
          dateOfPayment: paymentDate.toISOString().split("T")[0], // or any date format you prefer
          openingPrincipal: Math.round((openingPrincipal * 100) / 100),
          principalPayment: Math.round((principalPayment * 100) / 100),
          interestPayment: Math.round((interestPayment * 100) / 100),
          monthlyPayment: Math.round((monthlyPayment * 100) / 100),
          remainingBalance: Math.round((remainingBalance * 100) / 100)
        });
      }
  
      // 6. Increment the dateOfPayment by one month for the *next* loop iteration
      //    We do this at the end of each loop so the date for the current row is correct.
      paymentDate.setMonth(paymentDate.getMonth() + 1);
    }
  
    return returnData;
  }
  function calculateLoanARP(
    loanAmount,
    tenureInMonths,
    annualInterestRate,
    startDate,
    processingFee = 0,
    documentationFee = 0,
    insuranceFee = 0,
    valuationFee = 0,
    otherFee = 0
  ) {
    // 1. Sum total fees
    const totalFees = 
      processingFee +
      documentationFee +
      insuranceFee +
      valuationFee +
      otherFee;
  
    // 2. Convert the annual interest rate to a monthly decimal
    //    (e.g. 19% => 0.19 / 12 => 0.01583)
    const monthlyInterestRate = (annualInterestRate / 100) / 12;
  
    // 3. Calculate the EMI (monthly payment) via the standard annuity formula
    //    monthlyPayment = P * (r / [1 - (1+r)^(-N)])
    const monthlyPayment = loanAmount * monthlyInterestRate /
      (1 - Math.pow(1 + monthlyInterestRate, -tenureInMonths));
  
    // 4. Build the monthly array (like rows N20:N320 in Excel)
    let remainingBalance = loanAmount;
    let totalInterestPaidSoFar = 0;
  
    // Convert `startDate` to a Date object
    let paymentDate = startDate instanceof Date
      ? new Date(startDate.getTime())
      : new Date(startDate);
  
    const monthlyArray = [];
  
    // Loop from month = 0 to month = tenureInMonths
    for (let month = 0; month <= tenureInMonths; month++) {
      if (month === 0) {
        // At t=0 (month=0), no payment, net inflow = loanAmount - totalFees
        monthlyArray.push({
          month,
          dateOfPayment: paymentDate.toISOString().split("T")[0],
          openingPrincipal: round2(remainingBalance),
          principalPayment: 0,
          interestPayment: 0,
          monthlyPayment: 0,
          remainingBalance: round2(remainingBalance),
          netCashFlow: round2(loanAmount - totalFees),  // inflow
          totalCharges: 0
        });
      } else {
        const openingPrincipal = remainingBalance;
        const interestPayment = openingPrincipal * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance = openingPrincipal - principalPayment;
        totalInterestPaidSoFar += interestPayment;
  
        // For months >= 1, netCashFlow is an outflow = monthlyPayment
        const netCashFlow = round2(monthlyPayment);
  
        const totalChargesSoFar = round2(totalFees + totalInterestPaidSoFar);
  
        monthlyArray.push({
          month,
          dateOfPayment: paymentDate.toISOString().split("T")[0],
          openingPrincipal: round2(openingPrincipal),
          principalPayment: round2(principalPayment),
          interestPayment: round2(interestPayment),
          monthlyPayment: round2(monthlyPayment),
          remainingBalance: round2(remainingBalance),
          netCashFlow,
          totalCharges: totalChargesSoFar
        });
      }
  
      // Increment date by 1 month
      paymentDate.setMonth(paymentDate.getMonth() + 1);
    }
  
    // 5. Compute Nominal APR using the IRR approach (like =IRR(...) * 12 in Excel)
    const nominalAprDecimal = computeNominalAPR(loanAmount, tenureInMonths, monthlyPayment, totalFees);
  
    // 6. Format final object
    const result = {
      "Loan Tenure": tenureInMonths,
      "Loan Amount": "₹ " + formatNumber(loanAmount),
      "ROI": annualInterestRate.toFixed(2) + "%",
      "EMI": "₹ " + formatNumber(monthlyPayment),
      "Processing Fees": "₹ " + formatNumber(processingFee),
      "Documentation Charges": "₹ " + formatNumber(documentationFee),
      "Insurance Fees": "₹ " + formatNumber(insuranceFee),
      "Valuation Fees": "₹ " + formatNumber(valuationFee),
      "Any Other Charges (Please Specify)": "₹ " + formatNumber(otherFee),
      "Total Charges": "₹ " + formatNumber(totalFees),
  
      // Multiply by 100 to get a percentage, then round to 2 decimals
      "APR %": (nominalAprDecimal * 100).toFixed(2) + "%",
  
      // The full monthly breakdown
      monthlyArray
    };
  
    return result;
  
    //---------------------------------
    // Helper Functions
    //---------------------------------
  
    function round2(num) {
      return Math.round(num * 100) / 100;
    }
  
    function formatNumber(num) {
      return round2(num).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  
    /**
     * This replicates the Excel approach:  =IRR(range) * 12
     * 
     * 1) We build a cash flow array (like Excel’s N20:N320):
     *    - t=0: + (loanAmount - totalFees)
     *    - t=1..N: - monthlyPayment
     * 2) We find the monthly IRR by setting NPV=0.
     * 3) We multiply that monthly IRR by 12 to get the nominal APR.
     *
     * @returns {number} the nominal APR in **decimal** form 
     *                   (e.g. 0.2131 => 21.31%).
     */
    function computeNominalAPR(loanAmount, tenureInMonths, monthlyPayment, totalFees) {
      // Build the array of cash flows
      // cf[0] = + (loanAmount - totalFees)
      // cf[t] = - monthlyPayment for t = 1..N
      const cf = [];
      cf.push(loanAmount - totalFees);
      for (let i = 1; i <= tenureInMonths; i++) {
        cf.push(monthlyPayment);
      }
  
      // 1) Find monthly IRR via a simple binary search or Newton’s method
      const monthlyIRR = internalRateOfReturn(cf);
  
      // 2) Return nominal APR => monthly IRR * 12
      return monthlyIRR * 12;
    }
  
    /**
     * internalRateOfReturn: a simple IRR approximation with binary search.
     *
     * @param {number[]} cashFlows - Array of periodic cash flows 
     *                               (cf[0] is time=0, cf[1] is time=1, etc.)
     * @returns {number} monthly IRR (decimal), e.g. 0.015 => 1.5% per month
     */
    function internalRateOfReturn(cashFlows) {
      // We assume monthly periods. IRR is the rate r that solves:
      // NPV(r) = Σ (cashFlows[t] / (1 + r)^t ) = 0
      // We'll do a binary search between -100% and +100% monthly.
  
      let lower = -0.999999; // can't be -100% exactly
      let upper =  1.0;      // 100% monthly is extremely high, but let's keep for bounding
      let guess = 0;
      const tolerance = 1e-8;
      const maxIterations = 200;
  
      function npv(rate) {
        let sum = 0;
        for (let t = 0; t < cashFlows.length; t++) {
          sum += cashFlows[t] / Math.pow(1 + rate, t);
        }
        return sum;
      }
  
      for (let i = 0; i < maxIterations; i++) {
        guess = (lower + upper) / 2;
        const value = npv(guess);
  
        if (Math.abs(value) < tolerance) {
          break;
        }
        if (value > 0) {
          lower = guess; // need a bigger rate
        } else {
          upper = guess; // need a smaller rate
        }
      }
      return guess;
    }
  }
  
  


module.exports = { calculateAmotization,calculateLoanAmortization,calculateLoanARP }