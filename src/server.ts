import {app} from './app';
import mongoose from 'mongoose';
import {PORT, MONGO_URI}
  from './config';

const mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true};
mongoose.set('useFindAndModify', false);

mongoose
    .connect(MONGO_URI, mongoOptions)
    .then(() =>
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`),
      ),
    )
    .catch((error) => {
      throw error;
    });
