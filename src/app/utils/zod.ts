import { ZodError, z } from 'zod';

export function getZodErrMessage(e: ZodError) {
    return e.issues.reduce(
        (accumulator: string[], current) => [...accumulator, current.message],
        []
    );
}

export const CertificateIdSchema = z.string().min(5).max(5).refine((value) => /^[A-Z0-9]+$/.test(value), {
    message: 'Certificate should contain only uppercase letters and digits',
  });
