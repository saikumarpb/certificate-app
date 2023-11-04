import { NextRequest } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request: Request) {
    const user = await prisma.user.create({
        data: {
            name: 'Sai Kumar',
            email: 'saik5484@gmail.com',
            password_hash: 'dafadfa',
            profile: { create: { bio: 'Yo yo' } },
        },
    });

    return Response.json(user);
}