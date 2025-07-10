


export function formatePartnerRequest(reqData) {
    const { senderId, receiverId,status,productForm,allocatIonId,invoiceRaise,invoiceCycle} = reqData.body;
    let data = {
        senderId,
        receiverId,
        status,
        productForm,
        allocatIonId,
        invoiceRaise,
        invoiceCycle
    }
    return data
}