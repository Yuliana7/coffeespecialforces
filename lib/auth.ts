// auth helpers
import { getServerSession as nextAuthGetServerSession } from 'next-auth/next'
import { authOptions } from './authOptions'

export const getServerSession = (req: any, res: any) => {
  return nextAuthGetServerSession(req, res, authOptions)
}
