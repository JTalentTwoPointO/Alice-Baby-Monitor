// Baby Monitor Test Code for Arduino Nano (Freenove Control Board V4.1)
// DHT22 Temperature/Humidity + PIR Motion Sensor

#include <Arduino.h>
#include <DHT.h>

// Pin definitions
#define DHT_PIN 2         // DHT22 data pin
#define PIR_PIN 7         // PIR motion sensor pin
#define LED_PIN 13        // Built-in LED (Arduino Nano)

// DHT sensor setup
#define DHT_TYPE DHT22    // DHT22 (AM2302)
DHT dht(DHT_PIN, DHT_TYPE);

#define TEST_DHT_ONLY 0
#define PIR_ONLY 0

#if TEST_DHT_ONLY

void setup() {
  Serial.begin(9600);
  dht.begin();
  delay(3000);
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  
  Serial.print("Temp: ");
  Serial.print(t);
  Serial.print(" | Humidity: ");
  Serial.println(h);
  
  delay(5000);
}
#elif PIR_ONLY

void setup(){
  Serial.begin(9600);
  pinMode(PIR_PIN, INPUT);
  Serial.println("Motion Sensor Test Ready");
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  if (motion == HIGH){
    Serial.println("Motion Detected!");
  }
  else{
    Serial.println("No motion.");
  }
  delay(1000);
}

#else 
// Variable declarations (these were missing in your original code)
float temperature;
float humidity;
int motionState;
int lastMotionState = 0;

// Baby monitor thresholds
float tempLow = 18.0;     // Minimum safe temperature
float tempHigh = 26.0;    // Maximum safe temperature
float humidityLow = 30.0; // Minimum humidity
float humidityHigh = 70.0; // Maximum humidity

void setup() {
  // Initialize serial communication
  Serial.begin(9600);     // Arduino Nano standard baud rate
  delay(3000);
  
  Serial.println("=== Baby Monitor System ===");
  Serial.println("DHT22 + PIR Motion Sensor");
  Serial.println("Board: Arduino Nano (ATMEGA328P)");
  Serial.println("Initializing sensors...");
  
  // Initialize DHT sensor
  dht.begin();
  
  // Configure pins
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Turn off LED initially
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("✓ Sensors initialized successfully!");
  Serial.println("✓ Monitoring baby's room...");
  Serial.println("Temperature range: " + String(tempLow) + "°C - " + String(tempHigh) + "°C");
  Serial.println("Humidity range: " + String(humidityLow) + "% - " + String(humidityHigh) + "%");
  Serial.println("----------------------------------------");
  
  delay(2000);
}

void loop() {
  // Read temperature and humidity from DHT22
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  // Read motion sensor
  motionState = digitalRead(PIR_PIN);
  
  // Debug: Print raw values
  Serial.print("Raw temp: ");
  Serial.print(temperature);
  Serial.print(" | Raw humidity: ");
  Serial.println(humidity);
  
  // Check if DHT readings are valid (including reasonable range check)
  // if (isnan(temperature) || isnan(humidity) || temperature > 100 || temperature < -40 || humidity > 100 || humidity < 0) {
  //   Serial.println("❌ ERROR: Invalid DHT22 readings!");
  //   Serial.println("   Possible causes:");
  //   Serial.println("   - Missing 10kΩ pull-up resistor on data pin");
  //   Serial.println("   - Loose connections");
  //   Serial.println("   - Faulty sensor");
  //   Serial.println("   - Insufficient power supply");
  // } else {
    // Display current readings
    Serial.print("🌡️  Temp: ");
    Serial.print(temperature, 1);
    Serial.print("°C | 💧 Humidity: ");
    Serial.print(humidity, 1);
    Serial.print("% | 👁️  Motion: ");
    Serial.println(motionState ? "DETECTED" : "None");

    // ✅ Send JSON for Node server
    Serial.print("{\"temp\":");
    Serial.print(temperature, 1);
    Serial.print(",\"humidity\":");
    Serial.print(humidity, 1);
    Serial.print(",\"motion\":");
    Serial.print(motionState);
    Serial.println("}");

    
    // Check temperature alerts
    if (temperature < tempLow) {
      Serial.println("🚨 ALERT: Room too cold! (" + String(temperature) + "°C)");
    } else if (temperature > tempHigh) {
      Serial.println("🚨 ALERT: Room too hot! (" + String(temperature) + "°C)");
    }
    
    // Check humidity alerts
    if (humidity < humidityLow) {
      Serial.println("🚨 ALERT: Air too dry! (" + String(humidity) + "%)");
    } else if (humidity > humidityHigh) {
      Serial.println("🚨 ALERT: Air too humid! (" + String(humidity) + "%)");
    }
  // }
  
  // Handle motion detection
  if (motionState != lastMotionState) {
    if (motionState) {
      Serial.println("👶 MOTION DETECTED - Baby is moving!");
      digitalWrite(LED_PIN, HIGH);
    } else {
      Serial.println("😴 Motion stopped - Baby settled");
      digitalWrite(LED_PIN, LOW);
    }
    lastMotionState = motionState;
  }
  
  Serial.println(""); // Empty line for readability
  delay(5000); // Read every 5 seconds (DHT22 needs time between reads)
}

#endif