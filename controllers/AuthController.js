import { v4 } from 'uuid';
// eslint-disable-next-line import/extensions
import redisClient from '../utils/redis.js';
// eslint-disable-next-line import/extensions
import dbClient from '../utils/db.js';
// eslint-disable-next-line import/extensions
import {
  getToken, getAuthHeader, decodeToken, getCred,
} from '../utils/utils.js';

function unAuthError(res) {
  res.status(401).json({ error: 'Unauthorized' });
  res.end();
}

class AuthController {
  static async getConnect(req, res) {
    const authHeader = getAuthHeader(req);
    if (!authHeader) {
      unAuthError(res);
      return;
    }
    const token = getToken(authHeader);
    if (!token) {
      unAuthError(res);
      return;
    }
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      unAuthError(res);
      return;
    }
    const email = getCred(decodedToken);
    const user = await dbClient.getUser(email);
    if (!user) {
      unAuthError(res);
      return;
    }
    const accessToken = v4();
    await redisClient.set(`auth_${accessToken}`, user._id.toString(), 60 * 60 * 24);
    res.json({ token: accessToken });
    res.end();
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      unAuthError(res);
      return;
    }
    const id = await redisClient.get(`auth_${token}`);
    if (!id) {
      unAuthError(res);
      return;
    }
    const user = await dbClient.getUserById(id);
    if (!user) {
      unAuthError(res);
      return;
    }
    await redisClient.del(`auth_${token}`);
    res.status(204).end();
  }
}

export default AuthController;
