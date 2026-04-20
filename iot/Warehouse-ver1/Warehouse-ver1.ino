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
unsigned long doorTimer = 0;
bool isDoorUnlocked = false;


//alert control
void updatePhysicalAlert(String status) {
  if (status == "NORMAL") {
    digitalWrite(PIN_GREEN_LED, HIGH);
    digitalWrite(PIN_RED_LED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    Serial.println("[LCD DISPLAY] Condition: Normal Condition");
    mqtt.publish(TOPIC_ALARM, "Normal Condition");
  }
  else if (status == "DANGER") {
    digitalWrite(PIN_GREEN_LED, LOW);
    digitalWrite(PIN_RED_LED, HIGH);
    digitalWrite(PIN_BUZZER, HIGH); // Alarm sounds
    Serial.println("[LCD DISPLAY] Status: DANGER DETECTED!");
    mqtt.publish(TOPIC_ALARM, "Danger Detected");
  }
}


void setupWiFi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}


void reconnectMQTT() {
  while (!mqtt.connected()) {
    if (mqtt.connect("warehouse_floor2_client")) {
      Serial.println("MQTT Connected!");
      updatePhysicalAlert("NORMAL"); // Set initial state
    } else {
      delay(3000);
    }
  }
}


void setup() {
  Serial.begin(115200);
  pinMode(PIN_RED_LED, OUTPUT);
  pinMode(PIN_GREEN_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_RELAY, OUTPUT);
 
  setupWiFi();
  mqtt.setServer(MQTT_SERVER, 1883);
 
  Serial.println("\n--- WAREHOUSE AREA 2 SIMULATION ---");
  Serial.println("Press 'v' for Valid Card | 'a' for Anomaly/Resigned Card | 's' for Silent/Reset");
}


void loop() {
  if (!mqtt.connected()) reconnectMQTT();
  mqtt.loop();


  // ---- Condition 1: Auto-Lock Logic ----
  if (isDoorUnlocked && (millis() - doorTimer >= 10000)) {
    isDoorUnlocked = false;
    digitalWrite(PIN_RELAY, LOW); // Lock the door
    Serial.println("[SYSTEM] 10s passed. Door locked automatically.");
    mqtt.publish(TOPIC_DOOR, "locked");
  }


  // ---- Simulation Control via Serial Monitor ----
  if (Serial.available() > 0) {
    char input = Serial.read();


    // SCENARIO: VALID ACCESS
    if (input == 'v') {
      Serial.println("[RFID] Valid Card Detected.");
      updatePhysicalAlert("NORMAL"); // Ensure status is normal
     
      // Unlock Door
      digitalWrite(PIN_RELAY, HIGH);
      isDoorUnlocked = true;
      doorTimer = millis();
     
      mqtt.publish(TOPIC_ACCESS, "valid_card");
      mqtt.publish(TOPIC_DOOR, "unlocked");
      Serial.println("[ACTION] Door Reed/Relay Opened.");
    }
   
    // SCENARIO: ANOMALY DETECTED (Resigned Employee/Unauthorized)
    else if (input == 'a') {
      Serial.println("[RFID] ANOMALY DETECTED: Unauthorized Access Attempt!");
      updatePhysicalAlert("DANGER"); // Red LED, Buzzer ON, LCD Danger
     
      // Door remains locked
      digitalWrite(PIN_RELAY, LOW);
      isDoorUnlocked = false;
     
      mqtt.publish(TOPIC_ACCESS, "anomaly_detected");
      mqtt.publish(TOPIC_DOOR, "remains_locked");
      Serial.println("[SECURITY] Door remains LOCKED for safety.");
    }
   
    // RESET SYSTEM / SILENT ALARM
    else if (input == 's') {
      Serial.println("[SYSTEM] Security Alarm Reset.");
      updatePhysicalAlert("NORMAL");
    }
  }
}
