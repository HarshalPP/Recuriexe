import userRoleModel from '../../src/api/v1/models/expense/userRole.model.js';
import { encryption } from '../../src/api/v1/middleware/authToken.js';

export async function seedUserRoles() {
    // Check if already seeded
    const existingCount = await userRoleModel.countDocuments();
    if (existingCount > 0) {
        console.log('   📝 User roles already exist, skipping...');
        return;
    }
    
    // Hash passwords for all users
    const defaultPassword = await encryption('Admin123!');
    const employeePassword = await encryption('Employee123!');
    
    const userRoles = [
        // TechCorp Users
        {
            userRoleId: "USR_ADMIN_001",
            organizationId: "ORG_TECHCORP_001",
            userId: "ADMIN_001",
            userName: "Admin User",
            email: "admin@techcorp.com",
            password: defaultPassword,
            role: "Admin",
            department: "IT",
            designation: "System Administrator",
            reportingManager: "",
            permissions: {
                canSubmitExpense: true,
                canApprove: true,
                canViewReports: true,
                canConfigureTypes: true,
                canManageWorkflows: true,
                maxApprovalLimit: null
            },
            isActive: true,
            joinedAt: new Date(),
            createdBy: "SYSTEM"
        },
        {
            userRoleId: "USR_MANAGER_001",
            organizationId: "ORG_TECHCORP_001",
            userId: "MANAGER_001",
            userName: "John Manager",
            email: "john.manager@techcorp.com",
            password: defaultPassword,
            role: "Manager",
            department: "Engineering",
            designation: "Engineering Manager",
            reportingManager: "ADMIN_001",
            permissions: {
                canSubmitExpense: true,
                canApprove: true,
                canViewReports: true,
                canConfigureTypes: false,
                canManageWorkflows: false,
                maxApprovalLimit: 100000
            },
            isActive: true,
            joinedAt: new Date(),
            createdBy: "SYSTEM"
        },
        {
            userRoleId: "USR_FINANCE_001",
            organizationId: "ORG_TECHCORP_001",
            userId: "FINANCE_001",
            userName: "Sarah Finance",
            email: "sarah.finance@techcorp.com",
            password: defaultPassword,
            role: "Finance",
            department: "Finance",
            designation: "Finance Manager",
            reportingManager: "ADMIN_001",
            permissions: {
                canSubmitExpense: true,
                canApprove: true,
                canViewReports: true,
                canConfigureTypes: false,
                canManageWorkflows: false,
                maxApprovalLimit: 500000
            },
            isActive: true,
            joinedAt: new Date(),
            createdBy: "SYSTEM"
        },
        {
            userRoleId: "USR_EMPLOYEE_001",
            organizationId: "ORG_TECHCORP_001",
            userId: "EMPLOYEE_001",
            userName: "Mike Developer",
            email: "mike.developer@techcorp.com",
            password: employeePassword,
            role: "Employee",
            department: "Engineering",
            designation: "Senior Software Developer",
            reportingManager: "MANAGER_001",
            permissions: {
                canSubmitExpense: true,
                canApprove: false,
                canViewReports: false,
                canConfigureTypes: false,
                canManageWorkflows: false,
                maxApprovalLimit: 0
            },
            isActive: true,
            joinedAt: new Date(),
            createdBy: "SYSTEM"
        },
        {
            userRoleId: "USR_EMPLOYEE_002",
            organizationId: "ORG_TECHCORP_001",
            userId: "EMPLOYEE_002",
            userName: "Lisa Sales",
            email: "lisa.sales@techcorp.com",
            password: employeePassword,
            role: "Employee",
            department: "Sales",
            designation: "Sales Executive",
            reportingManager: "MANAGER_001",
            permissions: {
                canSubmitExpense: true,
                canApprove: false,
                canViewReports: false,
                canConfigureTypes: false,
                canManageWorkflows: false,
                maxApprovalLimit: 0
            },
            isActive: true,
            joinedAt: new Date(),
            createdBy: "SYSTEM"
        },
        
        // FinServ Users
        {
            userRoleId: "USR_ADMIN_002",
            organizationId: "ORG_FINSERV_002",
            userId: "ADMIN_002",
            userName: "David Admin",
            email: "admin@finserv.com",
            password: defaultPassword,
            role: "Admin",
            department: "IT",
            designation: "System Administrator",
            reportingManager: "",
            permissions: {
                canSubmitExpense: true,
                canApprove: true,
                canViewReports: true,
                canConfigureTypes: true,
                canManageWorkflows: true,
                maxApprovalLimit: null
            },
            isActive: true,
            joinedAt: new Date(),
            createdBy: "SYSTEM"
        },
        {
            userRoleId: "USR_MANAGER_002",
            organizationId: "ORG_FINSERV_002",
            userId: "MANAGER_002",
            userName: "Emma Manager",
            email: "emma.manager@finserv.com",
            password: defaultPassword,
            role: "Manager",
            department: "Operations",
            designation: "Operations Manager",
            reportingManager: "ADMIN_002",
            permissions: {
                canSubmitExpense: true,
                canApprove: true,
                canViewReports: true,
                canConfigureTypes: false,
                canManageWorkflows: false,
                maxApprovalLimit: 75000
            },
            isActive: true,
            joinedAt: new Date(),
            createdBy: "SYSTEM"
        },
        {
            userRoleId: "USR_EMPLOYEE_003",
            organizationId: "ORG_FINSERV_002",
            userId: "EMPLOYEE_003",
            userName: "Robert Analyst",
            email: "robert.analyst@finserv.com",
            password: employeePassword,
            role: "Employee",
            department: "Analytics",
            designation: "Business Analyst",
            reportingManager: "MANAGER_002",
            permissions: {
                canSubmitExpense: true,
                canApprove: false,
                canViewReports: false,
                canConfigureTypes: false,
                canManageWorkflows: false,
                maxApprovalLimit: 0
            },
            isActive: true,
            joinedAt: new Date(),
            createdBy: "SYSTEM"
        }
    ];
    
    await userRoleModel.insertMany(userRoles);
    console.log(`   ✅ Inserted ${userRoles.length} user roles`);
}
