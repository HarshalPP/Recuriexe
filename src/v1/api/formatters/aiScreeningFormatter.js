// aiScreeningFormatter.js
export const formatScreeningCriteria = (criteria) => ({
  id: criteria._id,
  name: criteria.name,
  description: criteria.description,
  weight: criteria.weight,
  isActive: criteria.isActive,
  confidence: criteria.confidence,
  experience: criteria.experience,
});

export const formatAiScreening = (screening) => ({
  id: screening._id,
  name: screening.name,
  description: screening.description,
  coreSettings: screening.coreSettings,
  screeningCriteria: screening.screeningCriteria.map(formatScreeningCriteria),
  createdBy: screening.createdBy,
  isActive: screening.isActive,
  createdAt: screening.createdAt,
  updatedAt: screening.updatedAt,
});
