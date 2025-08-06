import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";

function Notification({ notification, onClose }) {
  if (!notification) return null;
  
  const getNotificationStyle = (severity) => {
    switch (severity) {
      case 'warning':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 border px-6 py-3 rounded shadow-lg z-50 flex items-center ${getNotificationStyle(notification.severity)}`}>
      <span className="mr-4">{notification.message}</span>
      <button onClick={onClose} className="ml-2 font-bold opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

export default function BabyMonitorDashboard() {
  const [data, setData] = useState({ temp: null, humidity: null, motion: 0 });
  const [notification, setNotification] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/data");
        const json = await res.json();
        setData(json.data || json);
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
    };

    const interval = setInterval(fetchData, 3000);
    fetchData();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    // Listen for real-time notifications
    newSocket.on('notification', (data) => {
      setNotification(data);
    });

    return () => newSocket.close();
  }, []);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const triggerNotification = async () => {
    // Simulate sending a notification request to backend
    try {
      const res = await fetch("http://localhost:3001/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Test notification from dashboard!" })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ message: json.data.message, severity: 'success' });
      } else {
        setNotification({ message: "Failed to send notification", severity: 'warning' });
      }
    } catch (err) {
      setNotification({ message: "Error sending notification", severity: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-pink-200 p-8 text-gray-800 font-sans">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <h1 className="text-4xl font-bold text-center mb-6 animate-bounce">
        👶 Baby Monitor Dashboard
      </h1>
      <div className="flex justify-center mb-6">
        <button
          onClick={triggerNotification}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow"
        >
          Trigger Test Notification
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Temperature */}
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-xl font-medium mb-2">🌡️ Temperature</p>
          <p className="text-3xl font-bold text-red-500">
            {data.temp !== null ? `${Number(data.temp).toFixed(2)}°C` : "Loading..."}
          </p>
        </motion.div>
        {/* Humidity */}
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-xl font-medium mb-2">💧 Humidity</p>
          <p className="text-3xl font-bold text-blue-500">
            {data.humidity !== null
              ? `${Number(data.humidity).toFixed(1)}%`
              : "Loading..."}
          </p>
        </motion.div>
        {/* Motion */}
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-6 text-center"
          animate={{
            scale: data.motion ? 1.1 : 1,
            backgroundColor: data.motion ? "#D1FAE5" : "#ffffff",
          }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl font-medium mb-2">👁️ Motion</p>
          <p
            className={`text-2xl font-bold ${
              data.motion ? "text-green-600" : "text-gray-400"
            }`}
          >
            {data.motion ? "👶 Movement!" : "No motion"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
