import { ZodError } from 'zod';

export function getZodErrMessage(e: ZodError) {
    return e.issues.reduce(
        (accumulator: string[], current) => [...accumulator, current.message],
        []
    );
}
