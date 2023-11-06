import { CertificateIdSchema, getZodErrMessage } from '@/app/utils/zod';
import { ZodError } from 'zod';
import prisma from '../../../../../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import puppeteer from 'puppeteer';
import { getCertificate } from '@/app/utils/certificate';
import Chromium from 'chrome-aws-lambda';

export async function GET(_: Request, { params }: { params: { id: string } }) {
    // const browser = await puppeteer.launch({ headless: "new" });
    const browser = await Chromium.puppeteer.launch({
        args: [...Chromium.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: Chromium.defaultViewport,
        executablePath: await Chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
    });

    try {
        // Validate and parse
        const certificateId = CertificateIdSchema.parse(params.id);

        const certificate = await prisma.certificate.findUniqueOrThrow({
            where: { certificate_id: certificateId },
            include: { user: true },
        });

        const page = await browser.newPage();

        // Set the content of the page with the certificate data
        await page.setContent(
            getCertificate(
                certificate.user.email,
                certificate.user.first_name,
                certificate.user.last_name,
                certificate.certificate_id
            )
        );

        const pdf = await page.pdf({
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

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
