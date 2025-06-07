export const formatQualification = (body) => {
  const { name, isActive } = body;
  return {
    name,
    isActive: isActive !== undefined ? isActive : true
  };
};
