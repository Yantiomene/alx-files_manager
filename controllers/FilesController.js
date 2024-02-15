import process from 'process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class FilesController {
  static async postUpload(req, res) {
    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const validTypes = ['folder', 'file', 'image'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      let parentFile;
      if (parentId !== '0') {
        parentFile = await dbClient.getFilesById(parentId);

        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let localPath;

      if (type !== 'folder') {
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

        await fs.mkdir(FOLDER_PATH, { recursive: true });
        const filePath = path.join(FOLDER_PATH, `${uuidv4()}`);
        await fs.writeFile(filePath, Buffer.from(data, 'base64'));
        localPath = filePath;
      }

      const newFile = await dbClient.createFile({
        userId,
        name,
        type,
        isPublic,
        parentId,
        localPath,
      });

      return res.status(201).json(newFile);
    } catch (error) {
      console.error('Error creating file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  static async getShow(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const fileId = req.params.id;
      const file = await dbClient.getFile({ userId, fileId });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(file);
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const parentId = req.query.parentId || '0';
      const page = req.query.page || 0;
      const pageSize = 20;

      const files = await dbClient.getUserFilesByParentId(userId, parentId, page, pageSize);
      return res.json(files);
    } catch (error) {
      console.error('Error retrieving files:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
