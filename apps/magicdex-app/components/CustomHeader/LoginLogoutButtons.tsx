import { Button } from '@mantine/core'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'


export default function LoginLogoutButtons({
  loginProps = {},
  logoutProps = {},
  signupProps = {},
  afterOnClick = null,
  component: Component = Button,
}: {
  loginProps?: object,
  logoutProps?: object,
  signupProps?: object,
  afterOnClick?: (e?: React.MouseEvent) => void,
  component?: React.ElementType,
}) {
  const router = useRouter()
  const session = useSession()

  return (
    <>
      {
        session.status === 'authenticated'
          ? <Component
            {...logoutProps}
            onClick={e => { signOut(); afterOnClick && afterOnClick(e) }}
          >
            Logout
          </Component>
          : <>
            <Component
              {...loginProps}
              onClick={e => { router.push('/login'); afterOnClick && afterOnClick(e) }}
            >
              Login
            </Component>
            <Component
              {...signupProps}
              onClick={e => { router.push('/signup'); afterOnClick && afterOnClick(e) }}
            >
              Signup
            </Component>
          </>
      }
    </>
  )
}
