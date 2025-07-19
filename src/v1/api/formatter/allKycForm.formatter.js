

function cibilReportKycFormatter(bodyData ,employeeId) {
    const {
         LD, customerName,
        applicantCibilScore, totalAccounts, overdueAccount, zeroBalanceAccount, highCreditSanctionAmount, totalCurrentOutstanding,
        totalOverdueAmount, totalNumberOfEnquiry, existingLoanRunningLoanType1, existingLoanRunningOwnership1, existingLoanRunningSanctionedAmount1,
        existingLoanRunningCurrentBalance1, existingLoanRunningRoi1, existingLoanRunningEmi1, existingLoanRunningTotalTenure1,
        existingLoanRunningBalanceTenure1, existingLoanRunningLoanStatus1, existingLoanRunningLoanObligated1, existingLoanRunningObligationConsideredAmount1,
        existingLoanRunningLoanType2, existingLoanRunningOwnership2, existingLoanRunningSanctionedAmount2, existingLoanRunningCurrentBalance2,
        existingLoanRunningRoi2, existingLoanRunningEmi2, existingLoanRunningTotalTenure2, existingLoanRunningBalanceTenure2,
        existingLoanRunningLoanStatus2, existingLoanRunningLoanObligated2, existingLoanRunningObligationConsideredAmount2,
        coAppName, coAppCibilScore, coAppTotalAccounts, coAppOverdueAccount, coAppZeroBalanceAccount, coAppHighCreditSanctionAmount,
        coAppTotalCurrentOutstanding, coAppTotalOverdueAmount, coAppExistingLoanRunningLoanType1, coAppExistingLoanRunningOwnership1,
        coAppExistingLoanRunningSanctionedAmount1, coAppExistingLoanRunningCurrentBalance1, coAppExistingLoanRunningRoi1, coAppExistingLoanRunningEmi1,
        coAppExistingLoanRunningTotalTenure1, coAppExistingLoanRunningBalanceTenure1, coAppExistingLoanRunningLoanStatus1,
        coAppExistingLoanRunningLoanObligated1, coAppExistingLoanRunningObligationConsideredAmount1, coAppExistingLoanRunningLoanType2,
        coAppExistingLoanRunningOwnership2, coAppExistingLoanRunningSanctionedAmount2, coAppExistingLoanRunningCurrentBalance2,
        coAppExistingLoanRunningRoi2, coAppExistingLoanRunningEmi2, coAppExistingLoanRunningTotalTenure2, coAppExistingLoanRunningBalanceTenure2,
        coAppExistingLoanRunningLoanStatus2, coAppExistingLoanRunningLoanObligated2, coAppExistingLoanRunningObligationConsideredAmount2,
        gtrName, gtrCibilScore ,mobileNo
    } = bodyData;

    return {
        employeeId, LD, customerName,
        applicantCibilScore, totalAccounts, overdueAccount, zeroBalanceAccount, highCreditSanctionAmount, totalCurrentOutstanding,
        totalOverdueAmount, totalNumberOfEnquiry, existingLoanRunningLoanType1, existingLoanRunningOwnership1, existingLoanRunningSanctionedAmount1,
        existingLoanRunningCurrentBalance1, existingLoanRunningRoi1, existingLoanRunningEmi1, existingLoanRunningTotalTenure1,
        existingLoanRunningBalanceTenure1, existingLoanRunningLoanStatus1, existingLoanRunningLoanObligated1, existingLoanRunningObligationConsideredAmount1,
        existingLoanRunningLoanType2, existingLoanRunningOwnership2, existingLoanRunningSanctionedAmount2, existingLoanRunningCurrentBalance2,
        existingLoanRunningRoi2, existingLoanRunningEmi2, existingLoanRunningTotalTenure2, existingLoanRunningBalanceTenure2,
        existingLoanRunningLoanStatus2, existingLoanRunningLoanObligated2, existingLoanRunningObligationConsideredAmount2,
        coAppName, coAppCibilScore, coAppTotalAccounts, coAppOverdueAccount, coAppZeroBalanceAccount, coAppHighCreditSanctionAmount,
        coAppTotalCurrentOutstanding, coAppTotalOverdueAmount, coAppExistingLoanRunningLoanType1, coAppExistingLoanRunningOwnership1,
        coAppExistingLoanRunningSanctionedAmount1, coAppExistingLoanRunningCurrentBalance1, coAppExistingLoanRunningRoi1, coAppExistingLoanRunningEmi1,
        coAppExistingLoanRunningTotalTenure1, coAppExistingLoanRunningBalanceTenure1, coAppExistingLoanRunningLoanStatus1,
        coAppExistingLoanRunningLoanObligated1, coAppExistingLoanRunningObligationConsideredAmount1, coAppExistingLoanRunningLoanType2,
        coAppExistingLoanRunningOwnership2, coAppExistingLoanRunningSanctionedAmount2, coAppExistingLoanRunningCurrentBalance2,
        coAppExistingLoanRunningRoi2, coAppExistingLoanRunningEmi2, coAppExistingLoanRunningTotalTenure2, coAppExistingLoanRunningBalanceTenure2,
        coAppExistingLoanRunningLoanStatus2, coAppExistingLoanRunningLoanObligated2, coAppExistingLoanRunningObligationConsideredAmount2,
        gtrName, gtrCibilScore
    };
}

