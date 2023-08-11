import { userServices } from '@/api/(services)'
import { Session } from 'next-auth'
import { HttpError } from '../(exceptions)'
import { UpdateUserOptions } from '../(types)'


export async function updateUserHandler(session: Session, data: UpdateUserOptions) {
  if (!session?.user?.id)
    throw new HttpError('Invalid session', 401)

  try {
    const res = await userServices.updateUserById(session.user.id, data)
    return {
      success: true,
      message: 'User updated',
      details: res,
    }
  }
  catch (error) {
    console.error(error)
    return {
      success: false,
      message: 'Error updating user',
      details: error,
    }
  }
}
