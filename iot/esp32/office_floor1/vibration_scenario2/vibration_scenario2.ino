#include <WiFi.h>
#include <PubSubClient.h>

#define PIN_VIBRATION 27
#define PIN_BUZZER 26

const char* WIFI_SSID = "Redmi Note 11";
const char* WIFI_PASS = "1234567890";

const char* MQTT_SERVER = "broker.emqx.io";
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT = "office_floor1";

// MQTT Topics Area A / Office
const char* TOPIC_VIBRATION = "office/floor1/vibration";
const char* TOPIC_BUZZER_A = "office/floor1/buzzer";
const char* TOPIC_SYSTEM = "office/floor1/system";
const char* TOPIC_SECURITY = "office/floor1/security";

WiFiClient espClient;
PubSubClient mqtt(espClient);

const int vibrationThreshold = 8;           // danger jika getaran terdeteksi 8 kali
const unsigned long timeWindow = 5000;      // dalam window 5 detik
const unsigned long cooldownTime = 10000;   // cooldown 10 detik setelah danger

int vibrationCount = 0;

unsigned long windowStartTime = 0;
unsigned long lastAlertTime = 0;

bool inCooldown = false;
bool manualAlertMode = false;

void setupWiFi() {
  delay(10);

  Serial.println();
  Serial.print("[WIFI] Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("[WIFI] Connected");
  Serial.print("[WIFI] IP Address: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("[MQTT] Connecting as ");
    Serial.println(MQTT_CLIENT);

    if (mqtt.connect(MQTT_CLIENT)) {
      Serial.println("[MQTT] Connected");

      publishEvent(TOPIC_SYSTEM, "office_floor1_online");
      publishEvent(TOPIC_SECURITY, "office_vibration_security_active");
    } else {
      Serial.print("[MQTT] Failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" retrying in 3 seconds");

      delay(3000);
    }
  }
}

void publishEvent(const char* topic, const char* message) {
  mqtt.publish(topic, message);

  Serial.print("[MQTT] ");
  Serial.print(topic);
  Serial.print(" => ");
  Serial.println(message);
}

void triggerManualAbnormalVibration() {
  manualAlertMode = true;

  Serial.println("[SYSTEM] Abnormal vibration event triggered.");
  Serial.println("[SECURITY] Vibration data anomaly detected.");

  publishEvent(TOPIC_VIBRATION, "abnormal_vibration_detected");
  publishEvent(TOPIC_SECURITY, "vibration_data_anomaly_detected");
  publishEvent(TOPIC_SYSTEM, "manual_abnormal_vibration_triggered");

  triggerVibrationAlert();
}

void restoreNormalMode() {
  Serial.println("[SYSTEM] Normal Mode Restored.");

  manualAlertMode = false;
  inCooldown = false;
  vibrationCount = 0;
  windowStartTime = millis();

  noTone(PIN_BUZZER);

  publishEvent(TOPIC_VIBRATION, "normal");
  publishEvent(TOPIC_BUZZER_A, "buzzer_off");
  publishEvent(TOPIC_SYSTEM, "normal_mode_restored");
  publishEvent(TOPIC_SECURITY, "office_vibration_security_active");
}

void handleSerialCommand() {
  if (Serial.available() > 0) {
    char input = Serial.read();

    if (input == '\n' || input == '\r') {
      return;
    }

    if (input == 'V' || input == 'v') {
      triggerManualAbnormalVibration();
    }
    else if (input == 'X' || input == 'x') {
      restoreNormalMode();
    }
    else {
      Serial.println("[SYSTEM] Unknown command.");
      Serial.println("Available commands:");
      Serial.println("V = Trigger abnormal vibration");
      Serial.println("X = Restore Normal Mode");
    }
  }
}

void handleVibrationSensor() {
  unsigned long currentTime = millis();

  if (inCooldown) {
    if (currentTime - lastAlertTime >= cooldownTime) {
      inCooldown = false;
      vibrationCount = 0;
      windowStartTime = currentTime;

      noTone(PIN_BUZZER);

      Serial.println("[SYSTEM] Cooldown finished. Sensor active again.");

      publishEvent(TOPIC_SYSTEM, "cooldown_finished");
      publishEvent(TOPIC_VIBRATION, "normal");
      publishEvent(TOPIC_BUZZER_A, "buzzer_off");
    }

    return;
  }

  if (currentTime - windowStartTime > timeWindow) {
    vibrationCount = 0;
    windowStartTime = currentTime;

    Serial.println("[SYSTEM] Detection window reset.");
  }

  int vibrationState = digitalRead(PIN_VIBRATION);

  if (vibrationState == HIGH) {
    vibrationCount++;

    Serial.print("[VIBRATION] Detected. Count: ");
    Serial.println(vibrationCount);

    String vibrationMessage = "detected_count_" + String(vibrationCount);
    publishEvent(TOPIC_VIBRATION, vibrationMessage.c_str());

    delay(300);
  }

  if (vibrationCount >= vibrationThreshold) {
    triggerVibrationAlert();
  }
}

void triggerVibrationAlert() {
  Serial.println("[ALERT] Danger vibration detected.");

  publishEvent(TOPIC_VIBRATION, "danger_vibration_detected");
  publishEvent(TOPIC_SECURITY, "danger_vibration_alert");
  publishEvent(TOPIC_SYSTEM, "area_a_danger_triggered");

  tone(PIN_BUZZER, 2000);
  publishEvent(TOPIC_BUZZER_A, "buzzer_on");

  lastAlertTime = millis();
  inCooldown = true;
}

void setup() {
  Serial.begin(115200);

  pinMode(PIN_VIBRATION, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  noTone(PIN_BUZZER);

  windowStartTime = millis();

  Serial.println("WareSafe Area A - Office");
  Serial.println("Vibration + Buzzer + MQTT");
  Serial.println("Available commands:");
  Serial.println("V = Trigger abnormal vibration");
  Serial.println("X = Restore Normal Mode");

  setupWiFi();

  mqtt.setServer(MQTT_SERVER, MQTT_PORT);

  reconnectMQTT();

  publishEvent(TOPIC_SYSTEM, "system_started");
  publishEvent(TOPIC_VIBRATION, "normal");
  publishEvent(TOPIC_BUZZER_A, "buzzer_off");
  publishEvent(TOPIC_SECURITY, "office_vibration_security_active");
}

void loop() {
  if (!mqtt.connected()) {
    reconnectMQTT();
  }

  mqtt.loop();

  handleSerialCommand();

  if (!manualAlertMode) {
    handleVibrationSensor();
  }

  delay(50);
}