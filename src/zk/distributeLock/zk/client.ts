const { spawn, exec } = require('child_process');
const path = require('path');


const consume = path.resolve(__dirname, "consumeLock.ts");


for (let i = 0; i < 3; i++) {
  const ps = spawn('ts-node', [consume]);
  ps.stdout.on('data', (data) => {
    console.log(data.toString());
  });

}
