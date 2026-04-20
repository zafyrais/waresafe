#include <WiFi.h>       
#include <PubSubClient.h>

const char* WIFI_SSID = "network";
const char* WIFI_PASS = "password";

const char* MQTT_SERVER = "broker.emqx.io";
const int   MQTT_PORT   = 1883;
const char* MQTT_CLIENT = "office_floor1";

const char* TOPIC_PIR       = "office/floor1/pir";
const char* TOPIC_REED      = "office/floor1/reed";
const char* TOPIC_VIBRATION = "office/floor1/vibration";
const char* TOPIC_DOOR      = "office/floor1/maindoor";

const int PIN_PIR       = 13; 
const int PIN_REED      = 14; 
const int PIN_VIBRATION = 27; 
const int PIN_RELAY     = 26; 

WiFiClient   espClient;
PubSubClient mqtt(espClient);

// ---- Variabel Timer MainDoor ----
unsigned long doorOpenedTime = 0;
bool doorIsOpen = false;
const unsigned long DOOR_OPEN_DURATION = 10000; // 10 detik

// ---- Variabel Status Terakhir (Untuk mencegah Spam MQTT) ----
int lastPIRStatus   = LOW;
int lastReeDStatus  = LOW;
int lastVibrationStatus = LOW;

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
      Serial.print("failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" retry in 3 seconds...");
      delay(3000);
    }
  }
}

// ============================================================
void setup() {
  Serial.begin(115200);
 
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_REED, INPUT_PULLUP);
  pinMode(PIN_VIBRATION, INPUT);
  pinMode(PIN_RELAY, OUTPUT);
 
  digitalWrite(PIN_RELAY, LOW);

  setupWiFi();
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);

  Serial.println("\nSystem started (ESP32 MODE). Door locked.");
}

// =========================================================
void loop() {
  if (!mqtt.connected()) {
    reconnectMQTT();
  }
  mqtt.loop();

  // ---- LOGIKA RELASI 1: PIR & DOOR REED (AUTO-CLOSE) ----
  if (doorIsOpen && (millis() - doorOpenedTime >= DOOR_OPEN_DURATION)) {
    digitalWrite(PIN_RELAY, LOW); 
    doorIsOpen = false;
   
    Serial.println("[SYSTEM] 10 second passed, door locked again.");
    mqtt.publish(TOPIC_DOOR, "locked");
    mqtt.publish(TOPIC_PIR, "no_motion");
    mqtt.publish(TOPIC_REED, "closed"); 
  }

  // ---- MODE SIMULASI KEYBOARD ----
  if (Serial.available() > 0) {
    char input = Serial.read();

    // KONDISI 1: Karyawan Datang (PIR mendeteksi orang)
    if (input == '1') {
      Serial.println("[EVENT] Employee detected by PIR (Distance < 5m)");
      mqtt.publish(TOPIC_PIR, "motion_detected");
     
      // Menggerakkan Relay untuk buka kunci
      digitalWrite(PIN_RELAY, HIGH);
      doorIsOpen = true;
      doorOpenedTime = millis();
     
      Serial.println("[ACTION] Unlocking door...");
      mqtt.publish(TOPIC_DOOR, "unlocking");
      mqtt.publish(TOPIC_REED, "open"); //pintu terbuka
    }

    // KONDISI 2: Vibration (Gempa/Anomali)
    else if (input == '2') {
      Serial.println("[EVENT] Abnormal vibration detected!");
      mqtt.publish(TOPIC_VIBRATION, "abnormal vibration detected");
    }

    // KONDISI NORMAL (Standby)
    else if (input == '0') {
      Serial.println("[SYSTEM] back to normal condition");
      mqtt.publish(TOPIC_VIBRATION, "normal");
    }

    // KONDISI 3: Simulated Attack (Unauthorized Access)
    else if (input == '9') {
      Serial.println("[ATTACK] Unauthorized unlock attempt!");

      // attacker tries to unlock door
      digitalWrite(PIN_RELAY, HIGH);
      doorIsOpen = true;
      doorOpenedTime = millis();

      mqtt.publish(TOPIC_DOOR, "forced_unlock");
    }
  }
}
