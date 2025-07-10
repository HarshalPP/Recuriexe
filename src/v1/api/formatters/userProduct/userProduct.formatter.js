import mongoose from "mongoose";

export function userProductFormatter(reqData) {
        
    const { productId, productName,moduleId,requestId ,referId} = reqData.body;

     
    let data ={
        productName,
        moduleId,
        requestId,
        referId
    }

    return data
}
