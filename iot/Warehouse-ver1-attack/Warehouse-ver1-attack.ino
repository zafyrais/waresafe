#include <WiFi.h>
#include <PubSubClient.h>


const char* WIFI_SSID = "network";
const char* WIFI_PASS = "password";
const char* MQTT_SERVER = "broker.emqx.io";


const char* TOPIC_ACCESS    = "warehouse/floor2/access";
const char* TOPIC_ALARM     = "warehouse/floor2/alarm";
const char* TOPIC_DOOR      = "warehouse/floor2/warehousedoor";


const int PIN_RED_LED    = 15;
const int PIN_GREEN_LED  = 2;
const int PIN_BUZZER     = 13;
const int PIN_RELAY      = 12;


WiFiClient espClient;
PubSubClient mqtt(espClient);
bool isDoorUnlocked = false;
bool alertBypass = false; // Cyber state for Scenario 3
unsigned long doorTimer = 0;

       
void updatePhysicalAlert(String status) {
  if (alertBypass) return; // If compromised, physical hardware stays silent
  
  if (status == "NORMAL") {
    digitalWrite(PIN_GREEN_LED, HIGH);
    digitalWrite(PIN_RED_LED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
  } else if (status == "DANGER") {
    digitalWrite(PIN_GREEN_LED, LOW);
    digitalWrite(PIN_RED_LED, HIGH);
    digitalWrite(PIN_BUZZER, HIGH);
    mqtt.publish(TOPIC_ALARM, "Danger Detected");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RED_LED, OUTPUT);
  pinMode(PIN_GREEN_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_RELAY, OUTPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  mqtt.setServer(MQTT_SERVER, 1883);
  Serial.println("Commands: v=Valid, a=Anomaly, F=False Alarm Flood, C=Bypass Alert");
}

void loop() {
  if (!mqtt.connected()) { mqtt.connect("warehouse_client"); }
  mqtt.loop();

  if (isDoorUnlocked && (millis() - doorTimer >= 10000)) {
    digitalWrite(PIN_RELAY, LOW);
    isDoorUnlocked = false;
    mqtt.publish(TOPIC_DOOR, "locked");
  }

  if (Serial.available() > 0) {
    char input = Serial.read();

    // --- CYBER LOGIC: FALSE ALARM FLOOD (Scenario 2) ---
    if (input == 'F') {
      Serial.println("[CYBER] Triggering FALSE ALARM flood...");
      for(int i=0; i<10; i++) {
        mqtt.publish(TOPIC_ALARM, "Danger Detected");
        delay(100);
      }
    }
    // --- CYBER LOGIC: COMPROMISED ALERT (Scenario 3) ---
    else if (input == 'C') {
      alertBypass = true;
      Serial.println("[CYBER] ALERT BYPASS ACTIVE: Hardware alerts disabled.");
    }
    // --- NORMAL SIMULATION ---
    else if (input == 'v') {
      updatePhysicalAlert("NORMAL");
      digitalWrite(PIN_RELAY, HIGH);
      isDoorUnlocked = true;
      doorTimer = millis();
      mqtt.publish(TOPIC_ACCESS, "valid_card");
    }
    else if (input == 'a') {
      updatePhysicalAlert("DANGER");
      mqtt.publish(TOPIC_ACCESS, "anomaly_detected");
    }
  }
}