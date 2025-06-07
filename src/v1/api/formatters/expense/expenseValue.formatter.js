export function tripValueFormatter(data) {
  const {
     tripName,
  employeeId = data.employee.id,
  value = []
  } = data.body;

  return {
     tripName,
  employeeId,
  value
  };
}