function technicalReportKycFormatter(bodyData, employeeId) {
    const {
        LD, customerName, nameOfDocumentsHolder, addressAsPerInspection, landmark, typeOfLocality, 
        typeOfProperty, typeOfStructure, areaOfPlot, totalBuiltUpArea, occupationStatus, occupancy, 
        ageOfProperty, landValue, constructionValue, fairMarketValueOfLand, realizableValue, 
        latitude, longitude, valuationDoneBy
    } = bodyData;

    return {
        employeeId,
        LD, customerName, nameOfDocumentsHolder, addressAsPerInspection, landmark, typeOfLocality, 
        typeOfProperty, typeOfStructure, areaOfPlot, totalBuiltUpArea, occupationStatus, occupancy, 
        ageOfProperty, landValue, constructionValue, fairMarketValueOfLand, realizableValue, 
        latitude, longitude, valuationDoneBy
    };
}

function taggingKycFormatter(bodyData, employeeId) {
    const {
      LD,
      customerName,
      fatherName,
      addressOfApplicant,
      contactNumber,
      date,
      place,
      taggingDetail = [] // Default to empty array if not provided
    } = bodyData;
  
    // Ensure taggingDetail is always an array
    const formattedTaggingDetail = Array.isArray(taggingDetail) 
      ? taggingDetail.map((detail) => ({
          tagNo: detail.tagNo || "",
          animalNo: detail.animalNo || "",
          breedNo: detail.breedNo || "",
          genderNo: detail.genderNo || "",
          colourNo: detail.colourNo || "",
          ageNo: detail.ageNo || 0,
          milkInLiterPerDay: detail.milkInLiterPerDay || 0
        }))
      : [];
  
    return {
      employeeId,
      LD,
      customerName,
      fatherName,
      addressOfApplicant,
      contactNumber,
      date,
      place,
      taggingDetail: formattedTaggingDetail
    };
  }
  


function rcuKycFormatter(bodyData, employeeId) {
    const {
        LD, customerName, 
        applicantResidentialAddress, appContactNo, coAppName1, coAppResidentialAddress1, coAppContactNo1, 
        coAppName2, coAppResidentialAddress2, coAppContactNo2, 
        guarantorName, guarantorResidentialAddress, guarantorContactNo, 
        reportReceivedDate, reportStatus
     
    } = bodyData;

    return {
        employeeId,
        LD, customerName, 
        applicantResidentialAddress, appContactNo, coAppName1, coAppResidentialAddress1, coAppContactNo1, 
        coAppName2, coAppResidentialAddress2, coAppContactNo2, 
        guarantorName, guarantorResidentialAddress, guarantorContactNo, 
        reportReceivedDate, reportStatus
    };
}


