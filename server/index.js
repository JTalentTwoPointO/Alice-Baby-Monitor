const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let latestData = {temp: null, humidity: null, motion: null};

// Enable mock mode if Arduino isn't available
const USE_MOCK = true; // Change to false when arduino is connected

if (!USE_MOCK){
  const { SerialPort} = require('serialport');
  const { ReadLineParser} = require('@serialport/parser-readline');

  const port = new SerialPort({path: 'COM3', baudRate: 9600});
  const pareser = port.pipe(new ReadLineParser({delimiter: '\n'}));

  parser.on('data', line => {
    try{
      const json = JSON.parse(line.trim());
      latestData = json;
      console.log('Received:', json);
    }catch(err){
      console.error('Invalid JSON:', line);  
    }
  });
} else {
  // Simulate sensor data every 2 seconds
  setInterval(() => {
    latestData = {
      temp: (20 + Math.random() * 10).toFixed(2),
      humidity: (40 + Math.random() * 20).toFixed(2),
      motion: Math.random() < 0.5 ? false: true,
    };
    console.log('Mock data:', latestData);
  }, 2000);
}

// Threshold configuration
const THRESHOLDS = {
  TEMP_HIGH: 0,    // °C - High temperature alert
  TEMP_LOW: 18,     // °C - Low temperature alert  
  HUMIDITY_HIGH: 0, // % - High humidity alert
  HUMIDITY_LOW: 30,  // % - Low humidity alert
  MOTION: 1         // Motion detected alert
};

// Function to check thresholds and trigger notifications
function checkThresholds(data) {
  const notifications = [];
  
  // Temperature checks
  if (data.temp !== null) {
    if (data.temp > THRESHOLDS.TEMP_HIGH) {
      notifications.push({
        type: 'temperature_high',
        message: `🌡️ High Temperature Alert: ${data.temp.toFixed(1)}°C`,
        severity: 'warning'
      });
    } else if (data.temp < THRESHOLDS.TEMP_LOW) {
      notifications.push({
        type: 'temperature_low', 
        message: `🌡️ Low Temperature Alert: ${data.temp.toFixed(1)}°C`,
        severity: 'warning'
      });
    }
  }
  
  // Humidity checks
  if (data.humidity !== null) {
    if (data.humidity > THRESHOLDS.HUMIDITY_HIGH) {
      notifications.push({
        type: 'humidity_high',
        message: `💧 High Humidity Alert: ${data.humidity.toFixed(1)}%`,
        severity: 'info'
      });
    } else if (data.humidity < THRESHOLDS.HUMIDITY_LOW) {
      notifications.push({
        type: 'humidity_low',
        message: `💧 Low Humidity Alert: ${data.humidity.toFixed(1)}%`,
        severity: 'info'
      });
    }
  }
  
  // Motion check
  if (data.motion === 1) {
    notifications.push({
      type: 'motion_detected',
      message: `👶 Baby Movement Detected!`,
      severity: 'success'
    });
  }
  
  return notifications;
}

app.get('/data', (req, res) => {
  // Check thresholds and emit notifications
  const notifications = checkThresholds(latestData);
  notifications.forEach(notification => {
    io.emit('notification', notification);
  });
  
  res.json({data:latestData});
});

// WebSocket setup for real-time notifications
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Notification trigger endpoint
app.post('/notify', (req,res) => {
  const {message} = req.body;
  console.log('Notification triggered:', message);
  
  // Emit notification to all connected clients
  io.emit('notification', { message, timestamp: new Date().toISOString() });
  
  res.json({success: true, message: 'Notification received', data: {message}});
});

server.listen(3001, () => console.log('Server running on http://localhost:3001'));