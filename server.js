import express from 'express';
import routes from './routes/index';

const server = express();
const PORT = process.env.PORT ? process.env.PORT : 5000;

server.use(express.json());
server.use(routes);

server.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});

export default server;
