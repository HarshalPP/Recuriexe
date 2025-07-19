const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose     = require("mongoose");
const ObjectId     = mongoose.Types.ObjectId;
const incomeCatagoryModel = require('../../model/adminMaster/incomeCatagory.model')
const propertyTypeModel = require('../../model/adminMaster/propertyType.model')
const productModel = require("../../model/adminMaster/product.model");
const permissionModel = require("../../model/adminMaster/permissionForm.model")
const newBranchModel = require("../../model/adminMaster/newBranch.model")
const employeeModel = require('../../model/adminMaster/employe.model')
const customerModel = require("../../model/customer.model")
const permissionFormModel = require('../../model/adminMaster/permissionForm.model')
const {productGoogleSheet} = require('./masterGoogleSheet.controller')

// ------------------Admin Master Add Product---------------------------------------
async function productAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
console.log('api test---')
    const { 
      productName,productFinId, loanAmount, roi, tenure, loginFees,
      thirdPartyApi, applicant, coApplicant, guarantor, 
      reference, banking, salescaseDetail, salescaseProperty, 
      salescaseIncome, cibilDetail, externalManager , pdReportDetail, 
      pdReportProperty, pdReportIncome , branchForms,pdPaymentFees,
    } = req.body;
    // incomeCatagoryIds , propertyTypeIds,

    const product = await productModel.findOne({ productName });
    if (product) {
      return badRequest(res, "Product Already Added.");
    }

  //   if (!Array.isArray(incomeCatagoryIds)) {
  //     return badRequest(res, "income Catagory Type IDs should be an array.");
  // }
  // if (!incomeCatagoryIds || incomeCatagoryIds.length === 0) {
  //     return badRequest(res, "income Catagory Type IDs are required.");
  // }

  // const incomeCatagoryTypesExist = await incomeCatagoryModel.find({ _id: { $in: incomeCatagoryIds } });
  // if (incomeCatagoryTypesExist.length !== incomeCatagoryIds.length) {
  //     return badRequest(res, "Some income Catagory Types are invalid or do not exist.");
  // }

  
//   if (!propertyTypeIds || propertyTypeIds.length === 0) {
//       return badRequest(res, "property Type IDs are required.");
//   }
  
//   if (!Array.isArray(propertyTypeIds)) {
//     return badRequest(res, "property Type IDs should be an array.");
// }

// const propertyTypeTypesExist = await propertyTypeModel.find({ _id: { $in: propertyTypeIds } });
// if (propertyTypeTypesExist.length !== propertyTypeIds.length) {
//     return badRequest(res, "Some property Types are invalid or do not exist.");
// }
    const permissionData = {
      thirdPartyApi, 
      applicant, 
      coApplicant, 
      guarantor, 
      reference, 
      banking, 
      salescaseDetail, 
      salescaseProperty, 
      salescaseIncome, 
      cibilDetail, 
      externalManager,
      pdReportDetail, 
      pdReportProperty, 
      pdReportIncome,
      branchForms,
    };
    const permissionDetail = await permissionModel.create(permissionData);
    const productData = {
      // incomeCatagoryIds,
      // propertyTypeIds,
      pdPaymentFees,
      productName,
      productFinId:productFinId.toUpperCase(),
      loanAmount: {
        min: loanAmount.min,
        max: loanAmount.max,
      },
      roi: {
        min: roi.min,
        max: roi.max,
      },
      tenure: {
        min: tenure.min,
        max: tenure.max,
      },
      loginFees,
      permissionFormId: permissionDetail._id, 
    };
    const productDetail = await productModel.create(productData);
    success(res, "Product Added Successfully", productDetail);
    await productGoogleSheet(productDetail);

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function newproductAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const {  
      productName, productFinId, loanAmount, roi, tenure, loginFees,
      thirdPartyApi,branchForms, applicant, coApplicant, guarantor, 
      reference, banking, salescaseDetail, salescaseProperty, 
      salescaseIncome, cibilDetail, externalManager, pdReportDetail, 
      pdReportProperty, pdReportIncome, branchIds, employeIds ,pdPaymentFees
    } = req.body;
    // ,incomeCatagoryIds , propertyTypeIds

    
    // let branchIdsArray = [];
    // if (branchId && Array.isArray(branchId) && branchId.length > 0) {
    //   branchIdsArray = branchId; 
    // } else {
      
    //   const allBranches = await newBranchModel.find({}, "_id");
    //   // branchIdsArray = allBranches.map(branch => branch._id); 
    // }
