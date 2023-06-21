import { Button } from '@mantine/core'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'


export default function LoginLogoutButtons({
  loginProps = {},
  signupProps = {},
  logoutProps = {},
  reversed = false,
  component: Component = Button,
  afterOnClick: _afterOnClick,
}: {
  loginProps?: object,
  signupProps?: object,
  logoutProps?: object,
  reversed?: boolean,
  afterOnClick?: (e?: React.MouseEvent) => void,
  component?: React.ElementType,
}) {
  const router = useRouter()
  const session = useSession()

  const afterOnClick = (e: React.MouseEvent) => {
    if (_afterOnClick)
      _afterOnClick(e)
  }

  const loginAndSignup = [
    {
      ...loginProps,
      onClick: e => { router.push('/login'); afterOnClick(e) },
      children: 'Login',
    },
    {
      variant: 'default',
      ...signupProps,
      onClick: e => { router.push('/signup'); afterOnClick(e) },
      children: 'Signup',
    },
  ]

  return (
    <>
      {session.status === 'authenticated'
        ? <Component
          {...logoutProps}
          onClick={e => { signOut(); afterOnClick(e) }}
        >
          Logout
        </Component>

        : (reversed ? loginAndSignup.reverse() : loginAndSignup).map((props, idx) => (
          <Component
            key={idx}
            {...props}
          />
        ))
      }
    </>
  )
}
