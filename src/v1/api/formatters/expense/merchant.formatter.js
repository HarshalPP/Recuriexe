export function merchantFormatter(data) {
  const {
    merchantName,
    createdBy = data.employee.id,
    merchantCode,
  } = data.body;

  return {
    merchantName,
    createdBy,
    merchantCode,
  };
}
