import { getJwtCookie } from '@/lib/server-utils';

export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sistema-de-gestion-de-programas-backend.onrender.com';



export async function customFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  // const cookieStore = await cookies();
  // const jwt = cookieStore.get('jwt')?.value;

  const jwt = getJwtCookie();

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options?.headers || {}),
      ...(jwt ? { Cookie: `jwt=${jwt}` } : {}),
      'Content-Type': 'application/json'
    },   
    cache: "no-store",        
    next: { revalidate: 0 }  
  })


  const json = await res.json()

  return {
    data: json,
    status: res.status,
    headers: res.headers
  } as T
};
