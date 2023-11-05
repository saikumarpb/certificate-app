import { getZodErrMessage } from '@/app/utils/zod';
import { ZodError, z } from 'zod';
import prisma from '../../../../../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const IdSchema = z.string().uuid();

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        // Validate and parse
        const certificateId = IdSchema.parse(params.id);

        const certificate = await prisma.certificate.findUniqueOrThrow({
            where: { certificate_id: certificateId },
            include: { user: true },
        });

        return Response.json({
            firstName: certificate.user.first_name,
            lastName: certificate.user.last_name,
            email: certificate.user.email,
            certificateId: certificate.certificate_id,
        });
    } catch (e) {
        console.log(e);

        if (e instanceof ZodError) {
            const errMessages = getZodErrMessage(e);
            return Response.json(errMessages.join(', '), { status: 400 });
        }

        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
            return Response.json('Not found', { status: 404 });
        }
        return Response.json({ error: e }, { status: 400 });
    }
}
