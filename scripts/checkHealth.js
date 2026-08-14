const http = require('http');

http.get('http://localhost:5000/api/health', res => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('BODY', body));
}).on('error', err => {
  console.error('ERR', err && err.message);
  process.exit(1);
});
