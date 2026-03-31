export const paymentMethodOptions = [
  { value: 'pix', label: 'Pix' },
  { value: 'credit_card', label: 'Cartao de credito' },
  { value: 'debit_card', label: 'Cartao de debito' },
  { value: 'boleto', label: 'Boleto bancario' }
]

export const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch (error) {
    return null
  }
}

export const createInitialCheckoutData = (user = {}) => ({
  customerName: user.name || '',
  zipCode: user.zipCode || '',
  street: user.street || '',
  streetNumber: user.streetNumber || '',
  neighborhood: user.neighborhood || '',
  city: user.city || '',
  state: user.state || '',
  paymentMethod: user.cardLastFour ? 'credit_card' : paymentMethodOptions[0].value
})
