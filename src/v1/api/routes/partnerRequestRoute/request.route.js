import expresss from "express";
import * as requestController from "../../controllers/requestController/partnerRequest.controller.js";
const requestRouter = expresss();
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

requestRouter.post("/send",verifyEmployeeToken,requestController.sentRequest);

requestRouter.post("/update-request",verifyEmployeeToken,requestController.editRequest);

requestRouter.get("/getsend",verifyEmployeeToken,requestController.getSentRequest);

requestRouter.get("/mypartners",verifyEmployeeToken,requestController.getMyPartners);

requestRouter.get("/mypartnersbyallocation",verifyEmployeeToken,requestController.getMyAllocatedPartner);

requestRouter.get("/partnerdetails",verifyEmployeeToken,requestController.getMyPartnersDetails);

requestRouter.get("/getFormByProduct",verifyEmployeeToken,requestController.getFormByAvailableProducts);

requestRouter.get("/finduser",verifyEmployeeToken,requestController.getUsersForPartnership);

requestRouter.get("/getreceived",verifyEmployeeToken,requestController.getReceivedRequest);

requestRouter.post("/update",verifyEmployeeToken,requestController.updateRequest)

requestRouter.post("/updatepartner",verifyEmployeeToken,requestController.updatePartner)

requestRouter.post("/updatepartnerProductData",verifyEmployeeToken,requestController.updatePartnerProductsData)

requestRouter.get("/getuncheckedproduct",verifyEmployeeToken,requestController.getUNexistingUserProduct)

requestRouter.get("/inactiveproduct",verifyEmployeeToken,requestController.getInactive)

requestRouter.post("/updatepartnerdata",verifyEmployeeToken,requestController.updatePartnerFormsData);

requestRouter.post("/createclient",verifyEmployeeToken,requestController.saveClient)

export default requestRouter;
