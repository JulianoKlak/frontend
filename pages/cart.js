import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { createInitialCheckoutData, getStoredUser, paymentMethodOptions } from '../utils/checkout'

export default function Cart() {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutData, setCheckoutData] = useState(createInitialCheckoutData())

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const token = localStorage.getItem('token')

        if (!token || !user.id) {
          router.push('/login')
          return
        }

        setCheckoutData(createInitialCheckoutData(user))

        // BUG #41: Permite acessar carrinho de outro usuário alterando o ID
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${user.id}`
        )

        setCart(response.data.cart)
        calculateTotal(response.data.cart)
      } catch (err) {
        setError('Erro ao carregar carrinho')
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      fetchCart()
    }
  }, [])

  // BUG #42: Cálculo errado do total (não multiplica quantidade pelo preço)
  const calculateTotal = (cartItems) => {
    let sum = 0
    cartItems.forEach(item => {
      sum += Number(item.price) * item.quantity
    })
    setTotal(sum)
  }

  const handleQuantityChange = async (cartId, newQuantity) => {
    const token = localStorage.getItem('token')

    // BUG #43: Não valida se quantidade é válida
    // BUG #44: Permite quantidade negativa
    if (newQuantity <= 0) {
      alert('Quantidade deve ser maior que 0')
      return
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${cartId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // BUG #45: Não atualiza o total após mudança de quantidade
      const updatedCart = cart.map(item =>
        item.id === cartId ? { ...item, quantity: newQuantity } : item
      )
      setCart(updatedCart)
      calculateTotal(updatedCart)
    } catch (err) {
      alert('Erro ao atualizar quantidade')
    }
  }

  const handleRemoveItem = async (cartId) => {
    const token = localStorage.getItem('token')

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${cartId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // BUG #46: Não atualiza o carrinho após remover item
      const updatedCart = cart.filter(item => item.id !== cartId)
      setCart(updatedCart)
      calculateTotal(updatedCart)
    } catch (err) {
      alert('Erro ao remover item')
    }
  }

  const handleCheckout = async () => {
    const token = localStorage.getItem('token')
    const user = getStoredUser()

    if (cart.length === 0) {
      alert('Carrinho vazio')
      return
    }

    const requiredFields = {
      customerName: 'Informe o nome do destinatario',
      zipCode: 'Informe o CEP',
      street: 'Informe a rua',
      streetNumber: 'Informe o numero',
      neighborhood: 'Informe o bairro',
      city: 'Informe a cidade',
      state: 'Informe o estado',
      paymentMethod: 'Selecione uma forma de pagamento'
    }

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!String(checkoutData[field] || '').trim()) {
        alert(message)
        return
      }
    }

    if (!user?.id) {
      router.push('/login')
      return
    }

    setCheckingOut(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/checkout`,
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert('Pedido realizado com sucesso!')
      router.push(`/orders`)
    } catch (err) {
      // BUG #47: Não trata erro corretamente
      alert(err.response?.data?.message || err.response?.data?.error || 'Erro ao realizar pedido')
    } finally {
      setCheckingOut(false)
    }
  }

  const handleCheckoutFieldChange = (event) => {
    const { name, value } = event.target

    setCheckoutData((currentData) => ({
      ...currentData,
      [name]: value
    }))
  }

  if (loading) return <div className="text-center p-8">Carregando...</div>
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Header links={[
        { href: '/', label: 'Produtos' },
        { href: '/orders', label: 'Meus Pedidos' }
      ]} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seu Carrinho</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Continuar comprando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Produto</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Preço</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantidade</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subtotal</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          R$ {parseFloat(item.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Entrega e Pagamento</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                      Destinatario
                    </label>
                    <input
                      id="customerName"
                      name="customerName"
                      type="text"
                      value={checkoutData.customerName}
                      onChange={handleCheckoutFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      CEP
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={checkoutData.zipCode}
                      onChange={handleCheckoutFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={checkoutData.state}
                      onChange={handleCheckoutFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                      Rua
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={checkoutData.street}
                      onChange={handleCheckoutFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="streetNumber" className="block text-sm font-medium text-gray-700">
                      Numero
                    </label>
                    <input
                      id="streetNumber"
                      name="streetNumber"
                      type="text"
                      value={checkoutData.streetNumber}
                      onChange={handleCheckoutFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                      Bairro
                    </label>
                    <input
                      id="neighborhood"
                      name="neighborhood"
                      type="text"
                      value={checkoutData.neighborhood}
                      onChange={handleCheckoutFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      Cidade
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={checkoutData.city}
                      onChange={handleCheckoutFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                      Forma de pagamento
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={checkoutData.paymentMethod}
                      onChange={handleCheckoutFieldChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      {paymentMethodOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 h-fit">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Pagamento:</span>
                    <span>{paymentMethodOptions.find((option) => option.value === checkoutData.paymentMethod)?.label}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition font-semibold disabled:opacity-50"
                >
                  {checkingOut ? 'Processando...' : 'Finalizar Compra'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
