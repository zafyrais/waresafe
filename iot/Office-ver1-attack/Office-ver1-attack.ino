#include <WiFi.h>        
#include <PubSubClient.h>

const char* WIFI_SSID = "network";
const char* WIFI_PASS = "password";
const char* MQTT_SERVER = "broker.emqx.io";
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

unsigned long doorOpenedTime = 0;
bool doorIsOpen = false;
bool isCompromised = false; // Cyber state for Scenario 3

void setupWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
}

void reconnectMQTT() {
  while (!mqtt.connected()) {
    if (mqtt.connect(MQTT_CLIENT)) { Serial.println("Connected!"); } 
    else { delay(3000); }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_REED, INPUT_PULLUP);
  pinMode(PIN_VIBRATION, INPUT);
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);
  setupWiFi();
  mqtt.setServer(MQTT_SERVER, 1883);
  Serial.println("Commands: 1=Normal, R=Replay, C=Compromise/Silent, X=Reset");
}

void loop() {
  if (!mqtt.connected()) reconnectMQTT();
  mqtt.loop();

  if (doorIsOpen && (millis() - doorOpenedTime >= 10000)) {
    digitalWrite(PIN_RELAY, LOW); 
    doorIsOpen = false;
    mqtt.publish(TOPIC_DOOR, "locked");
  }

  if (Serial.available() > 0) {
    char input = Serial.read();

    // --- CYBER LOGIC: REPLAY ATTACK (Scenario 1) ---
    if (input == 'R') {
      Serial.println("[CYBER] Executing REPLAY: Sending Valid Access but NO Motion.");
      mqtt.publish(TOPIC_PIR, "no_motion"); // The anomaly
      mqtt.publish(TOPIC_DOOR, "unlocking");
      digitalWrite(PIN_RELAY, HIGH);
      doorIsOpen = true;
      doorOpenedTime = millis();
    }
    // --- CYBER LOGIC: COMPROMISED/SILENT (Scenario 3) ---
    else if (input == 'C') {
      isCompromised = true;
      Serial.println("[CYBER] SYSTEM COMPROMISED: Alerts will be silenced.");
    }
    else if (input == 'X') {
      isCompromised = false;
      Serial.println("[SYSTEM] Normal Mode Restored.");
    }
    // --- NORMAL SIMULATION ---
    else if (input == '1') {
      if (!isCompromised) {
        mqtt.publish(TOPIC_PIR, "motion_detected");
        mqtt.publish(TOPIC_DOOR, "unlocking");
      }
      digitalWrite(PIN_RELAY, HIGH);
      doorIsOpen = true;
      doorOpenedTime = millis();
    }
  }
}