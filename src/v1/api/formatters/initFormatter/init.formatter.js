

export function initFileFormmater(reqObj){
    const {partnerId,fileNo,customerName,sign,paymentStatus,reportType,fatherName,contactNo,address,charge,initFields,referServiceId,allocationFields,reportStatus,agentFields,submitFields,workStatus} = reqObj.body;

     return {
        doneBy:reqObj.employee.id,
        partnerId,
        fileNo,
        referServiceId,
        customerName,
        charge,
        reportStatus,
        fatherName,
        sign,
        contactNo,
        address,
        initFields,
        allocationFields,
    reportStatus,
    reportType,
        agentFields,
        submitFields,
        workStatus,
        paymentStatus
    
    }

}