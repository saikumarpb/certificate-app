import { getZodErrMessage } from '@/app/utils/zod';
import { ZodError, z } from 'zod';
import prisma from '../../../../../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import puppeteer from 'puppeteer';

const IdSchema = z.string().uuid();

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const browser = await puppeteer.launch();

    try {
        // Validate and parse
        const certificateId = IdSchema.parse(params.id);

        const certificate = await prisma.certificate.findUniqueOrThrow({
            where: { certificate_id: certificateId },
            include: { user: true },
        });

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
                <p><strong>${certificate.user.first_name} ${certificate.user.last_name}</strong></p>
                <p>has successfully completed a course in</p>
                <p><strong>Your Course Name</strong></p>
            </div>
            <p>Certificate ID: <strong>${certificate.certificate_id}</strong></p>
            <p>Email: ${certificate.user.email}</p>
        </div>
    </body>
    </html>
    `);

        const pdf = await page.pdf({ format: 'A4' });

        const responseHeaders = new Headers();

        responseHeaders.set('Content-Type', 'application/pdf');
        responseHeaders.set(
            'Content-Disposition',
            `attachment; filename="${certificate.certificate_id}.pdf"`
        );

        return new Response(new Uint8Array(pdf), {
            status: 200,
            headers: responseHeaders,
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
    } finally {
        await browser.close();
    }
}
