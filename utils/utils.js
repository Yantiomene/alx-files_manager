export function getAuthHeader(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  return header;
}

export function getToken(authHeader) {
  const tokenType = authHeader.substring(0, 5);
  if (tokenType !== 'Basic') return null;
  return authHeader.substring(6);
}

export function decodeToken(token) {
  const decodedToken = Buffer.from(token, 'base64').toString('utf8');
  if (!decodedToken.includes(':')) return null;
  return decodedToken;
}

export function getCred(decodedToken) {
  const [email, password] = decodedToken.split(':');
  if (!email || !password) return null;
  return email;
}
