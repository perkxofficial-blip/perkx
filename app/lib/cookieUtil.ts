import { cookies } from 'next/headers'

type CookieOptions = {
  ttl?: number // seconds
  path?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
}

export const cookieUtil = {
  async get<T = any>(key: string): Promise<T | null> {
    const value = (await cookies()).get(key)?.value
    if (!value) return null

    try {
      return JSON.parse(value) as T
    } catch {
      return value as T
    }
  },

  async set<T>(key: string, value: T, options?: CookieOptions) {
    const cookieStore = await cookies()

    const cookieOptions: Parameters<typeof cookieStore.set>[0] = {
      name: key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      path: options?.path ?? '/',
      httpOnly: options?.httpOnly ?? false,
      secure: options?.secure ?? process.env.NODE_ENV === 'production',
      sameSite: options?.sameSite ?? 'lax',
    }

    if (typeof options?.ttl === 'number') {
      cookieOptions.maxAge = options.ttl
    }

    cookieStore.set(cookieOptions)
  },

  async delete(keys: string | string[]): Promise<void> {
    const cookieStore = await cookies()
    const keyList = Array.isArray(keys) ? keys : [keys]
    keyList.forEach((key) => {
      cookieStore.delete({
        name: key,
        path: '/',
      })
    })
  },
}
