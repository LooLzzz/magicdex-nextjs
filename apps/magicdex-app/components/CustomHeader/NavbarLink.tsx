import Link from 'next/link'
import { useRouter } from 'next/router'
import useStyles from './styles'


// TODO: do something with `sidebar` property

export default function NavbarLink({
  href,
  sidebar = false,
  children
}: {
  href: string,
  sidebar?: boolean,
  children: React.ReactNode
}) {
  const router = useRouter()
  const { classes, cx } = useStyles()

  const isRouteActive = router.pathname === href

  return (
    <Link
      href={href}
      className={cx(
        classes.link,
        { [classes.activeLink]: isRouteActive }
      )}
    >
      {children}
    </Link>
  )
}
