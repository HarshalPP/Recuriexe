import subcategoryModel from '../../src/api/v1/models/expense/subcategory.model.js';

export async function seedSubcategories() {
    // Check if already seeded
    const existingCount = await subcategoryModel.countDocuments();
    if (existingCount > 0) {
        console.log('   📝 Subcategories already exist, skipping...');
        return;
    }
    
    const subcategories = [
        // Travel Subcategories
        {
            subcategoryId: "SUBCAT_TRAVEL_001",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_TRAVEL_003",
            name: "Domestic Travel",
            description: "Travel within the country including flights, trains, buses",
            displayOrder: 1,
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            subcategoryId: "SUBCAT_TRAVEL_002",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_TRAVEL_003",
            name: "International Travel",
            description: "International business travel including flights, visa, accommodation",
            displayOrder: 2,
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            subcategoryId: "SUBCAT_TRAVEL_003",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_TRAVEL_003",
            name: "Local Transportation",
            description: "Local travel including taxi, auto, metro, fuel",
            displayOrder: 3,
            isActive: true,
            createdBy: "SYSTEM"
        },
        
        // Operational Subcategories
        {
            subcategoryId: "SUBCAT_OPS_001",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_OPERATIONAL_004",
            name: "Office Supplies",
            description: "Stationery, equipment, furniture for office use",
            displayOrder: 1,
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            subcategoryId: "SUBCAT_OPS_002",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_OPERATIONAL_004",
            name: "Utilities",
            description: "Electricity, water, internet, phone bills",
            displayOrder: 2,
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            subcategoryId: "SUBCAT_OPS_003",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_OPERATIONAL_004",
            name: "Maintenance",
            description: "Equipment maintenance, repairs, and servicing",
            displayOrder: 3,
            isActive: true,
            createdBy: "SYSTEM"
        },
        
        // Recurring Subcategories
        {
            subcategoryId: "SUBCAT_REC_001",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_RECURRING_001",
            name: "Software Subscriptions",
            description: "Monthly/annual software licenses and SaaS subscriptions",
            displayOrder: 1,
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            subcategoryId: "SUBCAT_REC_002",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_RECURRING_001",
            name: "Insurance",
            description: "Office insurance, employee insurance premiums",
            displayOrder: 2,
            isActive: true,
            createdBy: "SYSTEM"
        },
        
        // Capital Subcategories
        {
            subcategoryId: "SUBCAT_CAP_001",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_CAPITAL_005",
            name: "IT Equipment",
            description: "Computers, servers, networking equipment",
            displayOrder: 1,
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            subcategoryId: "SUBCAT_CAP_002",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_CAPITAL_005",
            name: "Office Infrastructure",
            description: "Furniture, fixtures, building improvements",
            displayOrder: 2,
            isActive: true,
            createdBy: "SYSTEM"
        },
        
        // Advance Payment Subcategories
        {
            subcategoryId: "SUBCAT_ADV_001",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_ADVANCE_002",
            name: "Project Advances",
            description: "Advance payments for project-related expenses",
            displayOrder: 1,
            isActive: true,
            createdBy: "SYSTEM"
        },
        {
            subcategoryId: "SUBCAT_ADV_002",
            organizationId: "ORG_TECHCORP_001",
            systemCategoryId: "SC_ADVANCE_002",
            name: "Travel Advances",
            description: "Advance payments for upcoming business travel",
            displayOrder: 2,
            isActive: true,
            createdBy: "SYSTEM"
        }
    ];
    
    await subcategoryModel.insertMany(subcategories);
    console.log(`   ✅ Inserted ${subcategories.length} subcategories`);
}
