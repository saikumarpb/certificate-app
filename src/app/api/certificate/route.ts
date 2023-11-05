import { ZodError, z } from 'zod';
import prisma from '../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { getZodErrMessage } from '@/app/utils/zod';
import { UUID } from 'crypto';
import puppeteer from 'puppeteer';

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

        const user = await prisma.user.create({
            data: {
                email: parsedReqBody.email,
                first_name: parsedReqBody.firstName,
                last_name: parsedReqBody.lastName,
                cert: { create: { certificate_id: uuidv4() } },
            },
            include: { cert: true },
        });
        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        // Set the content of the page with the certificate data
        await page.setContent(`
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Achievement</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
            }
            .certificate {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border: 2px solid #007BFF;
            }
            h1 {
                text-align: center;
                color: #007BFF;
            }
            p {
                margin: 10px 0;
            }
            .certificate-info {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <h1>Certificate of Achievement</h1>
            <div class="certificate-info">
                <p>This is to certify that</p>
                <p><strong>${user.first_name} ${user.last_name}</strong></p>
                <p>has successfully completed a course in</p>
                <p><strong>Your Course Name</strong></p>
            </div>
            <p>Certificate ID: <strong>${user.cert?.certificate_id}</strong></p>
            <p>Email: ${user.email}</p>
        </div>
    </body>
    </html>
    `);

        const pdf = await page.pdf({ format: 'A4' });

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
