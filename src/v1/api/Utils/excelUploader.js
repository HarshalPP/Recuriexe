import ExcelJS from "exceljs";
import uploadToSpaces from "../services/spaceservices/space.service.js";

export const generateExcelAndUpload = async (data, fileNamePrefix = "report") => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Job Applications");

  // Define columns
  worksheet.columns = [
    { header: "Candidate ID", key: "candidateUniqueId", width: 15 },
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "emailId", width: 30 },
    { header: "Mobile", key: "mobileNumber", width: 15 },
    { header: "Position", key: "position", width: 20 },
    { header: "Department", key: "department", width: 20 },
    { header: "Sub Department", key: "subDepartment", width: 20 },
    { header: "Designation", key: "designation", width: 25 },
    { header: "Resume Status", key: "resumeShortlisted", width: 15 },
    { header: "AI Result", key: "AI_Screeing_Result", width: 15 },
    { header: "AI Score", key: "AI_Score", width: 10 },
     {header:"Expected CTC" , key:"expectedCTC" , width:15},
    // { header: "AI Confidence", key: "AI_Confidence", width: 15 },
    { header: "Applied Date", key: "createdAt", width: 20 },
  ];

  // Add rows
  data.forEach((item) => {
    worksheet.addRow({
      candidateUniqueId: item.candidateUniqueId || "",
      name: item.name || "",
      emailId: item.emailId || "",
      mobileNumber: item.mobileNumber || "",
      position: item.position || "",
      department: item.department || "",
      subDepartment: item.subDepartment || "",
      designation: item.designation || "",
      resumeShortlisted: item.resumeShortlisted || "",
      AI_Screeing_Result: item.AI_Screeing_Result || "",
      AI_Score: item.AI_Score ?? "",
      expectedCTC:item.expectedCTC ?? "",
      // AI_Confidence: item.AI_Confidence ?? "",
      createdAt: item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        : "",
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Generate filename and path
  const timestamp = Date.now();
  const filename = `${fileNamePrefix}_${timestamp}.xlsx`;
  const filePath = `${process.env.PATH_BUCKET}/HRMS/EXCEL/${filename}`;

  // Upload to DigitalOcean Spaces
  const url = await uploadToSpaces(
    "finexe",
    filePath,
    buffer,
    "public-read",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  return url;
};



export const generateJobPostExcelAndUpload = async (data, fileNamePrefix = "report") => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Job Posts");

  worksheet.columns = [
    { header: "Job Post ID", key: "jobPostId", width: 20 },
    { header: "Position", key: "position", width: 25 },
    { header: "Department", key: "department", width: 25 },
    {header:"SubDepartment" ,  key:"subDepartment" , width:25},
    { header: "Designation", key: "designation", width: 25 },
    {header:"employmentType" , key:"employmentType" , width:25},
     {header:"employeeType" , key:"employeeType" , width:25},
    { header: "Branch", key: "branch", width: 25 },
    { header: "No. of Positions", key: "noOfPosition", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Expired Date", key: "expiredDate", width: 20 },
    { header: "Created At", key: "createdAt", width: 25 },
  ];

  data.forEach((item) => {
    worksheet.addRow({
      jobPostId: item.jobPostId || "",
      position: item.position || "",
      department: item.department || "",
      subDepartment:item.subDepartment || "",
      designation: item.designation || "",
      employmentType:item.employmentType || "",
      employeeType:item.employeeType || "",
      branch: item.branch || "",
      noOfPosition: item.noOfPosition ?? "",
      status: item.status || "",
      expiredDate: item.expiredDate
        ? new Date(item.expiredDate).toLocaleDateString("en-IN")
        : "",
      createdAt: item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        : "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const timestamp = Date.now();
  const filename = `${fileNamePrefix}_${timestamp}.xlsx`;
  const filePath = `${process.env.PATH_BUCKET}/HRMS/EXCEL/${filename}`;

  const url = await uploadToSpaces(
    "finexe",
    filePath,
    buffer,
    "public-read",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  return url;
};


