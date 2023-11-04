import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export function getMessageFrom(e: PrismaClientKnownRequestError) {
    return e.meta
}