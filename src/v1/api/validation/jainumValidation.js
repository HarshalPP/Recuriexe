const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound
} = require("../../../../globalHelper/response.globalHelper");

const validateLedgerData = (req, res, next) => {
  const ledger = req.body;

  // Validate required fields for the ledger object
  if (typeof ledger !== "object" || Array.isArray(ledger)) {
      return res.status(400).json({ error: "ledger must be a valid object." });
  }

  const requiredFields = [
      "ledger_type",
      "ledger_parent_id",
      "ledger_parent_idcrypt",
      "merchant_id",
      "first_name",
      "last_name",
      "gender",
      "dob",
      "loan_amount",
      "product_scheme_code"
  ];
  for (const field of requiredFields) {
      if (!ledger[field]) {
          return res.status(400).json({ error: `${field} is required.` });
      }
  }

  if (typeof ledger.loan_amount !== "number") {
      return res.status(400).json({ error: "loan_amount must be a number." });
  }

  const addressFields = ["address", "area", "landmark", "city", "pincode", "state", "country"];
  const permanentAddress = ledger.permanent_address;
  if (!permanentAddress || typeof permanentAddress !== "object") {
      return res.status(400).json({ error: "permanent_address must be a valid object." });
  }
  for (const field of addressFields) {
      if (!permanentAddress[field]) {
          return res.status(400).json({ error: `permanent_address.${field} is required.` });
      }
  }

  if (ledger.is_permanent_address_different_than_communication_address) {
      const communicationAddress = ledger.communication_address;
      if (!communicationAddress || typeof communicationAddress !== "object") {
          return res.status(400).json({ error: "communication_address must be a valid object if different from permanent_address." });
      }
      for (const field of addressFields) {
          if (!communicationAddress[field]) {
              return res.status(400).json({ error: `communication_address.${field} is required.` });
          }
      }
  }


  const businessAddress = ledger.business_address;
  if (businessAddress) {
      for (const field of addressFields) {
          if (!businessAddress[field]) {
              return res.status(400).json({ error: `business_address.${field} is required.` });
          }
      }
  }

  // if (!Array.isArray(ledger.detils) || ledger.detils.length === 0) {
  //     return res.status(400).json({ error: "detils must be a non-empty array." });
  // }
  // for (const detail of ledger.detils) {
  //     if (!detail.entity_type || !detail.entity_number) {
  //         return res.status(400).json({
  //             error: "Each detail in detils must have entity_type and entity_number."
  //         });
  //     }
  // }

  next();
};

module.exports = { validateLedgerData };
