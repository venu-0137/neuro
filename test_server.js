const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test Server OK\n');
});
server.listen(5173, '127.0.0.1', () => {
    console.log('Server running at http://127.0.0.1:5173/');
});
setTimeout(() => process.exit(0), 10000);
