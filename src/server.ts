import {app} from './app';
import {PORT}
  from './config';

app.listen(PORT, () => {
  console.log(`Server runs on 127.0.0.1:${PORT}`);
});
