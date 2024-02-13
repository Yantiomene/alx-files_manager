import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      res.end();
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      res.end();
      return;
    }

    const exist = await dbClient.userExist(email);
    if (exist) {
      res.status(400).json({ error: 'Already exist' });
      res.end();
      return;
    }

    const user = await dbClient.createUser(email, password);
    const id = `${user.insertedId}`;
    res.status(201).json({ id, email });
    res.end();
  }

  static async getMe(req, res) {
    function unAuthError(res) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
    }

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
    res.json({ id: user._id.toString(), email: user.email }).end();
  }
}

export default UsersController;
