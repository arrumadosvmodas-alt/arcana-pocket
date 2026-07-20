import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await prisma.$executeRawUnsafe(`SELECT 1`);

        console.log('✓ Database connection successful');

        return Response.json({
            status: 'success',
            message: 'Database connection OK'
        });
    } catch (error) {
        console.error('Database error:', error);

        return Response.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}