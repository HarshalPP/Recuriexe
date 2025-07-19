const { body, param } = require('express-validator');


exports.thirdPartyApiValidation = (method) => {
    switch (method) {
        
        case 'validatePanFatherName': {
            return [
                body('PanNumber', 'Invalid PAN Card format. Must be 5 Captial letters, 4 digits, and 1 Captial letter.')
                    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).not().isEmpty().trim().escape(),
                // body('fullName', 'Full Name is required.').not().isEmpty().trim().escape(),
                // body('PanNumber').custom((value, { req }) => {
                //     const fullName = req.body.fullName;
                //     // Ensure fullName is not empty
                //     if (!fullName) {
                //         throw new Error('Full Name is required.');
                //     }
                //     // Determine the character to check from fullName
                //     let nameCharacter;
                //     if (fullName.includes(' ')) {
                //         // If there's a space, take the first character of the last name
                //         nameCharacter = fullName.split(' ')[1][0].toUpperCase();
                //     } else {
                //         // If there's no space, take the first character of the full name
                //         nameCharacter = fullName[0].toUpperCase();
                //     }

                //     const panLastCharacter = value.slice(4, 5); // Get the last character of PAN

                //     if (panLastCharacter !== nameCharacter) {
                //         throw new Error(
                //             `The last character of PAN (${panLastCharacter}) should match the first letter of the name (${nameCharacter}).`
                //         );
                //     }
                //     return true;
                // }),
            ];
        }
        case 'validatePanComprehensive': {
            return [
                body('docNumber', 'Invalid PAN Card format. Must be 5 Captial letters, 4 digits, and 1 Captial letter.')
                    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).not().isEmpty().trim().escape(),
                // body('fullName', 'Full Name is required.').not().isEmpty().trim().escape(),
                // body('PanNumber').custom((value, { req }) => {
                //     const fullName = req.body.fullName;
                //     // Ensure fullName is not empty
                //     if (!fullName) {
                //         throw new Error('Full Name is required.');
                //     }
                //     // Determine the character to check from fullName
                //     let nameCharacter;
                //     if (fullName.includes(' ')) {
                //         // If there's a space, take the first character of the last name
                //         nameCharacter = fullName.split(' ')[1][0].toUpperCase();
                //     } else {
                //         // If there's no space, take the first character of the full name
                //         nameCharacter = fullName[0].toUpperCase();
                //     }

                //     const panLastCharacter = value.slice(4, 5); // Get the last character of PAN

                //     if (panLastCharacter !== nameCharacter) {
                //         throw new Error(
                //             `The last character of PAN (${panLastCharacter}) should match the first letter of the name (${nameCharacter}).`
                //         );
                //     }
                //     return true;
                // }),
            ];
        }

        case 'validateAadharNo': {
            return [
                body('aadharNo', 'Invalid Aadhaar No. Must be 12 digits, and the first digit must be between 2 to 9.')
                    .matches(/^[2-9]{1}[0-9]{11}$/).not().isEmpty().trim().escape(),

            ];
        }
    }
};

       
   

