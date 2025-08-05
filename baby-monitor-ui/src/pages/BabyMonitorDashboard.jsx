import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function BabyMonitorDashboard() {
  const [data, setData] = useState({ temp: null, humidity: null, motion: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
    };

    const interval = setInterval(fetchData, 3000);
    fetchData();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-100 to-pink-200 p-8 text-gray-800 font-sans">
      <h1 className="text-4xl font-bold text-center mb-6 animate-bounce">
        👶 Baby Monitor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Temperature */}
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-6 text-center"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-xl font-medium mb-2">🌡️ Temperature</p>
          <p className="text-3xl font-bold text-red-500">
            {data.temp !== null ? `${data.temp.toFixed(1)}°C` : "Loading..."}
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
              ? `${data.humidity.toFixed(1)}%`
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