console.log('api test---')
    const product = await productModel.findOne({ productName });
    if (product) {
      return badRequest(res, "Product Already Added.");
    }

  //   if (!Array.isArray(incomeCatagoryIds)) {
  //     return badRequest(res, "income Catagory Type IDs should be an array.");
  // }
  // if (!incomeCatagoryIds || incomeCatagoryIds.length === 0) {
  //     return badRequest(res, "income Catagory Type IDs are required.");
  // }

  
  // const incomeCatagoryTypesExist = await incomeCatagoryModel.find({ _id: { $in: incomeCatagoryIds } });
  // if (incomeCatagoryTypesExist.length !== incomeCatagoryIds.length) {
  //     return badRequest(res, "Some income Catagory Types are invalid or do not exist.");
  // }


//   if (!Array.isArray(propertyTypeIds)) {
//     return badRequest(res, "property Type IDs should be an array.");
// }
// if (!propertyTypeIds || propertyTypeIds.length === 0) {
//     return badRequest(res, "property Type IDs are required.");
// }

// const propertyTypeTypesExist = await propertyTypeModel.find({ _id: { $in: propertyTypeIds } });
// if (propertyTypeTypesExist.length !== propertyTypeIds.length) {
//     return badRequest(res, "Some property Types are invalid or do not exist.");
// }

    const permissionData = {
      thirdPartyApi, 
      applicant, 
      coApplicant, 
      guarantor, 
      reference, 
      banking, 
      salescaseDetail, 
      salescaseProperty, 
      salescaseIncome, 
      cibilDetail, 
      externalManager,
      pdReportDetail, 
      pdReportProperty, 
      pdReportIncome,
      branchForms
    };
    const permissionDetail = await permissionModel.create(permissionData);
    const productData = {
      // incomeCatagoryIds,
      // propertyTypeIds,
      pdPaymentFees,
      productName,
      productFinId: productFinId.toUpperCase(),
      loanAmount: {
        min: loanAmount.min,
        max: loanAmount.max,
      },
      roi: {
        min: roi.min,
        max: roi.max,
      },
      tenure: {
        min: tenure.min,
        max: tenure.max,
      },
      loginFees,
      permissionFormId: permissionDetail._id, 
      branchIds: branchIds, // Save the branch IDs array here
      employeIds: employeIds
    };


    const productDetail = await productModel.create(productData);
    success(res, "Product Added Successfully", productDetail);
    await productGoogleSheet(productDetail);

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------Admin Master Product Update Product---------------------------------------
async function productUpdate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { productId, productName, loanAmount, roi, tenure, loginFees , permissionFormData , branchIds, employeIds , pdPaymentFees } = req.body;

    // propertyTypeIds , incomeCatagoryIds
//     if (!Array.isArray(incomeCatagoryIds)) {
//       return badRequest(res, "income Catagory Type IDs should be an array.");
//   }
//   if (!incomeCatagoryIds || incomeCatagoryIds.length === 0) {
//       return badRequest(res, "income Catagory Type IDs are required.");
//   }

//   const incomeCatagoryTypesExist = await incomeCatagoryModel.find({ _id: { $in: incomeCatagoryIds } });
//   if (incomeCatagoryTypesExist.length !== incomeCatagoryIds.length) {
//       return badRequest(res, "Some income Catagory Types are invalid or do not exist.");
//   }

//   if (!Array.isArray(propertyTypeIds)) {
//     return badRequest(res, "property Type IDs should be an array.");
// }
// if (!propertyTypeIds || propertyTypeIds.length === 0) {
//     return badRequest(res, "property Type IDs are required.");
// }

