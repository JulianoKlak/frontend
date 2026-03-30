import Link from 'next/link'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '../components/Header'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
        setProducts(response.data.products)
      } catch (err) {
        // BUG #27: Não trata erro corretamente
        setError('Erro ao carregar produtos')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) return <div className="text-center p-8">Carregando...</div>
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Header links={[{ href: '/cart', label: 'Carrinho' }]} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Produtos Disponíveis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <img
                src={product.image_url || '/images/product-placeholder.svg'}
                alt={product.name}
                className="h-56 w-full rounded-t-lg object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    R$ {parseFloat(product.price).toFixed(2)}
                  </span>
                  {/* BUG #28: Não mostra corretamente se há estoque */}
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
                  </span>
                </div>

                <Link 
                  href={`/product/${product.id}`}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-center block"
                >
                  Ver Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
