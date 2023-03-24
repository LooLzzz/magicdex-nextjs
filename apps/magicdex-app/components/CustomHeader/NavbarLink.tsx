import Link from 'next/link'
import { useRouter } from 'next/router'
import { MouseEventHandler } from 'react'
import useStyles from './styles'


export default function NavbarLink({
  href,
  onClick = undefined,
  sidebar = false,
  children
}: {
  href: string,
  onClick?: MouseEventHandler<HTMLAnchorElement>,
  sidebar?: boolean,
  children: React.ReactNode
}) {
  const router = useRouter()
  const { classes, cx } = useStyles()

  const isRouteActive = (
    href === '/'
      ? router.pathname === href
      : (
        router
          .pathname
          .replace(/^[/]/, '')
          .startsWith(
            href
              .replace(/^[/]/, '')
          )
      )
  )

  return (
    <Link
      onClick={onClick}
      href={href}
      className={cx(
        classes.link,
        {
          sidebar,
          activeLink: isRouteActive,
        }
      )}
    >
      {children}
    </Link>
  )
}
