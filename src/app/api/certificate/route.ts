import { ZodError, z } from 'zod';
import prisma from '../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { getZodErrMessage } from '@/app/utils/zod';

const ReqBodySchema = z.object({
    firstName: z.string().min(1).max(25),
    lastName: z.string().min(1).max(25),
    email: z.string().email(),
});

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate and parse req body
        const parsedReqBody = ReqBodySchema.parse(data);
        // Check for existing user (email)
        const existingUser = await prisma.user.findUnique({
            where: { email: parsedReqBody.email },
        });

        if (existingUser !== null) {
            return Response.json('User with email already exists', {
                status: 400,
            });
        }

        const user = await prisma.user.create({
            data: {
                email: parsedReqBody.email,
                first_name: parsedReqBody.firstName,
                last_name: parsedReqBody.lastName,
                cert: { create: { certificate_id: uuidv4() } },
            },
            include: { cert: true },
        });

        return Response.json({
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            certificateId: user.cert?.certificate_id,
        });
    } catch (e) {
        if (e instanceof ZodError) {
            console.log(e.issues);
            const errMessages = getZodErrMessage(e);
            return Response.json(errMessages.join(', '), { status: 400 });
        }
        return Response.json('Bad request', { status: 400 });
    }
}
