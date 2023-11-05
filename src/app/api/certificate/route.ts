import { ZodError, z } from 'zod';
import prisma from '../../../../lib/prisma';
import { getZodErrMessage } from '@/app/utils/zod';
import puppeteer from 'puppeteer';
import {
    generateUniqueCertificateId,
    getCertificate,
} from '@/app/utils/certificate';

const PostReqBodySchema = z.object({
    firstName: z.string().min(1).max(25),
    lastName: z.string().min(1).max(25),
    email: z.string().email(),
});

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate and parse req body
        const parsedReqBody = PostReqBodySchema.parse(data);
        // Check for existing user (email)
        const existingUser = await prisma.user.findUnique({
            where: { email: parsedReqBody.email },
        });

        if (existingUser !== null) {
            return Response.json('User with email already exists', {
                status: 400,
            });
        }

        let uniqueCertificateId, existingRecord;

        do {
            uniqueCertificateId = generateUniqueCertificateId(5);

            existingRecord = await prisma.certificate.findUnique({
                where: { certificate_id: uniqueCertificateId },
            });
        } while (existingRecord);

        const user = await prisma.user.create({
            data: {
                email: parsedReqBody.email,
                first_name: parsedReqBody.firstName,
                last_name: parsedReqBody.lastName,
                cert: { create: { certificate_id: uniqueCertificateId } },
            },
            include: { cert: true },
        });
        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        // Set the content of the page with the certificate data
        await page.setContent(
            getCertificate(
                user.email,
                user.first_name,
                user.last_name,
                user.cert?.certificate_id!
            )
        );

        const pdf = await page.pdf({
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        const responseHeaders = new Headers();

        responseHeaders.set('Content-Type', 'application/pdf');
        responseHeaders.set(
            'Content-Disposition',
            `attachment; filename="${user.cert?.certificate_id}.pdf"`
        );

        return new Response(new Uint8Array(pdf), {
            status: 200,
            headers: responseHeaders,
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
