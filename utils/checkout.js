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
  zipCode: '',
  street: '',
  streetNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  paymentMethod: paymentMethodOptions[0].value
})
