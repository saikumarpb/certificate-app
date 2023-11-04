import prisma from '../../../../../lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z } from 'zod';

type Params = {
    id: string;
};

const getIdFromParams = ({ id }: Params) => {
    try {
        const idSchema = z.number();
        return idSchema.parse(parseInt(id));
    } catch (e) {
        console.log(e);

        return null;
    }
};

export async function DELETE(request: Request, urlParams: { params: Params }) {
    try {
        const id = getIdFromParams(urlParams.params);

        console.log(id);

        if (id === null) {
            return Response.json('Invalid Id', { status: 400 });
        }

        const user = await prisma.user.delete({
            where: { id: id! },
        });
    } catch (e) {
        let message;
        if (e instanceof PrismaClientKnownRequestError) {
            if (e.code === 'P2025') {
                message = 'Not found';
            }
            return Response.json(message, { status: 404 });
        }
        console.log(e);
        return Response.json({ error: e }, { status: 400 });
    }

    return Response.json({});
}
