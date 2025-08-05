const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');

const app = express();
app.use(cors());

let latestData = { temp: null, humidity: null, motion: null };

const port = new SerialPort({ path: 'COM3', baudRate: 9600 }); // Adjust to your Arduino COM port
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', line => {
  try {
    const json = JSON.parse(line.trim());
    latestData = json;
    console.log('Received:', json);
  } catch (err) {
    console.error('Invalid JSON:', line);
  }
});

app.get('/data', (req, res) => {
  res.json(latestData);
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
