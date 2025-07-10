import organizationModel from '../../src/api/v1/models/expense/organization.model.js';

export async function seedOrganizations() {
    // Check if already seeded
    const existingCount = await organizationModel.countDocuments();
    if (existingCount > 0) {
        console.log('   📝 Organizations already exist, skipping...');
        return;
    }
    
    const organizations = [
        {
            organizationId: "ORG_TECHCORP_001",
            name: "TechCorp Solutions",
            code: "TECHCORP",
            description: "Leading technology solutions provider specializing in enterprise software development",
            address: {
                street: "123 Tech Park, Sector 5",
                city: "Mumbai",
                state: "Maharashtra",
                country: "India",
                zipCode: "400001"
            },
            contact: {
                email: "admin@techcorp.com",
                phone: "+91-9876543210",
                website: "https://techcorp.com"
            },
            settings: {
                defaultCurrency: "INR",
                fiscalYearStart: "April",
                autoApprovalLimit: 5000,
                requireReceiptAbove: 1000,
                workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                timezone: "Asia/Kolkata"
            },
            isActive: true,
            createdBy: "SYSTEM",
            schemaVersion: 1
        },
        {
            organizationId: "ORG_FINSERV_002",
            name: "FinServ Innovations",
            code: "FINSERV",
            description: "Financial services company providing innovative banking and investment solutions",
            address: {
                street: "456 Finance Street, Business District",
                city: "Bangalore",
                state: "Karnataka",
                country: "India",
                zipCode: "560001"
            },
            contact: {
                email: "admin@finserv.com",
                phone: "+91-9876543211",
                website: "https://finserv.com"
            },
            settings: {
                defaultCurrency: "INR",
                fiscalYearStart: "April",
                autoApprovalLimit: 3000,
                requireReceiptAbove: 500,
                workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                timezone: "Asia/Kolkata"
            },
            isActive: true,
            createdBy: "SYSTEM",
            schemaVersion: 1
        }
    ];
    
    await organizationModel.insertMany(organizations);
    console.log(`   ✅ Inserted ${organizations.length} organizations`);
}
