import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
    street: '',
    streetNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    cardHolderName: '',
    cardNumber: '',
    cardExpiry: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // BUG #29: Não valida se email é válido
      // BUG #30: Não valida se password está vazio
      // BUG #31: Não valida se password e confirmPassword são iguais
      if (!formData.name || !formData.email || !formData.password) {
        setError('Todos os campos são obrigatórios')
        setLoading(false)
        return
      }

      const requiredAddressAndCardFields = [
        formData.zipCode,
        formData.street,
        formData.streetNumber,
        formData.neighborhood,
        formData.city,
        formData.state,
        formData.cardHolderName,
        formData.cardNumber,
        formData.cardExpiry
      ]

      if (requiredAddressAndCardFields.some((field) => !field)) {
        setError('Preencha endereco e dados do cartao')
        setLoading(false)
        return
      }

      // BUG #31: Não valida se as senhas são iguais
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não correspondem')
        setLoading(false)
        return
      }

      const sanitizedCardNumber = formData.cardNumber.replace(/\D/g, '')

      if (sanitizedCardNumber.length < 13) {
        setError('Numero do cartao invalido')
        setLoading(false)
        return
      }

      if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        setError('Validade do cartao deve estar no formato MM/AA')
        setLoading(false)
        return
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          zipCode: formData.zipCode,
          street: formData.street,
          streetNumber: formData.streetNumber,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          cardHolderName: formData.cardHolderName,
          cardNumber: sanitizedCardNumber,
          cardExpiry: formData.cardExpiry
        }
      )

      // BUG #32: Não armazena token após registro
      // Deveria fazer login automático
      alert('Cadastro realizado com sucesso! Faça login para continuar.')
      router.push('/login')
    } catch (err) {
      // BUG #33: Não trata erro corretamente
      setError(err.response?.data?.error || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar Conta - BugShop
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {/* BUG #29: Não valida email no frontend */}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {/* BUG #30: Não valida se senha está vazia */}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Endereco</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    CEP
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.street}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.streetNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.neighborhood}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Cartao de Credito</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700">
                    Nome no cartao
                  </label>
                  <input
                    id="cardHolderName"
                    name="cardHolderName"
                    type="text"
                    value={formData.cardHolderName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Numero do cartao
                  </label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    inputMode="numeric"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                    Validade
                  </label>
                  <input
                    id="cardExpiry"
                    name="cardExpiry"
                    type="text"
                    placeholder="MM/AA"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <p className="mt-2 text-center text-sm text-gray-600">
            Já tem conta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
