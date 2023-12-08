
const apiRoutes = {
  auth: '/api/auth',
  userCards: '/api/me/cards',
  whoami: '/api/whoami',
}

const navbarRoutes = [
  {
    url: '/',
    title: 'Home',
  },
  {
    url: '/collection',
    title: 'Collection',
  },
  {
    url: '/profile',
    title: 'Profile',
    hide: {
      unauthenticated: true,
      navbar: true,
      drawer: false,
    },
  },
]

export {
  apiRoutes,
  navbarRoutes,
}
