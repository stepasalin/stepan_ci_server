import express, {Express} from 'express';
import cors from 'cors';
import routes from './routes';

const app: Express = express();
app.use(cors());
app.use(routes);

export {app};
