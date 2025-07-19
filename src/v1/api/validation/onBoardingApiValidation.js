const { body, param } = require('express-validator');


exports.onBoardingValidation = (method) => {
    switch (method) {

        case 'applicantApi': {
            return [
                body('panNo', 'Invalid PAN Card format. Must be 5 Captial letters, 4 digits, and 1 Captial letter.')
                    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).not().isEmpty().trim().escape(),

                body('fullName', 'Full Name is required.').not().isEmpty().trim().escape(),

                body('panNo').custom((value, { req }) => {
                    const fullName = req.body.fullName;
                    // Ensure fullName is not empty
                    if (!fullName) {
                        throw new Error('Full Name is required.');
                    }
                    // Determine the character to check from fullName
                    let nameCharacter;
                    if (fullName.includes(' ')) {
                        // If there's a space, take the first character of the last name
                        nameCharacter = fullName.split(' ')[1][0].toUpperCase();
                    } else {
                        // If there's no space, take the first character of the full name
                        nameCharacter = fullName[0].toUpperCase();
                    }

                    const panLastCharacter = value.slice(4, 5); // Get the last character of PAN

                    if (panLastCharacter !== nameCharacter) {
                        throw new Error(
                            `PAN Card Number does not match with the full name`
                        );
                    }
                    return true;
                }),

                body('aadharNo', 'Invalid Aadhaar No. Must be 12 digits, and the first digit must be between 2 to 9.')
                    .matches(/^[2-9]{1}[0-9]{11}$/).not().isEmpty().trim().escape(),

                body('mobileNo', 'Invalid Mobile No. Must be 10 digits, and the first digit must be between 6 to 9').isNumeric().matches(/^[6-9]{1}[0-9]{9}$/).not().isEmpty().trim().escape(),
            ];
        }

        case 'coApplicantApi': {
            return [
                body('fullName', 'Full Name is required.').not().isEmpty().trim().escape(),

                body('docType', 'Doc Type is required.').not().isEmpty().trim().escape(),
                body('docNo').custom((value, { req }) => {
                    const docType = req.body.docType; // Get the docType from the body

                    if (!docType) {
                        throw new Error('Doc Type is required.');
                    }

                    if (docType === 'panCard') {
                        const fullName = req.body.fullName;
                        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // PAN card format

                        if (!panRegex.test(value)) {
                            throw new Error('Invalid PAN Card format. Must be 5 Capital letters, 4 digits, and 1 Capital letter.');
                        }

                        let nameCharacter;
                        if (fullName.includes(' ')) {
                            nameCharacter = fullName.split(' ')[1][0].toUpperCase();
                        } else {
                            nameCharacter = fullName[0].toUpperCase();
                        }

                        const panLastCharacter = value.slice(4, 5);
                        if (panLastCharacter !== nameCharacter) {
                            throw new Error('PAN Card Number does not match with the full name.');
                        }
                    }
                    // Check for drivingLicence
                    else if (docType === 'drivingLicence') {
                        // Correct regex format for driving licence (example: MP12A1234567)
                        const drivingLicenceRegex = /^[A-Z]{2}[0-9]{2}[0-9]{11}$/;

                        // Example format: MP12A1234567
                        if (!drivingLicenceRegex.test(value)) {
                            throw new Error('Invalid Driving Licence Number format.');
                        }
                    }
                    // Check for voterId
                    else if (docType === 'voterId') {
                        // Voter ID format (example: SHO170680)
                        const voterIdRegex = /^[A-Z0-9]{10,13}$/;

                        // Example format: SHO170680 (or other formats)
                        if (!voterIdRegex.test(value)) {
                            throw new Error('Invalid Voter ID format.');
                        }
                    }
                    // Handle unknown document types
                    else {
                        throw new Error('Invalid document type.');
                    }

                    return true;
                }),



                body('aadharNo', 'Invalid Aadhaar No. Must be 12 digits, and the first digit must be between 2 to 9.')
                    .matches(/^[2-9]{1}[0-9]{11}$/).not().isEmpty().trim().escape(),

                body('mobileNo', 'Invalid Mobile No. Must be 10 digits, and the first digit must be between 6 to 9').isNumeric().matches(/^[6-9]{1}[0-9]{9}$/).not().isEmpty().trim().escape(),
            ];
        }

        case 'guarantorApi': {
            return [
                body('fullName', 'Full Name is required.').not().isEmpty().trim().escape(),

                body('docType', 'Doc Type is required.').not().isEmpty().trim().escape(),
                body('docNo').custom((value, { req }) => {
                    const docType = req.body.docType; // Get the docType from the body

                    if (!docType) {
                        throw new Error('Doc Type is required.');
                    }

                    if (docType === 'panCard') {
                        const fullName = req.body.fullName;
                        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // PAN card format

                        if (!panRegex.test(value)) {
                            throw new Error('Invalid PAN Card format. Must be 5 Capital letters, 4 digits, and 1 Capital letter.');
                        }

                        let nameCharacter;
                        if (fullName.includes(' ')) {
                            nameCharacter = fullName.split(' ')[1][0].toUpperCase();
                        } else {
                            nameCharacter = fullName[0].toUpperCase();
                        }

                        const panLastCharacter = value.slice(4, 5);
                        if (panLastCharacter !== nameCharacter) {
                            throw new Error('PAN Card Number does not match with the full name.');
                        }
                    }
                    // Check for drivingLicence
                    else if (docType === 'drivingLicence') {
                        // Correct regex format for driving licence (example: MP12A1234567)
                        const drivingLicenceRegex = /^[A-Z]{2}[0-9]{2}[0-9]{11}$/;

                        // Example format: MP12A1234567
                        if (!drivingLicenceRegex.test(value)) {
                            throw new Error('Invalid Driving Licence Number format.');
                        }
                    }
                    // Check for voterId
                    else if (docType === 'voterId') {
                        // Voter ID format (example: SHO170680)
                        const voterIdRegex = /^[A-Z0-9]{10,13}$/;

                        // Example format: SHO170680 (or other formats)
                        if (!voterIdRegex.test(value)) {
                            throw new Error('Invalid Voter ID format.');
                        }
                    }
                    // Handle unknown document types
                    else {
                        throw new Error('Invalid document type.');
                    }

                    return true;
                }),



                body('aadharNo', 'Invalid Aadhaar No. Must be 12 digits, and the first digit must be between 2 to 9.')
                    .matches(/^[2-9]{1}[0-9]{11}$/).not().isEmpty().trim().escape(),

                body('mobileNo', 'Invalid Mobile No. Must be 10 digits, and the first digit must be between 6 to 9').isNumeric().matches(/^[6-9]{1}[0-9]{9}$/).not().isEmpty().trim().escape(),
            ];
        }
    }
};
