const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const jsonData = {
    "controlData": {
        "success": true
    },
    "consumerCreditData": [
        {
            "tuefHeader": {
                "headerType": "TUEF",
                "version": "12",
                "memberRefNo": "NB4088",
                "enquiryMemberUserId": "NB40889999_UATC2CNPE",
                "subjectReturnCode": 1,
                "enquiryControlNumber": "002160318200",
                "dateProcessed": "27082024",
                "timeProcessed": "152612"
            },
            "names": [
                {
                    "index": "N01",
                    "name": "HINAAN W/O UMAR MASOOD BASTAL",
                    "birthDate": "29041984",
                    "gender": "1"
                }
            ],
            "ids": [
                {
                    "index": "I01",
                    "idType": "01",
                    "idNumber": "AAJPF1276A"
                },
                {
                    "index": "I02",
                    "idType": "02",
                    "idNumber": "F7780570",
                    "issueDate": "20102006",
                    "expirationDate": "19102016"
                },
                {
                    "index": "I03",
                    "idType": "04",
                    "idNumber": "JK0120130077620"
                },
                {
                    "index": "I04",
                    "idType": "06",
                    "idNumber": "724417694906"
                },
                {
                    "index": "I05",
                    "idType": "09",
                    "idNumber": "10092153494865"
                }
            ],
            "telephones": [
                {
                    "index": "T01",
                    "telephoneNumber": "911942108866",
                    "telephoneType": "02"
                },
                {
                    "index": "T02",
                    "telephoneNumber": "2108866",
                    "telephoneType": "00"
                },
                {
                    "index": "T03",
                    "telephoneNumber": "2108866666",
                    "telephoneType": "03",
                    "enquiryEnriched": "Y"
                },
                {
                    "index": "T04",
                    "telephoneNumber": "9650220654",
                    "telephoneType": "01",
                    "enquiryEnriched": "Y"
                }
            ],
            "emails": [
                {
                    "index": "C01",
                    "emailID": "FARHEENUMAR@GMAIL.COM"
                },
                {
                    "index": "C02",
                    "emailID": "HINAAN.FARHEEN@HDFCBANK.COM"
                },
                {
                    "index": "C03",
                    "emailID": "HINAAN.FARHEEN@HDFCBANK.COM"
                },
                {
                    "index": "C04",
                    "emailID": "FARHEENUMAR@GMAIL.COM"
                }
            ],
            "employment": [
                {
                    "index": "E01",
                    "accountType": "05",
                    "dateReported": "29022024",
                    "occupationCode": "01"
                }
            ],
            "scores": [
                {
                    "scoreName": "CIBILTUSC3",
                    "scoreCardName": "08",
                    "scoreCardVersion": "10",
                    "scoreDate": "27082024",
                    "score": "00777",
                    "reasonCodes": [
                        {
                            "reasonCodeName": "reasonCode1",
                            "reasonCodeValue": "41"
                        },
                        {
                            "reasonCodeName": "reasonCode2",
                            "reasonCodeValue": "40"
                        },
                        {
                            "reasonCodeName": "reasonCode3",
                            "reasonCodeValue": "36"
                        },
                        {
                            "reasonCodeName": "reasonCode4",
                            "reasonCodeValue": "25"
                        },
                        {
                            "reasonCodeName": "reasonCode5",
                            "reasonCodeValue": "38"
                        }
                    ]
                }
            ],
            "addresses": [
                {
                    "index": "A01",
                    "line1": "V24 SECTOR 24",
                    "line4": "DELHI",
                    "line5": "DELHI",
                    "stateCode": "07",
                    "pinCode": "110001",
                    "addressCategory": "04",
                    "residenceCode": "01",
                    "dateReported": "22082024",
                    "enquiryEnriched": "Y"
                },
                {
                    "index": "A02",
                    "line1": "DINANATH COLONY PANIPAT HARYANA",
                    "line4": "NEW DELHI",
                    "line5": "DELHI",
                    "stateCode": "07",
                    "pinCode": "110057",
                    "addressCategory": "04",
                    "residenceCode": "01",
                    "dateReported": "25072024",
                    "enquiryEnriched": "Y"
                },
                {
                    "index": "A03",
                    "line1": "A47,DELHI A47,DELHI A47,DELHI",
                    "line4": "NEW DELHI",
                    "line5": "DELHI",
                    "stateCode": "07",
                    "pinCode": "110057",
                    "addressCategory": "04",
                    "residenceCode": "01",
                    "dateReported": "11072024",
                    "enquiryEnriched": "Y"
                },
                {
                    "index": "A04",
                    "line1": "HDFC BANK LTD",
                    "line2": "1ST FLOOR M S SHOPPING MALL",
                    "line3": "RESIDENCY ROAD SRINAGAR",
                    "line5": "SRINAGAR JK",
                    "stateCode": "01",
                    "pinCode": "190001",
                    "addressCategory": "02",
                    "dateReported": "31012024"
                }
            ],
            "accounts": [
                {
                    "index": "T001",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "31012024",
                    "dateReported": "29022024",
                    "highCreditAmount": 298643,
                    "currentBalance": 298643,
                    "paymentHistory": "000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01012024",
                    "collateralType": "00"
                },
                {
                    "index": "T002",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "10",
                    "ownershipIndicator": 1,
                    "dateOpened": "08012024",
                    "lastPaymentDate": "10022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 21640,
                    "currentBalance": 21935,
                    "paymentHistory": "000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01012024",
                    "creditLimit": 150000
                },
                {
                    "index": "T003",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "07012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 5208,
                    "currentBalance": 5208,
                    "paymentHistory": "000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01012024",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T004",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "04012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 14000,
                    "currentBalance": 14000,
                    "paymentHistory": "000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01012024",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T005",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "03012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 16900,
                    "currentBalance": 16900,
                    "paymentHistory": "000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01012024",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T006",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "30122023",
                    "lastPaymentDate": "02022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 312000,
                    "currentBalance": 301534,
                    "paymentHistory": "000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01122023",
                    "collateralType": "00",
                    "paymentTenure": 24,
                    "emiAmount": 16567,
                    "paymentFrequency": "03"
                },
                {
                    "index": "T007",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "19122023",
                    "lastPaymentDate": "05012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 19500,
                    "currentBalance": 18534,
                    "paymentHistory": "000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01122023",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1226
                },
                {
                    "index": "T008",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "19122023",
                    "lastPaymentDate": "05012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 35000,
                    "currentBalance": 33266,
                    "paymentHistory": "000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01122023",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 2200
                },
                {
                    "index": "T009",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "27112023",
                    "lastPaymentDate": "14022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 25000,
                    "currentBalance": 15000,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01112023",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T010",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "10092023",
                    "lastPaymentDate": "05022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 65000,
                    "currentBalance": 39454,
                    "paymentHistory": "000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01092023",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T011",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "05092023",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 10000,
                    "currentBalance": 9409,
                    "paymentHistory": "000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01092023",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 189
                },
                {
                    "index": "T012",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "24082023",
                    "lastPaymentDate": "31012024",
                    "dateClosed": "31012024",
                    "dateReported": "29022024",
                    "highCreditAmount": 298495,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01082023",
                    "collateralType": "00"
                },
                {
                    "index": "T013",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "13062023",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 10000,
                    "currentBalance": 8959,
                    "paymentHistory": "000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01062023",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 189
                },
                {
                    "index": "T014",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "31052023",
                    "lastPaymentDate": "08122023",
                    "dateReported": "31122023",
                    "highCreditAmount": 160640,
                    "currentBalance": 150456,
                    "paymentHistory": "000000000000000000000000",
                    "paymentStartDate": "01122023",
                    "paymentEndDate": "01052023",
                    "interestRate": 40.5,
                    "paymentTenure": 18,
                    "emiAmount": 12538,
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 75228,
                    "cibilRemarksCode": "      ",
                    "errorRemarksCode1": "      ",
                    "errorRemarksCode2": "      "
                },
                {
                    "index": "T015",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "17052023",
                    "lastPaymentDate": "01112023",
                    "dateClosed": "01112023",
                    "dateReported": "30112023",
                    "highCreditAmount": 25000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000",
                    "paymentStartDate": "01112023",
                    "paymentEndDate": "01052023",
                    "paymentTenure": 5,
                    "emiAmount": 5748,
                    "paymentFrequency": "03"
                },
                {
                    "index": "T016",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "30032023",
                    "lastPaymentDate": "30082023",
                    "dateClosed": "30082023",
                    "dateReported": "31082023",
                    "highCreditAmount": 57000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000",
                    "paymentStartDate": "01082023",
                    "paymentEndDate": "01032023"
                },
                {
                    "index": "T017",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "30032023",
                    "lastPaymentDate": "30082023",
                    "dateClosed": "30082023",
                    "dateReported": "31082023",
                    "highCreditAmount": 3000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000",
                    "paymentStartDate": "01082023",
                    "paymentEndDate": "01032023",
                    "paymentTenure": 6,
                    "emiAmount": 524,
                    "paymentFrequency": "03"
                },
                {
                    "index": "T018",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "13032023",
                    "lastPaymentDate": "05092023",
                    "dateClosed": "08092023",
                    "dateReported": "30092023",
                    "highCreditAmount": 75000,
                    "currentBalance": 0,
                    "paymentHistory": "000XXX000000000000000",
                    "paymentStartDate": "01092023",
                    "paymentEndDate": "01032023",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T019",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "08032023",
                    "lastPaymentDate": "29122023",
                    "dateClosed": "29122023",
                    "dateReported": "31122023",
                    "highCreditAmount": 244000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000",
                    "paymentStartDate": "01122023",
                    "paymentEndDate": "01032023",
                    "collateralType": "00",
                    "paymentTenure": 18,
                    "emiAmount": 16395,
                    "paymentFrequency": "03",
                    "cibilRemarksCode": "      ",
                    "errorRemarksCode1": "      ",
                    "errorRemarksCode2": "      "
                },
                {
                    "index": "T020",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "03032023",
                    "lastPaymentDate": "16022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 41700,
                    "currentBalance": 41699,
                    "paymentHistory": "STDSTDSTDSTDSTDSTDSTDSTDSTDSTDSTDSTD",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01032023"
                },
                {
                    "index": "T021",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "03032023",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 11000,
                    "currentBalance": 9354,
                    "paymentHistory": "000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01032023",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 208
                },
                {
                    "index": "T022",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "28012023",
                    "lastPaymentDate": "24082023",
                    "dateClosed": "29082023",
                    "dateReported": "30092023",
                    "highCreditAmount": 178289,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000",
                    "paymentStartDate": "01092023",
                    "paymentEndDate": "01012023",
                    "paymentTenure": 12,
                    "emiAmount": 17032,
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 96355
                },
                {
                    "index": "T023",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "10",
                    "ownershipIndicator": 1,
                    "dateOpened": "19012023",
                    "lastPaymentDate": "09032023",
                    "dateClosed": "14032023",
                    "dateReported": "30062023",
                    "highCreditAmount": 6886,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000",
                    "paymentStartDate": "01062023",
                    "paymentEndDate": "01012023",
                    "creditLimit": 300000
                },
                {
                    "index": "T024",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "15012023",
                    "lastPaymentDate": "02022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 149172,
                    "currentBalance": 51637,
                    "paymentHistory": "000000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01082023"
                },
                {
                    "index": "T025",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "15012023",
                    "lastPaymentDate": "02032024",
                    "dateReported": "14032024",
                    "highCreditAmount": 71885,
                    "currentBalance": 49041,
                    "paymentHistory": "000000000000000000000XXX000XXXXXX000000",
                    "paymentStartDate": "01032024",
                    "paymentEndDate": "01032023",
                    "paymentFrequency": "01"
                },
                {
                    "index": "T026",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "21122022",
                    "lastPaymentDate": "05012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 60000,
                    "currentBalance": 21608,
                    "paymentHistory": "000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01122022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 3771
                },
                {
                    "index": "T027",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "19122022",
                    "lastPaymentDate": "05022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 125000,
                    "currentBalance": 64673,
                    "paymentHistory": "000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01122022",
                    "interestRate": 23.99,
                    "paymentTenure": 24,
                    "emiAmount": 6609,
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 85917
                },
                {
                    "index": "T028",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "16122022",
                    "lastPaymentDate": "29052023",
                    "dateClosed": "29052023",
                    "dateReported": "31072023",
                    "highCreditAmount": 80000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000",
                    "paymentStartDate": "01072023",
                    "paymentEndDate": "01052023",
                    "interestRate": 14.4,
                    "paymentTenure": 6,
                    "emiAmount": 15253,
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 91518
                },
                {
                    "index": "T029",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "09112022",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 11000,
                    "currentBalance": 8676,
                    "paymentHistory": "000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01112022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 208
                },
                {
                    "index": "T030",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "01102022",
                    "lastPaymentDate": "01012023",
                    "dateClosed": "01012023",
                    "dateReported": "31012023",
                    "highCreditAmount": 18339,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01012023",
                    "paymentEndDate": "01102022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1619
                },
                {
                    "index": "T031",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "12092022",
                    "lastPaymentDate": "05012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 30000,
                    "currentBalance": 3698,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01092022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1886
                },
                {
                    "index": "T032",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "01092022",
                    "lastPaymentDate": "05012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 30000,
                    "currentBalance": 3699,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01092022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1886
                },
                {
                    "index": "T033",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "30082022",
                    "lastPaymentDate": "01122022",
                    "dateClosed": "01122022",
                    "dateReported": "31122022",
                    "highCreditAmount": 4959,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01122022",
                    "paymentEndDate": "01092022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 5075
                },
                {
                    "index": "T034",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "25082022",
                    "lastPaymentDate": "25112022",
                    "dateClosed": "25112022",
                    "dateReported": "30112022",
                    "highCreditAmount": 12300,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01112022",
                    "paymentEndDate": "01082022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 5325
                },
                {
                    "index": "T035",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "25082022",
                    "lastPaymentDate": "05012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 20000,
                    "currentBalance": 2464,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01082022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1257
                },
                {
                    "index": "T036",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "25082022",
                    "lastPaymentDate": "05012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 20000,
                    "currentBalance": 2464,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01082022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1257
                },
                {
                    "index": "T037",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "28072022",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 15000,
                    "currentBalance": 11121,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01072022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 283
                },
                {
                    "index": "T038",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "26072022",
                    "lastPaymentDate": "05012024",
                    "dateClosed": "05022024",
                    "dateReported": "05022024",
                    "highCreditAmount": 14500,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01072022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 911
                },
                {
                    "index": "T039",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "16072022",
                    "lastPaymentDate": "05032023",
                    "dateClosed": "10032023",
                    "dateReported": "31032023",
                    "highCreditAmount": 75000,
                    "currentBalance": 0,
                    "paymentHistory": "000XXX000000000000000000000",
                    "paymentStartDate": "01032023",
                    "paymentEndDate": "01072022",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T040",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "02072022",
                    "lastPaymentDate": "02102022",
                    "dateClosed": "02102022",
                    "dateReported": "31102022",
                    "highCreditAmount": 4656,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01102022",
                    "paymentEndDate": "01072022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 4765
                },
                {
                    "index": "T041",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "28062022",
                    "lastPaymentDate": "05012024",
                    "dateClosed": "12012024",
                    "dateReported": "31012024",
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01062022",
                    "cibilRemarksCode": "      ",
                    "errorRemarksCode1": "      ",
                    "errorRemarksCode2": "      "
                },
                {
                    "index": "T042",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "20062022",
                    "lastPaymentDate": "05012024",
                    "dateClosed": "12012024",
                    "dateReported": "31012024",
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01062022"
                },
                {
                    "index": "T043",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "12052022",
                    "lastPaymentDate": "05112023",
                    "dateClosed": "05112023",
                    "dateReported": "30112023",
                    "highCreditAmount": 20000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01112023",
                    "paymentEndDate": "01052022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1257
                },
                {
                    "index": "T044",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "19042022",
                    "lastPaymentDate": "15062023",
                    "dateClosed": "15062023",
                    "dateReported": "29022024",
                    "highCreditAmount": 20000,
                    "currentBalance": 0,
                    "paymentHistory": "000XXXXXXXXXXXXXXXXXXXXX000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01042022",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T045",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "16042022",
                    "lastPaymentDate": "05102023",
                    "dateClosed": "05102023",
                    "dateReported": "31102023",
                    "highCreditAmount": 20000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01102023",
                    "paymentEndDate": "01042022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1257
                },
                {
                    "index": "T046",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "16042022",
                    "lastPaymentDate": "05102023",
                    "dateClosed": "05102023",
                    "dateReported": "31102023",
                    "highCreditAmount": 10000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01102023",
                    "paymentEndDate": "01042022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 629
                },
                {
                    "index": "T047",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "29032022",
                    "lastPaymentDate": "05102023",
                    "dateClosed": "05102023",
                    "dateReported": "31102023",
                    "highCreditAmount": 10000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01102023",
                    "paymentEndDate": "01032022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 629
                },
                {
                    "index": "T048",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "29032022",
                    "lastPaymentDate": "08032023",
                    "dateClosed": "08032023",
                    "dateReported": "31032023",
                    "highCreditAmount": 227000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000",
                    "paymentStartDate": "01032023",
                    "paymentEndDate": "01032022",
                    "collateralType": "00",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T049",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "10",
                    "ownershipIndicator": 1,
                    "dateOpened": "21022022",
                    "lastPaymentDate": "01022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 47311,
                    "currentBalance": 133065,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01022022",
                    "creditLimit": 150000,
                    "cashLimit": 45000,
                    "actualPaymentAmount": 24000
                },
                {
                    "index": "T050",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "25012022",
                    "lastPaymentDate": "25042022",
                    "dateClosed": "25042022",
                    "dateReported": "30042022",
                    "highCreditAmount": 2079,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01042022",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 2128
                },
                {
                    "index": "T051",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "23012022",
                    "lastPaymentDate": "23042022",
                    "dateClosed": "23042022",
                    "dateReported": "30042022",
                    "highCreditAmount": 2698,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01042022",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1718
                },
                {
                    "index": "T052",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "22012022",
                    "lastPaymentDate": "05082023",
                    "dateClosed": "05082023",
                    "dateReported": "31082023",
                    "highCreditAmount": 25000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01082023",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1571
                },
                {
                    "index": "T053",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "21012022",
                    "lastPaymentDate": "21042022",
                    "dateClosed": "21042022",
                    "dateReported": "30042022",
                    "highCreditAmount": 3147,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01042022",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 841
                },
                {
                    "index": "T054",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "19012022",
                    "lastPaymentDate": "05072023",
                    "dateClosed": "05072023",
                    "dateReported": "31072023",
                    "highCreditAmount": 35000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01072023",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 2200
                },
                {
                    "index": "T055",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "16012022",
                    "lastPaymentDate": "16042022",
                    "dateClosed": "16042022",
                    "dateReported": "30042022",
                    "highCreditAmount": 2850,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01042022",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 2916
                },
                {
                    "index": "T056",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "16012022",
                    "lastPaymentDate": "16042022",
                    "dateClosed": "16042022",
                    "dateReported": "30042022",
                    "highCreditAmount": 3781,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01042022",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 3869
                },
                {
                    "index": "T057",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "14012022",
                    "lastPaymentDate": "05072022",
                    "dateClosed": "15072022",
                    "dateReported": "31072022",
                    "highCreditAmount": 60000,
                    "currentBalance": 0,
                    "paymentHistory": "000XXX000000000000000",
                    "paymentStartDate": "01072022",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T058",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "05012022",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 15000,
                    "currentBalance": 9443,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 283
                },
                {
                    "index": "T059",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "05012022",
                    "lastPaymentDate": "20012022",
                    "dateClosed": "20012022",
                    "dateReported": "31012022",
                    "highCreditAmount": 1377,
                    "currentBalance": 0,
                    "paymentHistory": "000",
                    "paymentStartDate": "01012022",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1393
                },
                {
                    "index": "T060",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "28122021",
                    "lastPaymentDate": "05072023",
                    "dateClosed": "05072023",
                    "dateReported": "31072023",
                    "highCreditAmount": 77500,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01072023",
                    "paymentEndDate": "01122021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 4871
                },
                {
                    "index": "T061",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "10",
                    "ownershipIndicator": 1,
                    "dateOpened": "19122021",
                    "lastPaymentDate": "15012024",
                    "dateReported": "19012024",
                    "highCreditAmount": 28546,
                    "currentBalance": 7491,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01012022",
                    "creditLimit": 80000,
                    "cashLimit": 8000,
                    "cibilRemarksCode": "      ",
                    "errorRemarksCode1": "      ",
                    "errorRemarksCode2": "      "
                },
                {
                    "index": "T062",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "06122021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 15000,
                    "currentBalance": 9200,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01122021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 283
                },
                {
                    "index": "T063",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "04122021",
                    "lastPaymentDate": "04032022",
                    "dateClosed": "04032022",
                    "dateReported": "31032022",
                    "highCreditAmount": 4695,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01032022",
                    "paymentEndDate": "01122021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 3238
                },
                {
                    "index": "T064",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "03122021",
                    "lastPaymentDate": "03032022",
                    "dateClosed": "03032022",
                    "dateReported": "31032022",
                    "highCreditAmount": 10633,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01032022",
                    "paymentEndDate": "01122021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 3292
                },
                {
                    "index": "T065",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "02122021",
                    "lastPaymentDate": "05062023",
                    "dateClosed": "12062023",
                    "dateReported": "30062023",
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01062023",
                    "paymentEndDate": "01122021"
                },
                {
                    "index": "T066",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "30112021",
                    "lastPaymentDate": "01032022",
                    "dateClosed": "01032022",
                    "dateReported": "31032022",
                    "highCreditAmount": 3357,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01032022",
                    "paymentEndDate": "01122021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 3435
                },
                {
                    "index": "T067",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "29112021",
                    "lastPaymentDate": "05062023",
                    "dateClosed": "05062023",
                    "dateReported": "30062023",
                    "highCreditAmount": 22500,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01062023",
                    "paymentEndDate": "01112021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1414
                },
                {
                    "index": "T068",
                    "memberShortName": "NOT DISCLOSED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "21112021",
                    "lastPaymentDate": "29032022",
                    "dateClosed": "29032022",
                    "dateReported": "31032022",
                    "highCreditAmount": 97000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000",
                    "paymentStartDate": "01032022",
                    "paymentEndDate": "01112021",
                    "collateralType": "00",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T069",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "07112021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 15000,
                    "currentBalance": 8955,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01012022",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 283
                },
                {
                    "index": "T070",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "06102021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 15000,
                    "currentBalance": 8709,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01102021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 283
                },
                {
                    "index": "T071",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "07092021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 14000,
                    "currentBalance": 7896,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01092021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 264
                },
                {
                    "index": "T072",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "05082021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 15000,
                    "currentBalance": 8215,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01082021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 283
                },
                {
                    "index": "T073",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "05072021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 14000,
                    "currentBalance": 7433,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01072021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 264
                },
                {
                    "index": "T074",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "13062021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 13000,
                    "currentBalance": 6683,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01062021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 245
                },
                {
                    "index": "T075",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "07052021",
                    "lastPaymentDate": "05112022",
                    "dateClosed": "05112022",
                    "dateReported": "30112022",
                    "highCreditAmount": 78500,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01112022",
                    "paymentEndDate": "01052021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 4934
                },
                {
                    "index": "T076",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "06052021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 14000,
                    "currentBalance": 6965,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01052021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 264
                },
                {
                    "index": "T077",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "19042021",
                    "lastPaymentDate": "05012022",
                    "dateClosed": "13012022",
                    "dateReported": "31012022",
                    "highCreditAmount": 30000,
                    "currentBalance": 0,
                    "paymentHistory": "000XXX000000000000000000000000",
                    "paymentStartDate": "01012022",
                    "paymentEndDate": "01042021",
                    "paymentFrequency": "03"
                },
                {
                    "index": "T078",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "05042021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 13000,
                    "currentBalance": 6248,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01042021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 245
                },
                {
                    "index": "T079",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "05032021",
                    "lastPaymentDate": "01012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 18000,
                    "currentBalance": 8358,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01032021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 340
                },
                {
                    "index": "T080",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "28022021",
                    "lastPaymentDate": "05092022",
                    "dateClosed": "05092022",
                    "dateReported": "30092022",
                    "highCreditAmount": 22000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01092022",
                    "paymentEndDate": "01032021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1383
                },
                {
                    "index": "T081",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "27022021",
                    "lastPaymentDate": "05092022",
                    "dateClosed": "05092022",
                    "dateReported": "30092022",
                    "highCreditAmount": 9750,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01092022",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 613
                },
                {
                    "index": "T082",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "22022021",
                    "lastPaymentDate": "05092022",
                    "dateClosed": "05092022",
                    "dateReported": "30092022",
                    "highCreditAmount": 29000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01092022",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1823
                },
                {
                    "index": "T083",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "22022021",
                    "lastPaymentDate": "05092022",
                    "dateClosed": "05092022",
                    "dateReported": "30092022",
                    "highCreditAmount": 29000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01092022",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1823
                },
                {
                    "index": "T084",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "17022021",
                    "lastPaymentDate": "17052021",
                    "dateClosed": "17052021",
                    "dateReported": "31052021",
                    "highCreditAmount": 2775,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01052021",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 2840
                },
                {
                    "index": "T085",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "16022021",
                    "lastPaymentDate": "05082022",
                    "dateClosed": "05082022",
                    "dateReported": "31082022",
                    "highCreditAmount": 7200,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01082022",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 453
                },
                {
                    "index": "T086",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "06022021",
                    "lastPaymentDate": "05082022",
                    "dateClosed": "05082022",
                    "dateReported": "31082022",
                    "highCreditAmount": 24500,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01082022",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1540
                },
                {
                    "index": "T087",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "01022021",
                    "lastPaymentDate": "05082022",
                    "dateClosed": "05082022",
                    "dateReported": "31082022",
                    "highCreditAmount": 10000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01082022",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 629
                },
                {
                    "index": "T088",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "23012021",
                    "lastPaymentDate": "23042021",
                    "dateClosed": "23042021",
                    "dateReported": "30042021",
                    "highCreditAmount": 5496,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01042021",
                    "paymentEndDate": "01012021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 3068
                },
                {
                    "index": "T089",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "21012021",
                    "lastPaymentDate": "05082022",
                    "dateClosed": "05082022",
                    "dateReported": "31082022",
                    "highCreditAmount": 9990,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01082022",
                    "paymentEndDate": "01012021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 628
                },
                {
                    "index": "T090",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "19012021",
                    "lastPaymentDate": "05072022",
                    "dateClosed": "05072022",
                    "dateReported": "31072022",
                    "highCreditAmount": 16750,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01072022",
                    "paymentEndDate": "01012021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1053
                },
                {
                    "index": "T091",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "18012021",
                    "lastPaymentDate": "18042021",
                    "dateClosed": "18042021",
                    "dateReported": "30042021",
                    "highCreditAmount": 3990,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01042021",
                    "paymentEndDate": "01012021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 4083
                },
                {
                    "index": "T092",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "14012021",
                    "lastPaymentDate": "05072022",
                    "dateClosed": "05072022",
                    "dateReported": "31072022",
                    "highCreditAmount": 21500,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01072022",
                    "paymentEndDate": "01012021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1351
                },
                {
                    "index": "T093",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "07012021",
                    "lastPaymentDate": "05012022",
                    "dateClosed": "09022022",
                    "dateReported": "28022022",
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000",
                    "paymentStartDate": "01022022",
                    "paymentEndDate": "01012021"
                },
                {
                    "index": "T094",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "12112020",
                    "lastPaymentDate": "05052022",
                    "dateClosed": "05052022",
                    "dateReported": "31052022",
                    "highCreditAmount": 36500,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000XXX000000000000000000000000000000000000",
                    "paymentStartDate": "01052022",
                    "paymentEndDate": "01112020",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 2294
                },
                {
                    "index": "T095",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "07112020",
                    "lastPaymentDate": "05052022",
                    "dateClosed": "12052022",
                    "dateReported": "31052022",
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01052022",
                    "paymentEndDate": "01112020"
                },
                {
                    "index": "T096",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "04112020",
                    "lastPaymentDate": "05052022",
                    "dateClosed": "12052022",
                    "dateReported": "31052022",
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01052022",
                    "paymentEndDate": "01112020"
                },
                {
                    "index": "T097",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "00",
                    "ownershipIndicator": 1,
                    "dateOpened": "28092020",
                    "lastPaymentDate": "01012021",
                    "dateClosed": "01012021",
                    "dateReported": "31012021",
                    "highCreditAmount": 7649,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000",
                    "paymentStartDate": "01012021",
                    "paymentEndDate": "01092020",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 5103
                },
                {
                    "index": "T098",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "29082020",
                    "lastPaymentDate": "05032022",
                    "dateClosed": "05032022",
                    "dateReported": "31032022",
                    "highCreditAmount": 47000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01032022",
                    "paymentEndDate": "01082020",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 2954
                },
                {
                    "index": "T099",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "06",
                    "ownershipIndicator": 1,
                    "dateOpened": "10032020",
                    "lastPaymentDate": "05062020",
                    "dateClosed": "10072020",
                    "dateReported": "31102020",
                    "highCreditAmount": 69850,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000025000",
                    "paymentStartDate": "01102020",
                    "paymentEndDate": "01032020"
                },
                {
                    "index": "T100",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "10012020",
                    "lastPaymentDate": "07012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 625000,
                    "currentBalance": 153754,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 13589
                },
                {
                    "index": "T101",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "19102019",
                    "lastPaymentDate": "13012020",
                    "dateClosed": "13012020",
                    "dateReported": "31012020",
                    "highCreditAmount": 450000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000",
                    "paymentStartDate": "01012020",
                    "paymentEndDate": "01102019",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 444659
                },
                {
                    "index": "T102",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "01",
                    "ownershipIndicator": 1,
                    "dateOpened": "22022018",
                    "lastPaymentDate": "05012024",
                    "dateReported": "31012024",
                    "highCreditAmount": 669202,
                    "currentBalance": 142222,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012024",
                    "paymentEndDate": "01022021",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 10733
                },
                {
                    "index": "T103",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "10",
                    "ownershipIndicator": 1,
                    "dateOpened": "10072017",
                    "lastPaymentDate": "02022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 243516,
                    "currentBalance": 164997,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01032021",
                    "creditLimit": 300000
                },
                {
                    "index": "T104",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "20062016",
                    "lastPaymentDate": "21102019",
                    "dateClosed": "21102019",
                    "dateReported": "31102019",
                    "highCreditAmount": 800000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01102019",
                    "paymentEndDate": "01112016",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 343283
                },
                {
                    "index": "T105",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "27012015",
                    "lastPaymentDate": "03012022",
                    "dateClosed": "03012022",
                    "dateReported": "31012022",
                    "highCreditAmount": 1000000,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01012022",
                    "paymentEndDate": "01022019",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 13356
                },
                {
                    "index": "T106",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "20022014",
                    "lastPaymentDate": "28032018",
                    "dateClosed": "28032018",
                    "dateReported": "31032018",
                    "highCreditAmount": 500000,
                    "currentBalance": 0,
                    "paymentHistory": "000058061030000060060030STD060030STD058027091060029060029061030STD060029STDSTDSTDSTDSTDSTDSTDSTDSTDSTDSTDSTD",
                    "paymentStartDate": "01032018",
                    "paymentEndDate": "01042015",
                    "collateralType": "00",
                    "interestRate": 15.25,
                    "paymentTenure": 60,
                    "emiAmount": 11890,
                    "paymentFrequency": "03"
                },
                {
                    "index": "T107",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "01",
                    "ownershipIndicator": 1,
                    "dateOpened": "27122012",
                    "lastPaymentDate": "22022018",
                    "dateClosed": "22022018",
                    "dateReported": "28022018",
                    "highCreditAmount": 413984,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000025000000000000000000023026026025026000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01022018",
                    "paymentEndDate": "01032015",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 148375
                },
                {
                    "index": "T108",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "05",
                    "ownershipIndicator": 1,
                    "dateOpened": "07062012",
                    "lastPaymentDate": "02062017",
                    "dateClosed": "02062017",
                    "dateReported": "30062017",
                    "highCreditAmount": 38114,
                    "currentBalance": 0,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01062017",
                    "paymentEndDate": "01122014",
                    "paymentFrequency": "03",
                    "actualPaymentAmount": 1354
                },
                {
                    "index": "T109",
                    "memberShortName": "CEASE-TERMINATED",
                    "accountType": "10",
                    "ownershipIndicator": 1,
                    "dateOpened": "09052008",
                    "lastPaymentDate": "19022024",
                    "dateReported": "29022024",
                    "highCreditAmount": 138133,
                    "currentBalance": 138133,
                    "paymentHistory": "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "paymentStartDate": "01022024",
                    "paymentEndDate": "01032021",
                    "creditLimit": 300000
                }
            ],
            "enquiries": [
                {
                    "index": "I001",
                    "enquiryDate": "27082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I002",
                    "enquiryDate": "27082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I003",
                    "enquiryDate": "26082024",
                    "memberShortName": "GENESISSEC",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I004",
                    "enquiryDate": "26082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I005",
                    "enquiryDate": "26082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I006",
                    "enquiryDate": "24082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I007",
                    "enquiryDate": "23082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I008",
                    "enquiryDate": "23082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I009",
                    "enquiryDate": "22082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "03",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I010",
                    "enquiryDate": "22082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I011",
                    "enquiryDate": "22082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "03",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I012",
                    "enquiryDate": "22082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I013",
                    "enquiryDate": "22082024",
                    "memberShortName": "GENESISSEC",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I014",
                    "enquiryDate": "21082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I015",
                    "enquiryDate": "20082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I016",
                    "enquiryDate": "17082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I017",
                    "enquiryDate": "17082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I018",
                    "enquiryDate": "16082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I019",
                    "enquiryDate": "16082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I020",
                    "enquiryDate": "14082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I021",
                    "enquiryDate": "13082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I022",
                    "enquiryDate": "12082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I023",
                    "enquiryDate": "09082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I024",
                    "enquiryDate": "05082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I025",
                    "enquiryDate": "03082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I026",
                    "enquiryDate": "02082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "51",
                    "enquiryAmount": 400000
                },
                {
                    "index": "I027",
                    "enquiryDate": "02082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I028",
                    "enquiryDate": "01082024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 567890
                },
                {
                    "index": "I029",
                    "enquiryDate": "31072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I030",
                    "enquiryDate": "30072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I031",
                    "enquiryDate": "30072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 1
                },
                {
                    "index": "I032",
                    "enquiryDate": "30072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 1000000
                },
                {
                    "index": "I033",
                    "enquiryDate": "26072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 1000000
                },
                {
                    "index": "I034",
                    "enquiryDate": "25072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 1000000
                },
                {
                    "index": "I035",
                    "enquiryDate": "24072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I036",
                    "enquiryDate": "23072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I037",
                    "enquiryDate": "23072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I038",
                    "enquiryDate": "23072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I039",
                    "enquiryDate": "23072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I040",
                    "enquiryDate": "23072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "01",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I041",
                    "enquiryDate": "23072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I042",
                    "enquiryDate": "18072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I043",
                    "enquiryDate": "18072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "01",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I044",
                    "enquiryDate": "17072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I045",
                    "enquiryDate": "16072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 49500
                },
                {
                    "index": "I046",
                    "enquiryDate": "15072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I047",
                    "enquiryDate": "11072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 2800000
                },
                {
                    "index": "I048",
                    "enquiryDate": "11072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I049",
                    "enquiryDate": "09072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I050",
                    "enquiryDate": "04072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I051",
                    "enquiryDate": "04072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I052",
                    "enquiryDate": "03072024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "08",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I053",
                    "enquiryDate": "28062024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "34",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I054",
                    "enquiryDate": "27062024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I055",
                    "enquiryDate": "27062024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "01",
                    "enquiryAmount": 100000
                },
                {
                    "index": "I056",
                    "enquiryDate": "26062024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 400000
                },
                {
                    "index": "I057",
                    "enquiryDate": "25062024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 400000
                },
                {
                    "index": "I058",
                    "enquiryDate": "25062024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 59500
                },
                {
                    "index": "I059",
                    "enquiryDate": "07032024",
                    "memberShortName": "CHOLA INVST FIN",
                    "enquiryPurpose": "51",
                    "enquiryAmount": 2000000
                },
                {
                    "index": "I060",
                    "enquiryDate": "05032024",
                    "memberShortName": "CHOLA INVST FIN",
                    "enquiryPurpose": "51",
                    "enquiryAmount": 100000
                },
                {
                    "index": "I061",
                    "enquiryDate": "02032024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 10000
                },
                {
                    "index": "I062",
                    "enquiryDate": "29022024",
                    "memberShortName": "CHOLA INVST FIN",
                    "enquiryPurpose": "51",
                    "enquiryAmount": 2000000
                },
                {
                    "index": "I063",
                    "enquiryDate": "28022024",
                    "memberShortName": "IDFC FIRST BANK",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 20000
                },
                {
                    "index": "I064",
                    "enquiryDate": "26022024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 150000
                },
                {
                    "index": "I065",
                    "enquiryDate": "15022024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 10000
                },
                {
                    "index": "I066",
                    "enquiryDate": "31012024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 239154
                },
                {
                    "index": "I067",
                    "enquiryDate": "25012024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I068",
                    "enquiryDate": "18012024",
                    "memberShortName": "PAYUFINAN",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I069",
                    "enquiryDate": "17012024",
                    "memberShortName": "IDFC FIRST BANK",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 20000
                },
                {
                    "index": "I070",
                    "enquiryDate": "17012024",
                    "memberShortName": "PAYUFINAN",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I071",
                    "enquiryDate": "16012024",
                    "memberShortName": "CITRAFINA",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I072",
                    "enquiryDate": "16012024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 10000
                },
                {
                    "index": "I073",
                    "enquiryDate": "08012024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1400000
                },
                {
                    "index": "I074",
                    "enquiryDate": "03012024",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 15000
                },
                {
                    "index": "I075",
                    "enquiryDate": "08122023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "06",
                    "enquiryAmount": 4000
                },
                {
                    "index": "I076",
                    "enquiryDate": "03122023",
                    "memberShortName": "HDFC BANK",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I077",
                    "enquiryDate": "02122023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 14000
                },
                {
                    "index": "I078",
                    "enquiryDate": "02122023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 150000
                },
                {
                    "index": "I079",
                    "enquiryDate": "06102023",
                    "memberShortName": "PAYUFINAN",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I080",
                    "enquiryDate": "06102023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I081",
                    "enquiryDate": "04102023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I082",
                    "enquiryDate": "01102023",
                    "memberShortName": "PAYUFINAN",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I083",
                    "enquiryDate": "18092023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 2000
                },
                {
                    "index": "I084",
                    "enquiryDate": "15092023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 10000
                },
                {
                    "index": "I085",
                    "enquiryDate": "14092023",
                    "memberShortName": "PAYUFINAN",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I086",
                    "enquiryDate": "14092023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 150000
                },
                {
                    "index": "I087",
                    "enquiryDate": "13092023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 150000
                },
                {
                    "index": "I088",
                    "enquiryDate": "08092023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I089",
                    "enquiryDate": "30082023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "06",
                    "enquiryAmount": 4000
                },
                {
                    "index": "I090",
                    "enquiryDate": "24082023",
                    "memberShortName": "PAYUFINAN",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I091",
                    "enquiryDate": "28072023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1500000
                },
                {
                    "index": "I092",
                    "enquiryDate": "20072023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 150000
                },
                {
                    "index": "I093",
                    "enquiryDate": "05072023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I094",
                    "enquiryDate": "03072023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I095",
                    "enquiryDate": "05062023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I096",
                    "enquiryDate": "02062023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I097",
                    "enquiryDate": "30052023",
                    "memberShortName": "HDFC BANK",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I098",
                    "enquiryDate": "07052023",
                    "memberShortName": "AU SFB",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 100
                },
                {
                    "index": "I099",
                    "enquiryDate": "06052023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 2500000
                },
                {
                    "index": "I100",
                    "enquiryDate": "17042023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I101",
                    "enquiryDate": "10042023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I102",
                    "enquiryDate": "05042023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1500000
                },
                {
                    "index": "I103",
                    "enquiryDate": "03042023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1
                },
                {
                    "index": "I104",
                    "enquiryDate": "25032023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "06",
                    "enquiryAmount": 4000
                },
                {
                    "index": "I105",
                    "enquiryDate": "17032023",
                    "memberShortName": "BAJAJ FIN LTD",
                    "enquiryPurpose": "06",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I106",
                    "enquiryDate": "09032023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I107",
                    "enquiryDate": "03032023",
                    "memberShortName": "KRAZYBEE",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 3000
                },
                {
                    "index": "I108",
                    "enquiryDate": "03032023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 125000
                },
                {
                    "index": "I109",
                    "enquiryDate": "02032023",
                    "memberShortName": "CEASE-TERMINATED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I110",
                    "enquiryDate": "09022023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I111",
                    "enquiryDate": "28012023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I112",
                    "enquiryDate": "27012023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 25000
                },
                {
                    "index": "I113",
                    "enquiryDate": "27012023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 178289
                },
                {
                    "index": "I114",
                    "enquiryDate": "24012023",
                    "memberShortName": "BAJAJ FIN LTD",
                    "enquiryPurpose": "06",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I115",
                    "enquiryDate": "15012023",
                    "memberShortName": "HDFC BANK",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 1000
                },
                {
                    "index": "I116",
                    "enquiryDate": "12012023",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 2000
                },
                {
                    "index": "I117",
                    "enquiryDate": "29122022",
                    "memberShortName": "CEASE-TERMINATED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 100000
                },
                {
                    "index": "I118",
                    "enquiryDate": "10122022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 25000
                },
                {
                    "index": "I119",
                    "enquiryDate": "28112022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 2500000
                },
                {
                    "index": "I120",
                    "enquiryDate": "21112022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1
                },
                {
                    "index": "I121",
                    "enquiryDate": "12112022",
                    "memberShortName": "NAHAR",
                    "enquiryPurpose": "06",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I122",
                    "enquiryDate": "15072022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I123",
                    "enquiryDate": "01062022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1500000
                },
                {
                    "index": "I124",
                    "enquiryDate": "12052022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 500000
                },
                {
                    "index": "I125",
                    "enquiryDate": "11052022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 20000
                },
                {
                    "index": "I126",
                    "enquiryDate": "07052022",
                    "memberShortName": "CEASE-TERMINATED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 10000
                },
                {
                    "index": "I127",
                    "enquiryDate": "18042022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I128",
                    "enquiryDate": "29032022",
                    "memberShortName": "KRAZYBEE",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 227000
                },
                {
                    "index": "I129",
                    "enquiryDate": "09032022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "06",
                    "enquiryAmount": 5000
                },
                {
                    "index": "I130",
                    "enquiryDate": "09032022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1
                },
                {
                    "index": "I131",
                    "enquiryDate": "02032022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 1
                },
                {
                    "index": "I132",
                    "enquiryDate": "25022022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "06",
                    "enquiryAmount": 250000
                },
                {
                    "index": "I133",
                    "enquiryDate": "11022022",
                    "memberShortName": "CEASE-TERMINATED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 10000
                },
                {
                    "index": "I134",
                    "enquiryDate": "12012022",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "00",
                    "enquiryAmount": 50000
                },
                {
                    "index": "I135",
                    "enquiryDate": "14122021",
                    "memberShortName": "NOT DISCLOSED",
                    "enquiryPurpose": "10",
                    "enquiryAmount": 10000
                },
                {
                    "index": "I136",
                    "enquiryDate": "20112021",
                    "memberShortName": "KRAZYBEE",
                    "enquiryPurpose": "05",
                    "enquiryAmount": 3000
                }
            ]
        }
    ],
    "consumerSummaryData": {
        "accountSummary": {
            "totalAccounts": 109,
            "overdueAccounts": 0,
            "zeroBalanceAccounts": 67,
            "highCreditAmount": 8910585,
            "currentBalance": 2031199,
            "overdueBalance": 0,
            "recentDateOpened": "31012024",
            "oldestDateOpened": "09052008"
        },
        "inquirySummary": {
            "totalInquiry": 136,
            "inquiryPast30Days": 32,
            "inquiryPast12Months": 57,
            "inquiryPast24Months": 32,
            "recentInquiryDate": "27082024"
        }
    }
}


async function cibil_pdf_converter(file_name, cibil_json) {
    // Write JSON data to a file
    fs.writeFile(path.resolve(__dirname, './cibilScore_response.txt'), JSON.stringify(cibil_json), 'utf8', (err) => {
        if (err) {
            console.error('An error occurred while writing to the file:', err);
            return;
        }
        console.log('File written successfully!');

        // Define the Python code path
        const pythonCodePath = JSON.stringify(path.resolve(__dirname, 'Code_Convertor.py'));

        

        // Wrap exec in a Promise
        const execPromise = (command) => {
            return new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve({ stdout, stderr });
                });
            });
        };

        try {
            // Execute the Python script and get the result
            const { stdout, stderr } = execPromise(`python3 ${pythonCodePath} ${file_name}.pdf`).then((data) => {
                console.log(`stdout: ${stdout}`);

            }).catch((err) => {
                console.log(err);
                
                console.error(`stderr: ${stderr}`);
            })
        } catch (error) {
            console.error(`exec error: ${error}`);
            throw error; // Re-throw the error to handle it outside the function if needed
        }
    });

}
// runPython.js
module.exports = {
    cibil_pdf_converter
}