// const propertyTypeTypesExist = await propertyTypeModel.find({ _id: { $in: propertyTypeIds } });
// if (propertyTypeTypesExist.length !== propertyTypeIds.length) {
//     return badRequest(res, "Some property Types are invalid or do not exist.");
// }

    const detailsUpdate = {
      productName,
      pdPaymentFees,
      // incomeCatagoryIds,
      // propertyTypeIds,
      loanAmount: {
        min: loanAmount?.min,
        max: loanAmount?.max,
      },
      roi: {
        min: roi?.min,
        max: roi?.max,
      },
      tenure: {
        min: tenure?.min,
        max: tenure?.max,
      },
      loginFees,
      branchIds,
      employeIds
    };

    const productDetail = await productModel.findByIdAndUpdate(
      productId,
      detailsUpdate,
      { new: true }
    );
    if (!productDetail) {
      return badRequest(res, "Product not found");
    }

    if (productDetail.permissionFormId && permissionFormData) {
      const updatedPermission = await permissionFormModel.findByIdAndUpdate(
        productDetail.permissionFormId,
        permissionFormData, // Pass the data to update
        { new: true } // Return the updated document
      );

      if (!updatedPermission) {
        return badRequest(res, "Permission data not found");
      }
    }

    // productDetail.permissionFormData = permissionFormData
    success(res, "Product Updated Successfully", productDetail);
    await productGoogleSheet(productDetail)
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Admin Master Get All Product---------------------------------------


// async function newproductUpdate(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const { productId, productName, loanAmount, roi, tenure, branchIds, employeIds } = req.body;

//     // Define fields to update
//     const detailsUpdate = {
//       productName,
//       loanAmount: {
//         min: loanAmount.min,
//         max: loanAmount.max,
//       },
//       roi: {
//         min: roi.min,
//         max: roi.max,
//       },
//       tenure: {
//         min: tenure.min,
//         max: tenure.max,
//       },
//       branchIds,
//       employeIds,
//       permissionFormId: permissionDetail._id, 

//       // No need to include branchId and employeId here for $push
//     };

//     const permissionData = {
//       thirdPartyApi, 
//       applicant, 
//       coApplicant, 
//       guarantor, 
//       reference, 
//       banking, 
//       salescaseDetail, 
//       salescaseProperty, 
//       salescaseIncome, 
//       cibilDetail, 
//       externalManager,
//       pdReportDetail, 
//       pdReportProperty, 
//       pdReportIncome
//     };
//     const permissionDetail = await permissionModel.findByIdAndUpdate(permissionData);
    
    
//     // Find and update the product
//     const productDetail = await productModel.findByIdAndUpdate(
//       productId,
//       detailsUpdate,
//       // {
//       //   $set: detailsUpdate, // Update other fields
//       //   $push: {
//       //     branchIds: branchIds,
//       //     employeIds: employeIds
//       //   }
//       // },
//       { new: true }
//     );

//     // if (!productDetail) {
//     //   return badRequest(res, "Product not found");
//     // }

//     success(res, "Product Updated Successfully", productDetail);
//     await productGoogleSheet(productDetail);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

async function newproductUpdate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { productId, productName, loanAmount, roi,loginFees, tenure, branchIds, employeIds , pdPaymentFees} = req.body;

    const permissionData = {
      thirdPartyApi: req.body.thirdPartyApi,
      applicant: req.body.applicant,
      coApplicant: req.body.coApplicant,
      guarantor: req.body.guarantor,
      reference: req.body.reference,
      banking: req.body.banking,
      salescaseDetail: req.body.salescaseDetail,
      salescaseProperty: req.body.salescaseProperty,
      salescaseIncome: req.body.salescaseIncome,
      cibilDetail: req.body.cibilDetail,
      externalManager: req.body.externalManager,
      pdReportDetail: req.body.pdReportDetail,
      pdReportProperty: req.body.pdReportProperty,
      pdReportIncome: req.body.pdReportIncome,
      branchForms : req.body.branchForms,
    };

    const productDetail = await productModel.findById(productId);
    if (!productDetail) {
      return res.status(404).json({ message: "Product not found" });
    }

    await permissionModel.findByIdAndUpdate(
      productDetail.permissionFormId,  
      { $set: permissionData },        // Update the permission fields
      { new: true }
    );

    const detailsUpdate = {
      productName,
      pdPaymentFees,
      loanAmount: {
        min: loanAmount.min,
        max: loanAmount.max,
      },
      roi: {
        min: roi.min,
        max: roi.max,
      },
      tenure: {
        min: tenure.min,
        max: tenure.max,
      },
      branchIds,
      loginFees,
      employeIds,
    };

    const updatedProductDetail = await productModel.findByIdAndUpdate(
      productId,
      { $set: detailsUpdate },
      { new: true }
    );

    success(res, "Product Updated Successfully", updatedProductDetail);
    await productGoogleSheet(updatedProductDetail);

  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// async function newproductUpdate(req, res) {
