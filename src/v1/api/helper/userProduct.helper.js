import mongoose from "mongoose";
import { returnFormatter } from "../formatters/common.formatter.js";
import { userProductFormatter } from "../formatters/userProduct/userProduct.formatter.js";
import employeeModel from "../models/employeemodel/employee.model.js";
import userProductModel from "../models/userProduct/userProduct.model.js";

//----------------------------   add User Product ------------------------------
export async function addUserProduct(requestsObject) {
    try {
        const formattedData = userProductFormatter(requestsObject);
    //     // if(requestsObject.user.role!=="emp_admin"){
    //     //     return returnFormatter(false,"You are not allowed to add products")
    //     //  }
    //     // Use findOne instead of find for efficiency
    //     let existingProduct = await userProductModel.findOne({
    //         serviceId: requestsObject.user.serviceId,
    //         productId: formattedData.productId
    //     });
    //   let newData;
    //     if (existingProduct) {
    //         if (!existingProduct.isActive) {
    //             // If the product exists but is inactive, activate it
    //           newData =  await userProductModel.findByIdAndUpdate(existingProduct._id, { isActive: true },{new:true});
    //           let employee = await employeeModel.findOneAndUpdate(
    //             { authId: requestsObject.user.serviceId }, 
    //             { $push: { workingProducts: newData._id } },
    //             { new: true }
    //         );  
    //           return returnFormatter(true, "Product reactivated successfully", existingProduct);
    //         }
    //         return returnFormatter(false, "Product already exists");
    //     }

        // Create new product if not found
       let  newData = await userProductModel.create({
            ...formattedData,
            organizationId: requestsObject.employee.organizationId
        });

        // let employee = await employeeModel.findOneAndUpdate(
        //     { authId: requestsObject.user.serviceId }, 
        //     { $push: { workingProducts: newData._id } },
        //     { new: true }
        // );

        return returnFormatter(true, "Product created successfully", newData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


// --------------------- update User Product -----------------------

export async function updateUserProductId(productId,updateData) {
    try {
        
        const formattedData = userProductFormatter(updateData);
        const updatedProData = await userProductModel.findByIdAndUpdate(new mongoose.Types.ObjectId(productId),formattedData,{new:true})

        return returnFormatter(true, "Product updated succefully", updatedProData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}


// // --------------------- delete Product -----------------------
export async function removeUserProduct(productId, requestsObject) {
    try {
   
        // Update product status to inactive
        const updatedCompanyData = await userProductModel.findByIdAndUpdate(
            productId,
            { isActive: false },
            { new: true }
        );

        // // Remove product from employee's workingProducts list
        // const employee = await employeeModel.findOneAndUpdate(
        //     { authId: requestsObject.user.serviceId }, 
        //     { $pull: { workingProducts: updatedCompanyData._id } },
        //     { new: true }
        // );

        return returnFormatter(true, "Product removed successfully");
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



// --------------------- get Product -----------------------

export async function getUserProductById(productId) {
    try {
        const desigantionData = await userProductModel.findById(new mongoose.Types.ObjectId(productId));
        return returnFormatter(true, "Product data",desigantionData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}



// --------------------- get all Product -----------------------

export async function getAllUserProduct(requestsObject) {
    try {
         let productData;
         
        if(requestsObject.query.requestId){
       productData = await userProductModel.find({organizationId:requestsObject.employee.organizationId,requestId:new mongoose.Types.ObjectId(requestsObject.query.requestId),isActive:true}).sort({createdAt:-1})

        }
        
//         else{
//  productData = await userProductModel.find({serviceId:requestsObject.user.serviceId,isActive:true}).sort({createdAt:-1})
//         }
        return returnFormatter(true, "Product data",productData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}





// --------------------- get all Product by services -----------------------

export async function getAllUserProductByservices(requestsObject) {
    try {
         let productData;
         
        if(requestsObject.query.requestId){
       productData = await userProductModel.find({organizationId:requestsObject.employee.organizationId,requestId:new mongoose.Types.ObjectId(requestsObject.query.requestId),referId:new mongoose.Types.ObjectId(requestsObject.query.referId),isActive:true}).sort({createdAt:-1})

        }
//         else{
//  productData = await userProductModel.find({serviceId:requestsObject.user.serviceId,isActive:true}).sort({createdAt:-1})
//         }
        return returnFormatter(true, "Product data",productData)
    } catch (error) {
        return returnFormatter(false, error.message)
    }
}




// --------------------- get all Product -----------------------
export async function getUnselectedProduct(requestsObject) {
    try {
        const userModule = await userModel.findOne({
            _id: new mongoose.Types.ObjectId(requestsObject.user.serviceId)
        });

        // Ensure moduleId is an array before querying
        const moduleIds = Array.isArray(userModule.moduleId)
    ? userModule.moduleId
    : [userModule.moduleId];

const productData = await productModel.find({
    isActive: true,
    status: "approve",
    moduleId: { $in: moduleIds }
}).sort({ createdAt: -1 });


        // Fetch user-selected product IDs
        const userProductData = await userProductModel.find({
            serviceId: requestsObject.user.serviceId,
            isActive: true
        }).populate({
            path: "productId",
            model: "product",
            options: { strictPopulate: false },
        }).sort({ createdAt: -1 });

        const userProductIds = new Set(
            userProductData.map(up => up?.productId?._id?.toString()).filter(Boolean)
        );

        // Optional filter using allowedProductIds from the request
        const allowedProductIds = requestsObject?.allowedProductIds || [];
        const allowedSet = new Set(allowedProductIds.map(id => id.toString()));

        // Step 1: Remove already selected products
        let filteredProducts = productData.filter(
            pd => !userProductIds.has(pd._id.toString())
        );

        // Step 2 (optional): Further filter using allowedProductIds, if provided
        if (allowedSet.size > 0) {
            filteredProducts = filteredProducts.filter(pd => allowedSet.has(pd._id.toString()));
        }

        return returnFormatter(true, "Filtered Product Data", filteredProducts);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}



//----------------------------   get all not exist in employee product ------------------------------

export async function getAllNotExist( requestsObject) {
    try {
        let employee = await employeeModel.findById(requestsObject.query.empId);
        if (!employee) {
            return returnFormatter(false, "Employee not found");
        }

        // Fetch active locations matching the serviceId
        let products = await userProductModel.find({
            serviceId: requestsObject.user.serviceId,
            isActive: true
        }).populate({
            path: "productId",
            model: "product",
            options: { strictPopulate: false },
        });

        let filter =[]
        for(let i=0;i<products.length;i++){
         
            if(employee.workingProducts.includes(products[i]._id)){
             
            }else{
                filter.push(products[i])
            }
        }


        return returnFormatter(true, "product fetched successfully", filter);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
