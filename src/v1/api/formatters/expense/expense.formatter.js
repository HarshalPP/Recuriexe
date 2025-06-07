
export function expenseFormatter(data) {
  const { body, employee } = data;

  if (!Array.isArray(body)) {
    throw new Error("Expected an array of expense objects in request body.");
  }

  return body.map(item => ({
    expenseType: item.expenseType,
    price: item.price,
    expenseBillname: item.expenseBillname,
    image: item.image,
    createdBy: employee.id,
    organizationId: employee.organizationId
  }));
}

export function expenseUpdateFormatter(data) {
 const {
    expenseType,
    price,
    expenseBillname,
    image
  } = data.body

  return {
    expenseType,
    price,
    expenseBillname,
    image
  }
}