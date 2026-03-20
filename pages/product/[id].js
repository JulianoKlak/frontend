import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`
        )
        setProduct(response.data.product)
      } catch (err) {
        setError('Erro ao carregar produto')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      alert('Você precisa estar logado para adicionar ao carrinho')
      router.push('/login')
      return
    }

    // BUG #37: Não valida se quantidade é válida
    // BUG #38: Permite quantidade negativa
    if (quantity <= 0) {
      alert('Quantidade deve ser maior que 0')
      return
    }

    setAddingToCart(true)

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`,
        {
          product_id: parseInt(id),
          quantity: parseInt(quantity)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert('Produto adicionado ao carrinho!')
      router.push('/cart')
    } catch (err) {
      // BUG #39: Não trata erro corretamente
      alert('Erro ao adicionar ao carrinho')
    } finally {
      setAddingToCart(false)
    }
  }

  // BUG #40: Não valida se quantidade é número
  const handleQuantityChange = (e) => {
    setQuantity(e.target.value)
  }

  if (loading) return <div className="text-center p-8">Carregando...</div>
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>
  if (!product) return <div className="text-center p-8">Produto não encontrado</div>

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
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              <img
                src={product.image_url || '/images/product-placeholder.svg'}
                alt={product.name}
                className="h-full min-h-[320px] w-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <p className="text-gray-600 text-lg mb-6">{product.description}</p>

              <div className="flex justify-between items-center mb-8">
                <span className="text-4xl font-bold text-green-600">
                  R$ {parseFloat(product.price).toFixed(2)}
                </span>
                <span className={product.stock > 0 ? 'text-green-600 text-lg' : 'text-red-600 text-lg'}>
                  {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantidade
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {/* BUG #40: Não valida se quantidade é número */}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {addingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