function jainamKycFormatter(bodyData, employeeId) {
    const {
        LD,
        customerName,
        partnerName,
        branchName,
        applicantJainamProfileNo,
        coApplicantName,
        coApplicantJainamProfileNo,
        coApplicant2Name,
        coApplicant2JainamProfileNo,
        guarantorName,
        guarantorJainamProfileNo,
        jainamLoanNumber,
        caseDisbursedInJainam
    } = bodyData;

    return {
        employeeId,
        LD,
        partnerName,
        branchName,
        customerName,
        applicantJainamProfileNo,
        coApplicantName,
        coApplicantJainamProfileNo,
        coApplicant2Name,
        coApplicant2JainamProfileNo,
        guarantorName,
        guarantorJainamProfileNo,
        jainamLoanNumber,
        caseDisbursedInJainam
    };
}


function pdReportKycFormatter(bodyData, employeeId) {
    const {
        LD, customerName, fileNumber, branchName, customerFatherName, customerMotherName,
        customerSpouseWifeName, customerDob, customerHigherEducation, customerMobileNumber,
        customerMarriageStatus, numberOfDependantOnCustomers, customerPhoto, customerKycPhoto,
        coApplicantName, coApplicantFatherName, coApplicantMotherName, coApplicantSpouseWifeName,
        coApplicantRelationWithApplicant, coApplicantDob, coApplicantType, coApplicantHigherEducation,
        coApplicantMobileNumber, coApplicantMarriageStatus, coApplicantPhoto,
        additionalCoApplicantDetails,
        coApplicant2Name, coApplicant2FatherName, coApplicant2MotherName, coApplicant2SpouseWifeName,
        coApplicant2RelationWithApplicant, coApplicant2Dob, coApplicant2Type, coApplicant2HigherEducation,
        coApplicant2MobileNumber, addressAsPerAadharCopy, coApplicant2MarriageStatus,
        coApplicant2PanNumber, coApplicant2AadharNumber, coApplicant2DrivingLicenceNumber,
        coApplicant2VoterIdNumber, coApplicant2Photo, coApplicant2KycPhoto,
        guarantorDetails, guarantorName, guarantorFatherName, guarantorMotherName, guarantorSpouseWifeName,
        guarantorRelationWithApplicant, guarantorType, guarantorDob, guarantorHigherEducation,
        guarantorMobileNumber, guarantorMarriageStatus, guarantorPanNumber, guarantorAadharNumber,
        guarantorVoterIdNumber, guarantorDrivingLicenceNumber, guarantorPhoto, guarantorKycPhoto,
        agriLandDetails, nameOfAgriOwner, agriOwnerRelationWithApplicant, agriLandInBigha,
        agriLandSurveyKhasraNumber, villageName, whichCropIsPlanted, howMuchSoldForLastCrop,
        fertilizerShopOwnerName, fertilizerShopOwnerContactNumber, agriLandPavati,
        incomeFromDairyBusiness, numberOfCattleAvailable, numberOfMilkGivingCattles,
        totalMilkSupplyPerDay, nameOfDairyOwner, mobileNumberOfDairyOwner,
        milkSupplyingFromSinceYear, monthlyExpensesOnMilkBusiness, monthlyIncomeFromMilkBusiness,
        milkBookDiaryPhoto, cattlePhoto,
        otherSourceOfIncome, businessName, businessOwnerName, relationWithApplicant,
        natureOfBusiness, businessBoardSeen, businessDoingFromYears, businessMonthlyIncome,
        shopPhotoAlongWithCustomer,
        salaryIncome, salaryEarningMemberName, salaryRelationWithApplicant, salaryIncomeFrom,
        addressOfSalaryProvider, mobileNumberOfSalaryProvider, doingFromYears,
        salaryPaidThrough, monthlySalary, salaryCertificateDeclarationLetter,
        propertyDetails, nameOfPropertyOwner, relationWithApplicantProperty, residenceType,
        areaOfConstructionInSqFt, houseConstructionStatus, numberOfRooms,
        completeConstructionDetails, eastBoundary, westBoundary, northBoundary, southBoundary,
        pattaAvailableWithCustomer, boundariesMatchingWithPattaDocs, ageOfHouse, landmark,
        assetsSeenAtResidence, propertyDocsPhoto, overallHousePhoto, housePhotoWithCustomer,
        existingLoanDetails, loanType, existingMonthlyEmi, existingOutstandingLoan,
        loanType2, existingMonthlyEmi2, existingOutstandingLoan2,
        loanRequirementDetails, loanAmountDemandByCustomer, endUseOfLoan, cattleToBePurchased,
        emiComfortAmount, expectedLoanTenureInMonths,
        referenceDetails, neighbourName1, neighbourRelationWithApplicant1, neighbourAddress1,
        neighbourMobileNumber1, neighbourName2, neighbourRelationWithApplicant2, neighbourAddress2,
        neighbourMobileNumber2, overallNeighbourFeedback, geoPhotoWithOtherSource,
        netMonthlyIncome, estimatedEligibleLoanAmount, finalDecision, finalRemarks, hoCreditDesk
    } = bodyData;

    return {
        employeeId,
        LD, customerName, fileNumber, branchName, customerFatherName, customerMotherName,
        customerSpouseWifeName, customerDob, customerHigherEducation, customerMobileNumber,
        customerMarriageStatus, numberOfDependantOnCustomers, customerPhoto, customerKycPhoto,
        coApplicantName, coApplicantFatherName, coApplicantMotherName, coApplicantSpouseWifeName,
        coApplicantRelationWithApplicant, coApplicantDob, coApplicantType, coApplicantHigherEducation,
        coApplicantMobileNumber, coApplicantMarriageStatus, coApplicantPhoto,
        additionalCoApplicantDetails,
        coApplicant2Name, coApplicant2FatherName, coApplicant2MotherName, coApplicant2SpouseWifeName,
        coApplicant2RelationWithApplicant, coApplicant2Dob, coApplicant2Type, coApplicant2HigherEducation,
        coApplicant2MobileNumber, addressAsPerAadharCopy, coApplicant2MarriageStatus,
        coApplicant2PanNumber, coApplicant2AadharNumber, coApplicant2DrivingLicenceNumber,
        coApplicant2VoterIdNumber, coApplicant2Photo, coApplicant2KycPhoto,
        guarantorDetails, guarantorName, guarantorFatherName, guarantorMotherName, guarantorSpouseWifeName,
        guarantorRelationWithApplicant, guarantorType, guarantorDob, guarantorHigherEducation,
        guarantorMobileNumber, guarantorMarriageStatus, guarantorPanNumber, guarantorAadharNumber,
        guarantorVoterIdNumber, guarantorDrivingLicenceNumber, guarantorPhoto, guarantorKycPhoto,
        agriLandDetails, nameOfAgriOwner, agriOwnerRelationWithApplicant, agriLandInBigha,
        agriLandSurveyKhasraNumber, villageName, whichCropIsPlanted, howMuchSoldForLastCrop,
        fertilizerShopOwnerName, fertilizerShopOwnerContactNumber, agriLandPavati,
        incomeFromDairyBusiness, numberOfCattleAvailable, numberOfMilkGivingCattles,
        totalMilkSupplyPerDay, nameOfDairyOwner, mobileNumberOfDairyOwner,
        milkSupplyingFromSinceYear, monthlyExpensesOnMilkBusiness, monthlyIncomeFromMilkBusiness,
        milkBookDiaryPhoto, cattlePhoto,
        otherSourceOfIncome, businessName, businessOwnerName, relationWithApplicant,
        natureOfBusiness, businessBoardSeen, businessDoingFromYears, businessMonthlyIncome,
        shopPhotoAlongWithCustomer,
        salaryIncome, salaryEarningMemberName, salaryRelationWithApplicant, salaryIncomeFrom,
        addressOfSalaryProvider, mobileNumberOfSalaryProvider, doingFromYears,
        salaryPaidThrough, monthlySalary, salaryCertificateDeclarationLetter,
        propertyDetails, nameOfPropertyOwner, relationWithApplicantProperty, residenceType,
        areaOfConstructionInSqFt, houseConstructionStatus, numberOfRooms,
        completeConstructionDetails, eastBoundary, westBoundary, northBoundary, southBoundary,
        pattaAvailableWithCustomer, boundariesMatchingWithPattaDocs, ageOfHouse, landmark,
        assetsSeenAtResidence, propertyDocsPhoto, overallHousePhoto, housePhotoWithCustomer,
        existingLoanDetails, loanType, existingMonthlyEmi, existingOutstandingLoan,
        loanType2, existingMonthlyEmi2, existingOutstandingLoan2,
        loanRequirementDetails, loanAmountDemandByCustomer, endUseOfLoan, cattleToBePurchased,
        emiComfortAmount, expectedLoanTenureInMonths,
        referenceDetails, neighbourName1, neighbourRelationWithApplicant1, neighbourAddress1,
        neighbourMobileNumber1, neighbourName2, neighbourRelationWithApplicant2, neighbourAddress2,
        neighbourMobileNumber2, overallNeighbourFeedback, geoPhotoWithOtherSource,
        netMonthlyIncome, estimatedEligibleLoanAmount, finalDecision, finalRemarks, hoCreditDesk
    };
}

