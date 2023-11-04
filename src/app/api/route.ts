export async function GET(request: Request) {
    try {
        let message: string = await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('message after timeout');
            }, 2000);
        });
        return Response.json({ message });
    } catch (e) {
        return Response.json({ error: e });
    }
}
