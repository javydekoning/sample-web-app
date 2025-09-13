import * as os from 'os';
import { IncomingMessage, ServerResponse, createServer, OutgoingHttpHeaders, IncomingHttpHeaders } from 'http';
const logger = require('pino-http')();

const resHeaders: OutgoingHttpHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
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
    .sort() // Sort alphabetically
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

const generateHTML = (data: ReturnProps) => {
  const bgColor = process.env.BG_COLOR || '#ffffff';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Server Information</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: ${bgColor};
            color: #333;
            display: flex;
            justify-content: left;
            align-items: left;
            height: 100vh;
          }
          .container {
            background-color: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: left;
          }
          h1 {
            color: #333;
          }
          .info-item {
            margin: 10px 0;
            font-size: 1.1em;
          }
          .info-label {
            font-weight: bold;
            color: #555;
          }
          .info-value {
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Server Information</h1>
          <div class="info-item">
            <span class="info-label">Server Hostname:</span>
            <span class="info-value">${data.ServerHostname}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Server:</span>
            <span class="info-value">${data.Server}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Uptime:</span>
            <span class="info-value">${data.Uptime} seconds</span>
          </div>
          <div class="info-item">
            <span class="info-label">Path:</span>
            <span class="info-value">${data.Path || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Environment Variables:</span>
            <pre class="info-value">${JSON.stringify(data.Environment, null, 2)}</pre>
          </div>
        </div>
      </body>
    </html>
  `;
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  logger(req, res);
  const data = json(req);
  const htmlBody = generateHTML(data);
  generateResponse(res, 200, resHeaders, htmlBody);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 80;
server.listen(port, '0.0.0.0');
console.log(`Server running on port ${port}`);
