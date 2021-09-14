import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes';
import './database/connection';

const app: Express = express();
app.use(cors());
app.use(routes);

export { app };
