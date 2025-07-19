
function setDefaultVendors(vendorList){
    // console.log('vendorList',vendorList)
    let defaultList = ["rcu", "technical", "legal", "other", "rm", "branch", "tagging"]

    let returnData = defaultList.map((vendorType)=>{
        let obj = vendorList.filter((vendorData)=>{
            if(vendorData.vendorType==vendorType){
                return vendorData
            }
        })
        return obj && obj[0]?obj[0]:{
            vendorType: vendorType,
            vendorId: null,
            assignDocuments: [],
            statusByVendor:"notAssign",
        }
    })
    // console.log('returnData',returnData)
    return returnData
}

module.exports={
    setDefaultVendors
}

