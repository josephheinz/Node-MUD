export async function GET({ params }) {
    const { id } = params;
    return new Response(`Id is: ${id}`);
}