function sentForSanctionFormatter(bodyData, employeeId) {
    const {
        LD,
        customerName,
        partnerName,
        branchName,
        caseType,
        fatherName,
        contactNo,
        loanAmount,
        loanAmountInWords,
        principalAmount,
        interestAmount,
        totalAmount,
        roi,
        tenure,
        emiAmount,
        sentForSanction
    } = bodyData;

    return {
        employeeId,
        LD,
        customerName,
        partnerName,
        branchName,
        caseType,
        fatherName,
        contactNo,
        loanAmount,
        loanAmountInWords,
        principalAmount,
        interestAmount,
        totalAmount,
        roi,
        tenure,
        emiAmount,
        sentForSanction
    };
}

function postDisbursementFormatter(bodyData, employeeId) {
    const {
        LD,
        customerName,
        fatherName,
        loanNumber,
        actualPreEmi,
        dateOfDisbursement,
        dateOfFirstEmi,
        utrNumber1,
        utrNumber2,
        disbursementDoneBy,
    } = bodyData;

    return {
        employeeId,
        LD,
        customerName,
        fatherName,
        loanNumber,
        actualPreEmi,
        dateOfDisbursement,
        dateOfFirstEmi,
        utrNumber1,
        utrNumber2,
        disbursementDoneBy,
    };
}

function sentForDisbursementFormatter(bodyData, employeeId) {
    const {
        LD,
        customerName,
        fatherName,
        contactNo,
        branchName,
        partnerName,
        loanNumber,
        loanAmount,
        emiAmount,
        roi,
        processingFees,
        documentsCharges,
        cersaiCharges,
        preEmiInterest,
        netDisbursementAmount,
    } = bodyData;

    return {
        employeeId,
        LD,
        customerName,
        fatherName,
        contactNo,
        branchName,
        partnerName,
        loanNumber,
        loanAmount,
        emiAmount,
        roi,
        processingFees,
        documentsCharges,
        cersaiCharges,
        preEmiInterest,
        netDisbursementAmount,
    };
}


module.exports={
    cibilReportKycFormatter,
    technicalReportKycFormatter,
    taggingKycFormatter,
    rcuKycFormatter,
    jainamKycFormatter,
    pdReportKycFormatter,
    sentForSanctionFormatter,
    postDisbursementFormatter,
    sentForDisbursementFormatter
   
}