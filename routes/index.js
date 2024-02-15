import express from 'express';
// eslint-disable-next-line import/extensions
import AppController from '../controllers/AppController.js';
// eslint-disable-next-line import/extensions
import UsersController from '../controllers/UsersController.js';
// eslint-disable-next-line import/extensions
import AuthController from '../controllers/AuthController.js';
// eslint-disable-next-line import/extensions
import FilesController from '../controllers/FilesController.js';

const routes = express.Router();

routes.get('/status', AppController.getStatus);
routes.get('/stats', AppController.getStats);
routes.post('/users', UsersController.postNew);
routes.get('/connect', AuthController.getConnect);
routes.get('/disconnect', AuthController.getDisconnect);
routes.get('/users/me', UsersController.getMe);
routes.post('/files', FilesController.postUpload);
routes.get('/files/:id', FilesController.getShow);
routes.get('/files', FilesController.getIndex);

export default routes;
