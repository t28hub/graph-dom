import { install } from 'source-map-support';
import app from './app';

install();

const server = app.listen(app.get('port') || 8081, () => {
  console.info(`Application is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
});

export default server;
