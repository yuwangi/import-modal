import Cookies from 'js-cookie'

export const getToken = TOKEN_KEY => {
  const token = Cookies.get(TOKEN_KEY)
  if (token) return token
  else return false
}
