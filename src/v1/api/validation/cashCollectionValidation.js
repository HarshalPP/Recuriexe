const { body, param } = require('express-validator');


exports.transferToBankValidate = (method) => {
    switch (method) {
        case 'transferToBank': {
            return [
                body('transferAmount', 'Transfer Amount Mini 1 to 8 Digit').isLength({ min: 1, max:8 }).not().isEmpty().trim().escape(),
                // body('transferRecipt', 'Please TransferRecipt Upload').not().isEmpty().trim().escape(),
            ]
        }
    }
};

       
   

