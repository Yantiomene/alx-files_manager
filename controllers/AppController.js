import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AppController = {
  getStatus: (req, res) => {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();
    res.set('Content-Type', 'application/json');
    res.status(200).json({ redis: redisAlive, db: dbAlive });
},

getStats: async (req, res) => {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    res.set('Content-Type', 'application/json');
    res.status(200).json({ users: usersCount, files: filesCount });
  },
};

module.exports = AppController;
