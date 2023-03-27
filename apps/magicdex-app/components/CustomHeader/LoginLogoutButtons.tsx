import { Button } from '@mantine/core'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'


export default function LoginLogoutButtons({
  loginProps = {},
  logoutProps = {},
  component: Component = Button,
  afterOnClick: _afterOnClick,
}: {
  loginProps?: object,
  logoutProps?: object,
  afterOnClick?: (e?: React.MouseEvent) => void,
  component?: React.ElementType,
}) {
  const router = useRouter()
  const session = useSession()

  const afterOnClick = (e: React.MouseEvent) => {
    if (_afterOnClick)
      _afterOnClick(e)
  }

  return (
    <>
      {session.status === 'authenticated'
        ? <Component
          {...logoutProps}
          onClick={e => { signOut(); afterOnClick(e) }}
        >
          Logout
        </Component>

        : <Component
          {...loginProps}
          onClick={e => { router.push('/login'); afterOnClick(e) }}
        >
          Login
        </Component>
      }
    </>
  )
}
