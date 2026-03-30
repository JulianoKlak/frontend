import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getStoredUser } from '../utils/checkout'

export default function Header({ homeHref = '/', links = [] }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser())
    }

    syncUser()
    window.addEventListener('storage', syncUser)
    window.addEventListener('focus', syncUser)

    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('focus', syncUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
        <Link href={homeHref} className="text-2xl font-bold text-gray-900">
          BugShop
        </Link>

        <div className="flex items-center gap-4 flex-wrap justify-end">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-blue-600 hover:text-blue-800">
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <span className="text-sm text-gray-600">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                Logoff
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Login
              </Link>
              <Link href="/register" className="text-blue-600 hover:text-blue-800">
                Cadastro
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
