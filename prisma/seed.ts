import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flow-ramarket.com' },
    update: {},
    create: {
      email: 'admin@flow-ramarket.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      kycVerified: true,
    },
  });

  // Create provider users
  const providerPassword = await bcrypt.hash('provider123', 12);
  const provider1 = await prisma.user.upsert({
    where: { email: 'provider1@example.com' },
    update: {},
    create: {
      email: 'provider1@example.com',
      passwordHash: providerPassword,
      name: 'Provider One',
      role: 'PROVIDER',
      payoutAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      kycVerified: true,
    },
  });

  const provider2 = await prisma.user.upsert({
    where: { email: 'provider2@example.com' },
    update: {},
    create: {
      email: 'provider2@example.com',
      passwordHash: providerPassword,
      name: 'Provider Two',
      role: 'PROVIDER',
      payoutAddress: '0x8ba1f109551bD432803012645Hac136c22C1779',
      kycVerified: true,
    },
  });

  // Create consumer user
  const consumerPassword = await bcrypt.hash('consumer123', 12);
  const consumer = await prisma.user.upsert({
    where: { email: 'consumer@example.com' },
    update: {},
    create: {
      email: 'consumer@example.com',
      passwordHash: consumerPassword,
      name: 'Consumer User',
      role: 'CONSUMER',
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
  });

  // Create nodes for providers
  const node1 = await prisma.node.create({
    data: {
      userId: provider1.id,
      name: 'US East Node 1',
      region: 'us-east-1',
      status: 'ONLINE',
      totalRamGB: 256,
      availableRamGB: 128,
      totalGpuCount: 4,
      availableGpuCount: 2,
      gpuVramGB: 24,
      lastHeartbeat: new Date(),
    },
  });

  const node2 = await prisma.node.create({
    data: {
      userId: provider2.id,
      name: 'EU West Node 1',
      region: 'eu-west-1',
      status: 'ONLINE',
      totalRamGB: 512,
      availableRamGB: 256,
      totalGpuCount: 8,
      availableGpuCount: 4,
      gpuVramGB: 48,
      lastHeartbeat: new Date(),
    },
  });

  // Create offers
  const offer1 = await prisma.offer.create({
    data: {
      userId: provider1.id,
      nodeId: node1.id,
      resourceType: 'RAM',
      amount: 64,
      region: 'us-east-1',
      pricePerUnitPerTime: 0.01,
      currency: 'USDC',
      minDurationMinutes: 60,
      maxDurationMinutes: 1440,
      maxConcurrentRentals: 2,
      published: true,
      active: true,
      reliabilityScore: 98.5,
      totalRentals: 15,
      successfulRentals: 15,
    },
  });

  const offer2 = await prisma.offer.create({
    data: {
      userId: provider1.id,
      nodeId: node1.id,
      resourceType: 'GPU',
      amount: 2,
      region: 'us-east-1',
      pricePerUnitPerTime: 0.5,
      currency: 'USDC',
      minDurationMinutes: 30,
      maxDurationMinutes: 720,
      maxConcurrentRentals: 1,
      published: true,
      active: true,
      reliabilityScore: 95.2,
      totalRentals: 8,
      successfulRentals: 7,
    },
  });

  const offer3 = await prisma.offer.create({
    data: {
      userId: provider2.id,
      nodeId: node2.id,
      resourceType: 'RAM',
      amount: 128,
      region: 'eu-west-1',
      pricePerUnitPerTime: 0.008,
      currency: 'USDC',
      minDurationMinutes: 60,
      maxDurationMinutes: 2880,
      maxConcurrentRentals: 4,
      published: true,
      active: true,
      reliabilityScore: 99.1,
      totalRentals: 32,
      successfulRentals: 32,
    },
  });

  console.log('Seed data created:');
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Providers: ${provider1.email}, ${provider2.email}`);
  console.log(`- Consumer: ${consumer.email}`);
  console.log(`- Nodes: ${node1.name}, ${node2.name}`);
  console.log(`- Offers: ${offer1.id}, ${offer2.id}, ${offer3.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

