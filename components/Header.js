import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getStoredUser } from '../utils/checkout'

export default function Header({ homeHref = '/', links = [] }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)

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

  useEffect(() => {
    setIsUserModalOpen(false)
  }, [router.asPath])

  useEffect(() => {
    if (!isUserModalOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsUserModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isUserModalOpen])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsUserModalOpen(false)
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
              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                {user.name || user.email}
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

      {user && isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/30 px-4 py-20">
          <button
            type="button"
            aria-label="Fechar modal de usuario"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsUserModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Sua conta
              </p>
              <h2 className="mt-2 text-xl font-bold text-gray-900">{user.name || 'Usuario'}</h2>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-sm text-gray-700">{user.email}</p>
              </div>

              <Link
                href="/account/password"
                className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Trocar senha
              </Link>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logoff
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