//   try {
//     // Fetch active employees
//     const activeEmployees = await employeeModel.find({ status: "active" }, { _id: 1 });
//     const activeEmployeeIds = activeEmployees.map(emp => emp._id);

//     // Fetch active branches
//     const activeBranches = await newBranchModel.find({ status: "pending" }, { _id: 1 });
//     const activeBranchIds = activeBranches.map(branch => branch._id);
//    console.log("sdd",activeBranchIds)
//     // Fetch all products and update them
//     const products = await productModel.updateMany(
//       {},
//       {
//         $set: {
//           employeIds: activeEmployeeIds,
//           branchIds: activeBranchIds,
//           status: "active"
//         }
//       }
//     );

//     if (!products) {
//       return badRequest(res, "No products found");
//     }

//     success(res, "All Products Updated Successfully", products);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }




// async function getAllProduct(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const productDetail = await productModel.find({status:"active"});

//     const permissionData = await permissionModel.findOne({
//       _id: productDetail.permissionFormId,
//       status: "active",
//     });

//     responseData={
//       productDetail,
//       permission: permissionData,
//     }
//     success(res, "All Products Detail", responseData);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }



async function getAllProduct(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let { limit = 10, page = 1, searchQuery = '' } = req.query;

    limit = parseInt(limit);
    page = parseInt(page);
    const skip = (page - 1) * limit;

    const filter = { status: "active" };

    if (searchQuery) {
      filter.$or = [
        { productName: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const totalCount = await productModel.countDocuments(filter);

    const productDetail = await productModel.find(filter)
      .populate({
        path: 'permissionFormId',
        match: { status: "active" },
      }).sort({productName:1})
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      message: "All Products Detail",
      data: productDetail,
        totalCount,
        totalPages,
        currentPage: page,
        limit,
    };

    success(res, response.message, response);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// async function getAllProduct(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     let {limit = 10 , page = 1 , searchQuery = ''} = req.query

//     limit = parseInt(limit)
//     page = parseInt(page)
//     const skip = (page -1 ) * limit

//     const filter = { status: "active" }

//     if(searchQuery){
//       filter.$or = [
//         {productName: {$regex : searchQuery , $options : 'i'}}
//       ]
//     }

//     const productDetail = await productModel.find(filter)
//       .populate({
//         path: 'permissionFormId', 
//         match: { status: "active" }, 
//       }).skip(skip).limit(limit);

  
//     success(res, "All Products Detail", productDetail);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }



async function newgetAllProduct(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const _id = req.Id

    const employeeData = await employeeModel.findOne({ _id:_id, status: "active" });
    
    
    const { branchId } = employeeData;


    if (!employeeData) {
      return badRequest(res, "Employee not found");
    }

    const employeeProductDetail = await productModel.find({
      employeIds: { $in: [_id] },
      status: "active",
    });

    // if (!employeeProductDetail || employeeProductDetail.length === 0) {
    //   return badRequest(res, "No products found related to employeId");
    // }
    if (!employeeProductDetail || employeeProductDetail.length === 0) {
      return success(res, "No Products Found",[]);
    }

    // const productDetail = await productModel.find({
    //   branchId: { $in: [branchId] },
    //   status: "active",
    // });

    // if (!productDetail || productDetail.length === 0) {
    //   return badRequest(res, "No products found related to branchId");
    // }

    // if (!productDetail || productDetail.length === 0) {
    //   return success(res, "No products found related to branchId",[]);
    // }

    success(res, "All Products Detail",employeeProductDetail);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

async function getAllProductForWebsite(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const productDetail = await productModel.find({ status: "active" }).select("productName _id");
    success(res, "All Products",productDetail);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

async function productActiveOrInactive(req, res) {
  try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
      } else {
          const  id = req.body.id;
          const status = req.body.status
          if (!id || id.trim() === "") {
            return badRequest(res , "ID is required and cannot be empty");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return badRequest(res , "Invalid ID");
        }
          if (status == "active") {
              const productUpdateStatus =  await productModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
          success(res, "product Active" ,productUpdateStatus);
          }
         else if (status == "inactive") {
          const productUpdateStatus =  await productModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
          success(res, "product inactive" ,productUpdateStatus);
          }
          else{
              return badRequest(res, "Status must be 'active' or 'inactive'");
          }
        
      }
  } catch (error) {
      console.log(error);
      unknownError(res, error);
  }
}



async function productCountAllFiles(req, res) {
    try {
      const _id = req.Id;
  
      // Check if employee exists
      const employeeData = await employeeModel.findOne({ _id, status: "active" });
      if (!employeeData) {
        return badRequest(res , "Employee not found");
      }
  
      const productCounts = await customerModel.aggregate([
        {
          $group: {
            _id: "$productId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "products", // Collection name in DB
            localField: "_id",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        {
          $unwind: "$productDetails"
        },
        {
          $match: {
            "productDetails.status": "active" // Filter only inactive products
          }
        },
        {
          $project: {
            _id: "$productDetails._id",
            productName: "$productDetails.productName",
            count: 1
          }
        }
      ]);
      
  
      return success(res , "Product Counts", productCounts);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

  async function productActiveAndInActive(req, res) {
    try {
      const { _id, status } = req.query;
  
      if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
       return badRequest(res ,"Invalid or missing product ID");
      }
  
      if (status !== 'active' && status !== 'inactive') {
        return badRequest(res ,  "Status must be 'active' or 'inactive' as a string." );
      }
  
      const updatedProduct = await productModel.findByIdAndUpdate(
        _id,
        { status: status}, 
        { new: true }
      );
  
      if (!updatedProduct) {
        return notFound(res , "Product not found." );
      }
  
      return success(res ,`Product ${status}.`,
        {data: updatedProduct}
      );
  
    } catch (error) {
      console.error(error);
      return unknownError(res , "Internal server error." );
    }
  }


  async function productActiveOrInactiveList(req, res) {
    try {
      let { limit = 10, page = 1, searchQuery = '', status } = req.query;
  
      // Validate status
      if (status !== 'active' && status !== 'inactive') {
        return badRequest(res, "Status must be 'active' or 'inactive' as a string.");
      }
  
      // Convert to numbers
      limit = parseInt(limit);
      page = parseInt(page);
      const skip = (page - 1) * limit;
  
      // Build filter with status and search
      const filter = {
        status: status
      };
  
      if (searchQuery) {
        filter.$or = [
          { productName: { $regex: searchQuery, $options: 'i' } }
        ];
      }
  
      const totalCount = await productModel.countDocuments(filter);
      const productDetail = await productModel.find(filter).skip(skip).limit(limit).populate({
        path: 'permissionFormId' });
        
      const totalPages = Math.ceil(totalCount / limit);
  
      const response = {
        data: productDetail,
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      };
  
      success(res, `${status} Product List`, response);
    } catch (error) {
      console.error(error);
      return unknownError(res, "Internal server error.");
    }
  }

  
  
module.exports = {
  productAdd,
  productCountAllFiles,
  getAllProductForWebsite,
  productUpdate,
  getAllProduct,
  productActiveOrInactive,
  newproductAdd,
  newgetAllProduct,
  newproductUpdate,productActiveAndInActive,productActiveOrInactiveList,
};
