// ============================================================
// Sistem Sensor Keamanan - Office Lantai 1 (KHUSUS ESP32)
// Koneksi: MQTT via WiFi
// ============================================================

#include <WiFi.h>          // <-- Library khusus ESP32
#include <PubSubClient.h>

// ---- WiFi ----
const char* WIFI_SSID = "nama_wifi_kamu";
const char* WIFI_PASS = "password_wifi";

// ---- MQTT Broker ----
const char* MQTT_SERVER = "broker.hivemq.com";
const int   MQTT_PORT   = 1883;
const char* MQTT_CLIENT = "office_lantai1_esp32"; // Nama client disesuaikan

// ---- MQTT Topic ----
const char* TOPIC_PIR       = "office/lantai1/pir";
const char* TOPIC_REED      = "office/lantai1/reed";
const char* TOPIC_VIBRATION = "office/lantai1/vibration";
const char* TOPIC_PINTU     = "office/lantai1/pintu";

// ---- PIN UNTUK ESP32 ----
// Menggunakan GPIO yang aman (bebas dari bentrok sistem)
const int PIN_PIR       = 13; // GPIO 13
const int PIN_REED      = 14; // GPIO 14
const int PIN_VIBRATION = 27; // GPIO 27
const int PIN_RELAY     = 26; // GPIO 26

WiFiClient   espClient;
PubSubClient mqtt(espClient);

// ---- Variabel Timer Pintu ----
unsigned long waktuPintuTerbuka = 0;
bool pintuSedangTerbuka = false;
const unsigned long DURASI_BUKA_PINTU = 10000; // 10 detik

// ---- Variabel Status Terakhir (Untuk mencegah Spam MQTT) ----
int statusPIRTerakhir   = LOW;
int statusReedTerakhir  = LOW;
int statusGetarTerakhir = LOW;

// ============================================================
void setupWiFi() {
  Serial.print("Connecting ke WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

// ============================================================
void reconnectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Connecting ke MQTT...");
    if (mqtt.connect(MQTT_CLIENT)) {
      Serial.println("connected!");
    } else {
      Serial.print("gagal, rc=");
      Serial.print(mqtt.state());
      Serial.println(" coba lagi 3 detik...");
      delay(3000);
    }
  }
}

// ============================================================
void setup() {
  // ESP32 biasanya lebih stabil membaca serial di 115200
  Serial.begin(115200); 
  
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_REED, INPUT_PULLUP);
  pinMode(PIN_VIBRATION, INPUT);
  pinMode(PIN_RELAY, OUTPUT);
  
  digitalWrite(PIN_RELAY, LOW);

  setupWiFi();
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);

  Serial.println("\nSistem nyala (MODE ESP32). Pintu terkunci.");
}

// ============================================================
void loop() {
  if (!mqtt.connected()) {
    reconnectMQTT();
  }
  mqtt.loop();

  // ---- LOGIKA TUTUP PINTU OTOMATIS ----
  if (pintuSedangTerbuka && (millis() - waktuPintuTerbuka >= DURASI_BUKA_PINTU)) {
    digitalWrite(PIN_RELAY, LOW);
    pintuSedangTerbuka = false;
    
    Serial.println("[PINTU] Terkunci otomatis.");
    mqtt.publish(TOPIC_PINTU, "terkunci");
  }

  // ---- 1. CEK SENSOR PIR ----
  int bacaPIR = digitalRead(PIN_PIR);
  if (bacaPIR != statusPIRTerakhir) { 
    if (bacaPIR == HIGH) {
      Serial.println("[PIR] Ada pergerakan!");
      mqtt.publish(TOPIC_PIR, "ada_orang");
      
      if (!pintuSedangTerbuka) {
        digitalWrite(PIN_RELAY, HIGH);
        pintuSedangTerbuka = true;
        waktuPintuTerbuka = millis();
        Serial.println("[PINTU] Membuka kunci 10 detik...");
        mqtt.publish(TOPIC_PINTU, "terbuka");
      }
    } else {
      mqtt.publish(TOPIC_PIR, "tidak_ada");
    }
    statusPIRTerakhir = bacaPIR; 
  }

  // ---- 2. CEK REED SWITCH ----
  int bacaReed = digitalRead(PIN_REED);
  if (bacaReed != statusReedTerakhir) {
    if (bacaReed == HIGH) {
      Serial.println("[REED] Pintu dibuka fisik.");
      mqtt.publish(TOPIC_REED, "terbuka");
    } else {
      Serial.println("[REED] Pintu tertutup rapat.");
      mqtt.publish(TOPIC_REED, "tertutup");
    }
    statusReedTerakhir = bacaReed;
  }

  // ---- 3. CEK VIBRATION ----
  int bacaGetar = digitalRead(PIN_VIBRATION);
  if (bacaGetar != statusGetarTerakhir) {
    if (bacaGetar == HIGH) {
      Serial.println("!!! PERINGATAN - Getaran tidak normal !!!");
      mqtt.publish(TOPIC_VIBRATION, "PERINGATAN_GETARAN");
    } else {
      mqtt.publish(TOPIC_VIBRATION, "normal");
    }
    statusGetarTerakhir = bacaGetar;
  }
}