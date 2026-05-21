/**
 * Seed script — creates sample users and tasks in the database.
 * Run: node seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');

const MONGO_URI = process.env.MONGO_URI;

// ── Sample users ──────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Admin User',    email: 'admin@taskflow.com',   password: 'Admin@123',   role: 'admin'  },
  { name: 'Alice Johnson', email: 'alice@taskflow.com',   password: 'User@123',    role: 'user'   },
  { name: 'Bob Williams',  email: 'bob@taskflow.com',     password: 'User@123',    role: 'user'   },
  { name: 'Carol Smith',   email: 'carol@taskflow.com',   password: 'User@123',    role: 'user'   },
];

// ── Sample tasks per user (indexed to USERS array) ───────────────────────────
const TASK_TEMPLATES = [
  // Admin tasks
  [
    { title: 'Set up CI/CD pipeline',          description: 'Configure GitHub Actions for automated deployments.', status: 'completed',  priority: 'high'   },
    { title: 'Review Q2 security audit',       description: 'Go through the OWASP checklist and resolve findings.', status: 'in-progress', priority: 'high'   },
    { title: 'Onboard new team members',       description: 'Prepare accounts and access for 3 new developers.',   status: 'pending',     priority: 'medium' },
    { title: 'Update API documentation',       description: 'Sync Swagger docs with the latest endpoint changes.', status: 'completed',  priority: 'low'    },
    { title: 'Plan next sprint',               description: 'Prioritise backlog items for the upcoming 2-week sprint.', status: 'pending', priority: 'medium' },
  ],
  // Alice tasks
  [
    { title: 'Design user onboarding flow',    description: 'Create wireframes for the new user registration flow.',  status: 'completed',  priority: 'high'   },
    { title: 'Fix login page mobile layout',   description: 'The login form overflows on screens below 375 px.',      status: 'completed',  priority: 'high'   },
    { title: 'Write unit tests for AuthContext', description: 'Cover login, register, and logout scenarios.',         status: 'in-progress', priority: 'medium' },
    { title: 'Refactor Dashboard component',   description: 'Extract stat cards into a reusable StatCard component.', status: 'pending',    priority: 'low'    },
    { title: 'Implement dark mode toggle',     description: 'Add a theme toggle to the user settings page.',          status: 'pending',    priority: 'low'    },
  ],
  // Bob tasks
  [
    { title: 'Optimise MongoDB queries',       description: 'Add indexes to users and tasks collections.',            status: 'in-progress', priority: 'high'   },
    { title: 'Set up Redis caching layer',     description: 'Cache frequently accessed user sessions.',               status: 'pending',     priority: 'high'   },
    { title: 'Migrate to TypeScript',          description: 'Convert backend controllers to TypeScript step by step.', status: 'pending',   priority: 'medium' },
    { title: 'Write API integration tests',    description: 'Test all REST endpoints using Jest + Supertest.',        status: 'completed',  priority: 'medium' },
    { title: 'Containerise backend with Docker', description: 'Write a Dockerfile and docker-compose.yml.',          status: 'in-progress', priority: 'medium' },
  ],
  // Carol tasks
  [
    { title: 'Analyse user activity data',     description: 'Build summary charts from the activity logs collection.', status: 'in-progress', priority: 'high' },
    { title: 'Prepare monthly report',         description: 'Export task completion stats for May 2026.',              status: 'pending',     priority: 'medium' },
    { title: 'Audit inactive accounts',        description: 'Identify users who have not logged in for 60+ days.',    status: 'completed',  priority: 'low'    },
    { title: 'Review role assignment policy',  description: 'Document the process for promoting users to admin.',     status: 'completed',  priority: 'low'    },
    { title: 'Update privacy policy page',     description: 'Reflect the new data retention rules in the docs.',      status: 'pending',     priority: 'low'    },
  ],
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  // Wipe existing seed data only (by email list — safe for production Atlas)
  const emails = USERS.map(u => u.email);
  const existingUsers = await User.find({ email: { $in: emails } });
  const existingIds = existingUsers.map(u => u._id);

  if (existingIds.length) {
    await Task.deleteMany({ user: { $in: existingIds } });
    await ActivityLog.deleteMany({ user: { $in: existingIds } });
    await User.deleteMany({ _id: { $in: existingIds } });
    console.log(`🗑   Cleared ${existingIds.length} existing seed user(s) and their data`);
  }

  // Create users — the User model's pre-save hook hashes the password automatically
  const createdUsers = [];
  for (const u of USERS) {
    const user = await User.create({ name: u.name, email: u.email, password: u.password, role: u.role, status: 'active' });
    createdUsers.push(user);
    console.log(`👤  Created user: ${u.email} (${u.role})`);
  }

  // Create tasks for each user
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const templates = TASK_TEMPLATES[i] || [];
    for (const t of templates) {
      await Task.create({ ...t, user: user._id });
    }
    console.log(`📋  Created ${templates.length} tasks for ${user.email}`);
  }

  // Log activity for each user
  for (const user of createdUsers) {
    await ActivityLog.create({
      user: user._id,
      action: 'REGISTER',
      details: `Seed: ${user.email} registered`,
      ipAddress: '127.0.0.1',
    });
  }

  console.log('\n🎉  Seed complete!\n');
  console.log('  Admin login:  admin@taskflow.com   /  Admin@123');
  console.log('  User logins:  alice@taskflow.com   /  User@123');
  console.log('                bob@taskflow.com     /  User@123');
  console.log('                carol@taskflow.com   /  User@123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
