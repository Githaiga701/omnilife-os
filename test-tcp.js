const net = require('net');

const host = 'aws-0-eu-west-1.pooler.supabase.com';

function checkPort(port) {
  return new Promise((resolve) => {
    console.log(`Checking TCP connection to ${host}:${port}...`);
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log(`Successfully connected to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`Connection to ${host}:${port} timed out (5s)`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`Connection to ${host}:${port} failed with error: ${err.message}`);
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function run() {
  await checkPort(6543);
  await checkPort(5432);
}

run();
