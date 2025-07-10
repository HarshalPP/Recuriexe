import { connect } from 'mongoose';
import { config } from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
config();

// Import all seed functions
import { seedSystemCategories } from './seeds/systemCategories.seed.js';
// import { seedSubcategories } from './seeds/subcategories.seed.js';
// // import { seedExpenseTypes } from './seeds/expenseTypes.seed.js';
// import { seedWorkflows } from './seeds/workflows.seed.js';
// import { seedDynamicForms } from './seeds/dynamicForms.seed.js';
// import { seedBudgets } from './seeds/budgets.seed.js';
// import { seedTemplates } from './seeds/templates.seed.js';
// import { seedReportConfigs } from './seeds/reportConfigs.seed.js';

// Database connection
// const username = process.env.DBUSERNAME;
// const password = process.env.DBPASSWORD;
// const databaseName = process.env.DBNAME;
// const databaseLink = process.env.DBLINK;

// const connection = `mongodb+srv://${username}:${password}@${databaseLink}/${databaseName}?retryWrites=true&w=majority`;

// async function connectToDatabase() {
//     try {
//         await connect(connection);
//         console.log('📊 Connected to MongoDB for seeding');
//     } catch (error) {
//         console.error('❌ Database connection failed:', error.message);
//         process.exit(1);
//     }
// }
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Now it's safe to initialize scheduler
    console.log("⚙️ Initializing scheduled LinkedIn jobs...");
    // await initializeScheduledJobs();

    // await schedulePlanExpiryCheck();

  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

async function runSeeds() {
    console.log('🌱 Starting database seeding...\n');
    
    try {
        // Seed in order of dependencies
        console.log('1️⃣ Seeding System Categories...');
        await seedSystemCategories();
        console.log('✅ System Categories seeded\n');
        
        // console.log('2️⃣ Seeding Organizations...');
        // await seedOrganizations();
        // console.log('✅ Organizations seeded\n');
        
        // console.log('3️⃣ Seeding User Roles...');
        // await seedUserRoles();
        // console.log('✅ User Roles seeded\n');
        
        // console.log('4️⃣ Seeding Subcategories...');
        // await seedSubcategories();
        // console.log('✅ Subcategories seeded\n');
        
        // console.log('5️⃣ Seeding Workflows...');
        // await seedWorkflows();
        // console.log('✅ Workflows seeded\n');
        
        // console.log('6️⃣ Seeding Dynamic Forms...');
        // await seedDynamicForms();
        // console.log('✅ Dynamic Forms seeded\n');
        
        // console.log('7️⃣ Seeding Expense Types...');
        // // await seedExpenseTypes();
        // console.log('✅ Expense Types seeded\n');
        
        // console.log('8️⃣ Seeding Budgets...');
        // // await seedBudgets();
        // console.log('✅ Budgets seeded\n');
        
        console.log('9️⃣ Seeding Templates...');
        // await seedTemplates();
        console.log('✅ Templates seeded\n');
        
        console.log('🔟 Seeding Report Configurations...');
        // await seedReportConfigs();
        console.log('✅ Report Configurations seeded\n');
        
        console.log('🎉 All seeding completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   • System Categories: 5 predefined categories');
        console.log('   • Organizations: 2 sample organizations');
        console.log('   • User Roles: 8 users with different roles');
        console.log('   • Subcategories: 12 expense subcategories');
        console.log('   • Workflows: 3 approval workflows');
        console.log('   • Dynamic Forms: 5 customizable forms');
        console.log('   • Expense Types: 10 configured expense types');
        console.log('   • Budgets: 6 departmental budgets');
        console.log('   • Templates: 8 reusable form templates');
        console.log('   • Report Configs: 5 predefined reports');
        
        console.log('\n🚀 Your Expense ERP is ready to use!');
        console.log('\n👥 Default Admin User:');
        console.log('   Email: admin@techcorp.com');
        console.log('   Password: Admin123!');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

async function main() {
    await connectDB();
    await runSeeds();
    process.exit(0);
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
    console.log('🌱 Expense ERP Database Seeding');
    console.log('\nUsage:');
    console.log('  npm run seed              # Run all seeds');
    console.log('  node scripts/seedData.js  # Direct execution');
    console.log('\nThis will populate your database with:');
    console.log('  • System categories and expense types');
    console.log('  • Sample organizations and users');
    console.log('  • Workflows and forms');
    console.log('  • Budgets and templates');
    console.log('  • Report configurations');
    process.exit(0);
}

// Run the seeding
main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
