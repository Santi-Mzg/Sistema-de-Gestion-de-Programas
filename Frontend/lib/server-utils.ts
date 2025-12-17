import 'server-only';
import { cookies } from "next/headers";

export async function getJwtCookie() {
    const cookieStore = await cookies();
    return cookieStore.get('jwt')?.value;
}