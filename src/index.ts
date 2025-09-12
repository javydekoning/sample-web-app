import * as os from 'os';
import { IncomingMessage, ServerResponse, createServer, OutgoingHttpHeaders, IncomingHttpHeaders } from 'http';
const logger = require('pino-http')();

const resHeaders: OutgoingHttpHeaders = {
  content: 'text/html; charset=utf-8',
  'X-Backend-Server': os.hostname(),
};

interface ReturnProps {
  ServerHostname: string;
  Listener?: string;
  Requester?: string;
  Server: string;
  Uptime?: number;
  Path: string | undefined;
  Headers?: IncomingHttpHeaders;
  Environment: NodeJS.ProcessEnv;
}
const json = (req: IncomingMessage): ReturnProps => {
  const filteredEnv = Object.keys(process.env)
    .filter(key => !key.startsWith('npm_'))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {} as NodeJS.ProcessEnv);

  return {
    ServerHostname: os.hostname(),
    Server: process.title + ':' + process.version,
    Uptime: process.uptime(),
    Path: req.url,
    //Headers: req.headers,
    Environment: filteredEnv,
  };
};

const generateResponse = (res: ServerResponse, statusCode: number, headers: OutgoingHttpHeaders, body: string): void => {
  res.writeHead(statusCode, headers);
  res.write(body);
  res.end();
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  logger(req, res);
  generateResponse(res, 200, resHeaders, JSON.stringify(json(req), null, 2));
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 80;
server.listen(port, '0.0.0.0');
console.log(`Server running on port ${port}`);
