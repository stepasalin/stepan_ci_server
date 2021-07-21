import express, {Express} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import testRoutes from './routes';

const app: Express = express();

const PORT: string | number = process.env.PORT || 4000;

app.use(cors());
app.use(testRoutes);

const uri: string = 'mongodb://root:password@localhost:27017';
const options = {useNewUrlParser: true, useUnifiedTopology: true};
mongoose.set('useFindAndModify', false);

mongoose
    .connect(uri, options)
    .then(() =>
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`),
      ),
    )
    .catch((error) => {
      throw error;
    });
