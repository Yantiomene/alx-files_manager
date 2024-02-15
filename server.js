import express from 'express';
import routes from './routes';

const server = express();
const PORT = process.env.PORT || 5000;

server.use(express.json({ limit: '100mb' }));
server.use(express.urlencoded({ limit: '100mb', extended: true }));
server.use(routes);

server.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});

export default server;
