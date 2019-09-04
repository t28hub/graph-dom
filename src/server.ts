import { install } from 'source-map-support';
import app from './app';

install();

const DEFAULT_PORT = 8081;
const server = app.listen(app.get('port') || DEFAULT_PORT, () => {
  console.info(`Application is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
});

export default server;
