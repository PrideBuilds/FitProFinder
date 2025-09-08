import bcrypt from 'bcrypt';

export const seed = async knex => {
  // Check if admin already exists
  const adminExists = await knex('users')
    .where({ email: 'admin@fitprofinder.com' })
    .first();

  if (!adminExists) {
    const adminId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash('admin123456', 12);

    // Create master admin user
    await knex('users').insert({
      id: adminId,
      email: 'admin@fitprofinder.com',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      admin_level: 'super_admin',
      admin_since: new Date(),
      is_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create admin permissions
    const permissionId = crypto.randomUUID();
    await knex('admin_permissions').insert({
      id: permissionId,
      user_id: adminId,
      permission_level: 'super_admin',
      permissions: JSON.stringify({
        users: ['create', 'read', 'update', 'delete'],
        admins: ['create', 'read', 'update', 'delete'],
        system: ['read', 'update', 'delete'],
        analytics: ['read'],
        logs: ['read', 'delete'],
      }),
      granted_by: adminId, // Self-granted for initial admin
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Master admin created:');
    console.log('   Email: admin@fitprofinder.com');
    console.log('   Password: admin123456');
    console.log('   Level: super_admin');
    console.log('⚠️  Please change the password after first login!');
  } else {
    console.log('ℹ️  Admin user already exists, skipping creation');
  }
};
