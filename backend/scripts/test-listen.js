const http = require('http');
const port = process.env.PORT || 3333;
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ok: true, port}));
});
server.listen(port, '0.0.0.0', () => {
  console.log(`test server listening on ${port}`);
});
server.on('error', (err) => {
  console.error('server error', err);
  process.exit(1);
});
