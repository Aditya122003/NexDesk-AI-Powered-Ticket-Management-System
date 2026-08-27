const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Notification = require('./models/Notification');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database...');

    // 1. Wipe existing data
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Database wiped clean (Users, Tickets, Notifications)');

    // 2. Create Superadmin User
    const superadmin = await User.create({
      name: 'Aditya Tiwari (Superadmin)',
      email: 'adityatiwari5175@gmail.com',
      password: 'Aditya@1234',
      role: 'superadmin',
      isApproved: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaSuperadmin'
    });

    // 3. Create 5 Admin Accounts (4 Approved, 1 Pending Approval)
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPass = await bcrypt.hash('Admin@1234', salt);

    const adminsData = [
      {
        name: 'System Admin',
        email: 'admin@helpdesk.com',
        password: hashedAdminPass,
        role: 'admin',
        isApproved: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SystemAdmin'
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul.admin@helpdesk.com',
        password: hashedAdminPass,
        role: 'admin',
        isApproved: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulAdmin'
      },
      {
        name: 'Priya Verma',
        email: 'priya.admin@helpdesk.com',
        password: hashedAdminPass,
        role: 'admin',
        isApproved: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaAdmin'
      },
      {
        name: 'Vikram Malhotra',
        email: 'vikram.admin@helpdesk.com',
        password: hashedAdminPass,
        role: 'admin',
        isApproved: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramAdmin'
      },
      {
        name: 'Sneha Deshmukh (Pending)',
        email: 'sneha.pending@helpdesk.com',
        password: hashedAdminPass,
        role: 'admin',
        isApproved: false, // Pending Superadmin approval
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaPending'
      }
    ];

    const admins = await User.insertMany(adminsData);
    console.log(`[Seed] Created Superadmin (adityatiwari5175@gmail.com / Aditya@1234) & ${admins.length} Admins`);

    // 4. Create 20 Customer Accounts
    const customersRaw = [
      { name: 'John Doe', email: 'john.doe@example.com' },
      { name: 'Sarah Connor', email: 'sarah.connor@example.com' },
      { name: 'Amit Sharma', email: 'amit.sharma@example.com' },
      { name: 'Neha Verma', email: 'neha.verma@example.com' },
      { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com' },
      { name: 'Pooja Patel', email: 'pooja.patel@example.com' },
      { name: 'Rohit Singh', email: 'rohit.singh@example.com' },
      { name: 'Ananya Roy', email: 'ananya.roy@example.com' },
      { name: 'Karan Mehta', email: 'karan.mehta@example.com' },
      { name: 'Divya Joshi', email: 'divya.joshi@example.com' },
      { name: 'Suresh Nair', email: 'suresh.nair@example.com' },
      { name: 'Meera Reddy', email: 'meera.reddy@example.com' },
      { name: 'Arjun Gupta', email: 'arjun.gupta@example.com' },
      { name: 'Kavita Rao', email: 'kavita.rao@example.com' },
      { name: 'Manish Chawla', email: 'manish.chawla@example.com' },
      { name: 'Simran Kaur', email: 'simran.kaur@example.com' },
      { name: 'Deepak Yadav', email: 'deepak.yadav@example.com' },
      { name: 'Swati Mishra', email: 'swati.mishra@example.com' },
      { name: 'Varun Saxena', email: 'varun.saxena@example.com' },
      { name: 'Tanya Kapoor', email: 'tanya.kapoor@example.com' }
    ];

    const hashedCustomerPass = await bcrypt.hash('Customer@1234', salt);
    const customersData = customersRaw.map((c) => ({
      name: c.name,
      email: c.email,
      password: hashedCustomerPass,
      role: 'customer',
      isApproved: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`
    }));

    const customers = await User.insertMany(customersData);
    console.log(`[Seed] Created ${customers.length} Customers (Password: Customer@1234)`);

    // Helper for date math (past X days)
    const now = Date.now();
    const daysAgo = (days, hours = 0) => new Date(now - (days * 24 * 3600 * 1000 + hours * 3600 * 1000));

    // Approved admins list for assigning status updates
    const activeAdmins = [superadmin._id, admins[0]._id, admins[1]._id, admins[2]._id, admins[3]._id];

    // 5. Generate 25 Realistic Tickets Spread Over Past 60 Days
    const sampleTickets = [
      {
        ticketId: 'TCK-1001',
        title: 'Payment gateway connection timeout during checkout',
        description: 'Trying to process payment using HDFC Visa card, but gateway throws 504 Gateway Timeout error on final step.',
        category: 'Billing',
        priority: 'High',
        status: 'Resolved',
        custIdx: 0, // John Doe
        daysOld: 55,
        aiReasoning: 'Payment processing gateway connection latency during checkout.',
        resolutionNote: 'Fixed payment gateway API timeout buffer and deployed backend patch v2.1.',
        resolvedDaysOld: 53
      },
      {
        ticketId: 'TCK-1002',
        title: 'Database connection pool maxed out during morning traffic',
        description: 'Server returns 500 internal server error between 10 AM to 11:30 AM due to database pool exhaustion.',
        category: 'Technical',
        priority: 'Urgent',
        status: 'Resolved',
        custIdx: 1, // Sarah Connor
        daysOld: 50,
        aiReasoning: 'Database latency and pool connection exhaustion critical issue.',
        resolutionNote: 'Increased MongoDB maxPoolSize to 100 and optimized indexed queries.',
        resolvedDaysOld: 48
      },
      {
        ticketId: 'TCK-1003',
        title: 'Request for CSV export functionality in analytics report',
        description: 'Please add a button to export customer analytics and ticket logs directly to CSV file for executive reviews.',
        category: 'Feature Request',
        priority: 'Low',
        status: 'Resolved',
        custIdx: 2, // Amit Sharma
        daysOld: 45,
        aiReasoning: 'Non-blocking feature request for administrative analytics reporting.',
        resolutionNote: 'CSV Export module implemented in Analytics Classification Logs modal.',
        resolvedDaysOld: 42
      },
      {
        ticketId: 'TCK-1004',
        title: '2FA authentication SMS verification code not delivered',
        description: 'OTP code for two-factor login is not arriving on phone number +91 9876543210.',
        category: 'Account',
        priority: 'High',
        status: 'Resolved',
        custIdx: 3, // Neha Verma
        daysOld: 42,
        aiReasoning: 'Authentication failure blocking account sign in.',
        resolutionNote: 'Resynced Twilio SMS service route for region.',
        resolvedDaysOld: 41
      },
      {
        ticketId: 'TCK-1005',
        title: 'Invoice download returns blank PDF document',
        description: 'When clicking Download Invoice under billing history, the downloaded PDF is empty 0 KB file.',
        category: 'Billing',
        priority: 'Medium',
        status: 'Resolved',
        custIdx: 4, // Rajesh Kumar
        daysOld: 38,
        aiReasoning: 'PDF generation stream error in billing module.',
        resolutionNote: 'Updated PDFKit header stream buffer rendering.',
        resolvedDaysOld: 36
      },
      {
        ticketId: 'TCK-1006',
        title: 'API endpoint /api/tickets throwing CORS policy error',
        description: 'Cross-Origin Resource Sharing error blocking web app requests from custom sub-domain.',
        category: 'Technical',
        priority: 'High',
        status: 'Resolved',
        custIdx: 5, // Pooja Patel
        daysOld: 35,
        aiReasoning: 'CORS header mismatch blocking API requests.',
        resolutionNote: 'Whitelisted sub-domain origin in Express CORS configuration.',
        resolvedDaysOld: 34
      },
      {
        ticketId: 'TCK-1007',
        title: 'Unable to update user profile avatar picture',
        description: 'Uploading PNG file fails with image mime type invalid alert.',
        category: 'Account',
        priority: 'Low',
        status: 'Resolved',
        custIdx: 6, // Rohit Singh
        daysOld: 32,
        aiReasoning: 'Profile image file upload validation error.',
        resolutionNote: 'Added image/png and image/jpeg support to Multer filter.',
        resolvedDaysOld: 30
      },
      {
        ticketId: 'TCK-1008',
        title: 'Request dark theme option for support portal',
        description: 'The bright white background causes eye strain during night support shifts.',
        category: 'Feature Request',
        priority: 'Low',
        status: 'Resolved',
        custIdx: 7, // Ananya Roy
        daysOld: 28,
        aiReasoning: 'UI aesthetic customization request.',
        resolutionNote: 'Dark mode theme tokens integrated into global stylesheet.',
        resolvedDaysOld: 26
      },
      {
        ticketId: 'TCK-1009',
        title: 'Duplicate charge billed on monthly subscription renewal',
        description: 'Account was charged twice ($49.00 x 2) on August 15th subscription cycle.',
        category: 'Billing',
        priority: 'Urgent',
        status: 'Resolved',
        custIdx: 8, // Karan Mehta
        daysOld: 25,
        aiReasoning: 'Double billing error requiring immediate financial refund.',
        resolutionNote: 'Initiated duplicate charge refund via Stripe dashboard.',
        resolvedDaysOld: 24
      },
      {
        ticketId: 'TCK-1010',
        title: 'SSL Certificate expired warning in browser',
        description: 'Chrome browser showing HTTPS security warning NET::ERR_CERT_DATE_INVALID.',
        category: 'Technical',
        priority: 'Urgent',
        status: 'Resolved',
        custIdx: 9, // Divya Joshi
        daysOld: 22,
        aiReasoning: 'Security certificate expiration affecting domain trust.',
        resolutionNote: 'Renewed LetsEncrypt SSL certificate auto-certbot renewal cron.',
        resolvedDaysOld: 21
      },
      {
        ticketId: 'TCK-1011',
        title: 'Slow dashboard loading speed on mobile devices',
        description: 'Dashboard page takes over 8 seconds to render on 4G mobile connection.',
        category: 'Technical',
        priority: 'Medium',
        status: 'In Progress',
        custIdx: 10, // Suresh Nair
        daysOld: 18,
        aiReasoning: 'Performance bottleneck on mobile browser viewports.',
        resolutionNote: 'Compressing chart JS bundles and implementing lazy loading.',
        inProgressDaysOld: 15
      },
      {
        ticketId: 'TCK-1012',
        title: 'Reset password link email not being delivered',
        description: 'Requested password reset 3 times, but no email arrived in inbox or spam folder.',
        category: 'Account',
        priority: 'High',
        status: 'Resolved',
        custIdx: 11, // Meera Reddy
        daysOld: 16,
        aiReasoning: 'Transactional email dispatch failure.',
        resolutionNote: 'Configured Gmail SMTP Nodemailer transporter credentials.',
        resolvedDaysOld: 14
      },
      {
        ticketId: 'TCK-1013',
        title: 'Add support for PDF attachment preview in ticket modal',
        description: 'Admins should be able to view attached PDF files directly without downloading.',
        category: 'Feature Request',
        priority: 'Low',
        status: 'In Progress',
        custIdx: 12, // Arjun Gupta
        daysOld: 14,
        aiReasoning: 'Workflow enhancement for document preview.',
        resolutionNote: 'Integrating inline PDF viewer modal component.',
        inProgressDaysOld: 10
      },
      {
        ticketId: 'TCK-1014',
        title: 'GraphQL API endpoint returning schema validation error',
        description: 'Querying /graphql with custom filter parameters causes 400 Bad Request error.',
        category: 'Technical',
        priority: 'Medium',
        status: 'Resolved',
        custIdx: 13, // Kavita Rao
        daysOld: 12,
        aiReasoning: 'GraphQL query schema mismatch.',
        resolutionNote: 'Updated GraphQL type definitions and field resolvers.',
        resolvedDaysOld: 11
      },
      {
        ticketId: 'TCK-1015',
        title: 'Credit card update form fails with invalid token alert',
        description: 'Unable to update payment details in account settings.',
        category: 'Billing',
        priority: 'High',
        status: 'In Progress',
        custIdx: 14, // Manish Chawla
        daysOld: 10,
        aiReasoning: 'Payment tokenization script error.',
        resolutionNote: 'Checking Stripe JS elements integration.',
        inProgressDaysOld: 8
      },
      {
        ticketId: 'TCK-1016',
        title: 'User session logs out unexpectedly every 10 minutes',
        description: 'JWT token seems to expire too fast while actively navigating ticket views.',
        category: 'Account',
        priority: 'High',
        status: 'In Progress',
        custIdx: 15, // Simran Kaur
        daysOld: 8,
        aiReasoning: 'Session expiration configuration issue.',
        resolutionNote: 'Extending JWT expiration window and setting up silent token refresh.',
        inProgressDaysOld: 5
      },
      {
        ticketId: 'TCK-1017',
        title: 'Export chart image option missing on priority breakdown graph',
        description: 'Want to download priority bar chart image for monthly executive report.',
        category: 'Feature Request',
        priority: 'Low',
        status: 'Resolved',
        custIdx: 16, // Deepak Yadav
        daysOld: 7,
        aiReasoning: 'Chart export usability feature request.',
        resolutionNote: 'Added html2canvas PNG download action menu to chart card headers.',
        resolvedDaysOld: 5
      },
      {
        ticketId: 'TCK-1018',
        title: 'High CPU utilization spikes on background worker server',
        description: 'Worker server CPU reaches 99% usage during batch email notification dispatch.',
        category: 'Technical',
        priority: 'Urgent',
        status: 'In Progress',
        custIdx: 17, // Swati Mishra
        daysOld: 5,
        aiReasoning: 'Severe infrastructure load spike causing server instability.',
        resolutionNote: 'Implementing concurrency throttling and queue worker pool.',
        inProgressDaysOld: 3
      },
      {
        ticketId: 'TCK-1019',
        title: 'Incorrect tax calculation on GST invoice for inter-state customer',
        description: 'IGST 18% should apply instead of CGST+SGST for Karnataka billing address.',
        category: 'Billing',
        priority: 'High',
        status: 'Open',
        custIdx: 18, // Varun Saxena
        daysOld: 4,
        aiReasoning: 'Tax compliance error on generated invoice.'
      },
      {
        ticketId: 'TCK-1020',
        title: 'Bulk user CSV import fails with encoding syntax error',
        description: 'Uploading CSV file with UTF-8 special characters corrupts user names.',
        category: 'Technical',
        priority: 'Medium',
        status: 'Open',
        custIdx: 19, // Tanya Kapoor
        daysOld: 3,
        aiReasoning: 'File parsing character encoding issue.'
      },
      {
        ticketId: 'TCK-1021',
        title: 'Account lockout triggered after single wrong password attempt',
        description: 'Account status locked out immediately instead of waiting for 5 failed tries.',
        category: 'Account',
        priority: 'Urgent',
        status: 'Open',
        custIdx: 0, // John Doe
        daysOld: 2,
        aiReasoning: 'Aggressive security policy blocking legitimate user access.'
      },
      {
        ticketId: 'TCK-1022',
        title: 'Request webhook notifications for ticket resolution events',
        description: 'We want to receive HTTP POST payloads whenever a support ticket is closed.',
        category: 'Feature Request',
        priority: 'Low',
        status: 'Open',
        custIdx: 1, // Sarah Connor
        daysOld: 2,
        aiReasoning: 'Integration feature request for external webhooks.'
      },
      {
        ticketId: 'TCK-1023',
        title: 'Payment receipt email not containing VAT registration number',
        description: 'Our accounting department requires VAT number printed on all PDF receipts.',
        category: 'Billing',
        priority: 'Medium',
        status: 'Open',
        custIdx: 2, // Amit Sharma
        daysOld: 1,
        aiReasoning: 'Compliance detail missing from receipt email template.'
      },
      {
        ticketId: 'TCK-1024',
        title: 'Groq AI auto-triage suggesting incorrect priority for urgency keywords',
        description: 'Ticket containing "production crash" was classified as Medium priority.',
        category: 'Technical',
        priority: 'High',
        status: 'Open',
        custIdx: 3, // Neha Verma
        daysOld: 1,
        aiReasoning: 'AI triage prompt tuning needed for high-severity keywords.'
      },
      {
        ticketId: 'TCK-1025',
        title: 'Unable to update notification preferences in customer settings',
        description: 'Toggling email alert checkboxes does not save setting preference.',
        category: 'General',
        priority: 'Low',
        status: 'Open',
        custIdx: 4, // Rajesh Kumar
        daysOld: 0, // Today
        aiReasoning: 'Minor UI state saving issue in account settings.'
      }
    ];

    const ticketsToInsert = sampleTickets.map((t) => {
      const customerObj = customers[t.custIdx];
      const createdAt = daysAgo(t.daysOld, Math.floor(Math.random() * 8));

      // Build status history array
      const history = [
        {
          status: 'Open',
          changedBy: customerObj._id,
          note: 'Ticket submitted by customer',
          timestamp: createdAt
        }
      ];

      const assignedAdmin = activeAdmins[Math.floor(Math.random() * activeAdmins.length)];

      if (t.status === 'In Progress') {
        const inProgressDate = daysAgo(t.inProgressDaysOld || Math.max(1, t.daysOld - 2));
        history.push({
          status: 'In Progress',
          changedBy: assignedAdmin,
          note: t.resolutionNote || 'Assigned to technical support agent for investigation.',
          timestamp: inProgressDate
        });
      } else if (t.status === 'Resolved') {
        const inProgressDate = daysAgo(t.daysOld - 1);
        const resolvedDate = daysAgo(t.resolvedDaysOld || Math.max(0, t.daysOld - 3));

        history.push({
          status: 'In Progress',
          changedBy: assignedAdmin,
          note: 'Ticket assigned and troubleshooting initiated.',
          timestamp: inProgressDate
        });

        history.push({
          status: 'Resolved',
          changedBy: assignedAdmin,
          note: t.resolutionNote || 'Issue resolved successfully and fix verified.',
          timestamp: resolvedDate
        });
      }

      const updatedAt = history[history.length - 1].timestamp;

      return {
        ticketId: t.ticketId,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        customer: customerObj._id,
        aiTriaged: true,
        aiReasoning: t.aiReasoning,
        aiSuggestedSummary: `${t.category} issue: ${t.title}`,
        statusHistory: history,
        createdAt,
        updatedAt
      };
    });

    const createdTickets = await Ticket.insertMany(ticketsToInsert);
    console.log(`[Seed] Created ${createdTickets.length} tickets spanning the past 60 days`);

    // 6. Generate Notifications for Customers
    const notificationsToInsert = [
      {
        user: customers[0]._id,
        ticket: createdTickets[0]._id,
        title: 'Ticket TCK-1001 Resolved',
        message: 'Your ticket "Payment gateway connection timeout during checkout" was marked as Resolved.',
        type: 'STATUS_CHANGE',
        read: true,
        createdAt: daysAgo(53)
      },
      {
        user: customers[1]._id,
        ticket: createdTickets[1]._id,
        title: 'Ticket TCK-1002 Resolved',
        message: 'Your ticket "Database connection pool maxed out" was marked as Resolved.',
        type: 'STATUS_CHANGE',
        read: true,
        createdAt: daysAgo(48)
      },
      {
        user: customers[10]._id,
        ticket: createdTickets[10]._id,
        title: 'Ticket TCK-1011 Status Updated',
        message: 'Your ticket "Slow dashboard loading speed" status was changed to In Progress.',
        type: 'STATUS_CHANGE',
        read: false,
        createdAt: daysAgo(15)
      },
      {
        user: customers[15]._id,
        ticket: createdTickets[15]._id,
        title: 'Ticket TCK-1016 Status Updated',
        message: 'Your ticket "User session logs out unexpectedly" status was changed to In Progress.',
        type: 'STATUS_CHANGE',
        read: false,
        createdAt: daysAgo(5)
      }
    ];

    await Notification.insertMany(notificationsToInsert);
    console.log(`[Seed] Created sample notifications`);

    console.log('\n=======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================================');
    console.log('🔑 Credentials Summary:');
    console.log('  - Superadmin: adityatiwari5175@gmail.com / Password: Aditya@1234');
    console.log('  - Admins (5): admin@helpdesk.com, rahul.admin@helpdesk.com, etc. / Password: Admin@1234');
    console.log('  - Customers (20): john.doe@example.com, sarah.connor@example.com, etc. / Password: Customer@1234');
    console.log('=======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
