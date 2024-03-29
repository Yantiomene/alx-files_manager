// eslint-disable-next-line import/extensions
import redisClient from '../utils/redis.js';
// eslint-disable-next-line import/extensions
import dbClient from '../utils/db.js';

class AppController {
  static async getStatus(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      res.set('Content-Type', 'application/json');
      res.status(200).json({ redis: true, db: true });
      res.end();
    }
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    res.set('Content-Type', 'application/json');
    res.status(200).json({ users, files });
    res.end();
  }
}

export default AppController;
