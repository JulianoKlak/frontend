import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function Orders() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const token = localStorage.getItem('token')

        if (!token || !user.id) {
          router.push('/login')
          return
        }

        // BUG #48: Permite acessar pedidos de outro usuário alterando o ID
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${user.id}`
        )

        setOrders(response.data.orders)
      } catch (err) {
        setError('Erro ao carregar pedidos')
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      fetchOrders()
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) return <div className="text-center p-8">Carregando...</div>
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            🐛 BugShop
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Produtos
            </Link>
            <Link href="/cart" className="text-blue-600 hover:text-blue-800">
              Carrinho
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Você ainda não fez nenhum pedido</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Começar a comprar
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID do Pedido</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      R$ {parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {/* BUG #49: Data não é formatada corretamente */}
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
