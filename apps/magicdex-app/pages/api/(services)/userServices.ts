import { supabaseAuthClient } from '@/api/(services)/supabase'
import bcrypt from 'bcrypt'
import { User } from 'next-auth'
import { UserCredentials } from '../(types)'


export async function getUserByCredentials({ email, password }: UserCredentials): Promise<User> {
  const { data: user, error } = (
    await supabaseAuthClient
      .from('users')
      .select('id, name, email, password, image')
      .eq('email', email)
      .limit(1)
      .single()
  )

  if (error || !user?.password)
    return null

  const isPasswordValid = await bcrypt.compare(password, user.password)
  delete user.password
  return isPasswordValid ? user : null
}
