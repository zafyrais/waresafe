#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define PIN_LED_GREEN 25
#define PIN_LED_YELLOW 26
#define PIN_LED_RED 27
#define PIN_BUZZER 14

#define PIN_SDA 21
#define PIN_SCL 22

LiquidCrystal_I2C lcd(0x27, 16, 2);

const char* WIFI_SSID = "Redmi Note 11";
const char* WIFI_PASS = "1234567890";

const char* MQTT_SERVER = "broker.emqx.io";
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT = "warehouse_floor2";

// MQTT Topics Area B / Warehouse
const char* TOPIC_SYSTEM = "warehouse/floor2/system";
const char* TOPIC_ATTACK = "warehouse/floor2/attack";
const char* TOPIC_SECURITY = "warehouse/floor2/security";
const char* TOPIC_ALARM = "warehouse/floor2/alarm";

WiFiClient espClient;
PubSubClient mqtt(espClient);

enum Mode {
  NORMAL,
  WARNING,
  DANGER
};

Mode currentMode = NORMAL;

unsigned long previousMillis = 0;
bool outputState = false;

const unsigned long WARNING_INTERVAL = 700;
const unsigned long DANGER_INTERVAL = 200;

bool alertBypass = false;

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

void publishEvent(const char* topic, const char* message) {
  mqtt.publish(topic, message);

  Serial.print("[MQTT] ");
  Serial.print(topic);
  Serial.print(" => ");
  Serial.println(message);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";

  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  message.trim();
  message.toLowerCase();

  Serial.print("[MQTT] Message arrived on topic: ");
  Serial.println(topic);
  Serial.print("[MQTT] Payload: ");
  Serial.println(message);

  if (String(topic) == TOPIC_ATTACK) {
    if (message == "false_alarm_flood" || message == "scenario_3" || message == "f") {
      runFalseAlarmFloodScenario3();
    }
    else if (message == "security_suppression" || message == "alert_bypass" || message == "scenario_4" || message == "c") {
      activateSecuritySuppressionScenario4();
    }
    else if (message == "reset" || message == "x") {
      restoreNormalMode();
    }
    else if (message == "normal_simulation" || message == "v") {
      runNormalSimulation();
    }
    else if (message == "normal" || message == "n") {
      activateNormal();
    }
    else if (message == "warning" || message == "w") {
      activateWarning();
    }
    else if (message == "danger" || message == "d") {
      activateDanger();
    }
  }
}

void reconnectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("[MQTT] Connecting as ");
    Serial.println(MQTT_CLIENT);

    if (mqtt.connect(MQTT_CLIENT)) {
      Serial.println("[MQTT] Connected");

      publishEvent(TOPIC_SYSTEM, "warehouse_floor2_online");
      publishEvent(TOPIC_SECURITY, "warehouse_alert_module_active");

      mqtt.subscribe(TOPIC_ATTACK);

      Serial.println("[MQTT] Subscribed to:");
      Serial.println(TOPIC_ATTACK);
    } else {
      Serial.print("[MQTT] Failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" retrying in 3 seconds");

      delay(3000);
    }
  }
}

void showLCD(String line1, String line2) {
  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print(line1);

  lcd.setCursor(0, 1);
  lcd.print(line2);
}

void activateNormal() {
  currentMode = NORMAL;
  alertBypass = false;

  Serial.println("[MODE] NORMAL");

  setNormal();
  showLCD("Mode: NORMAL", "Status: Aman");

  publishEvent(TOPIC_ALARM, "normal");
  publishEvent(TOPIC_SYSTEM, "warehouse_alarm_mode_normal");
}

void activateWarning() {
  if (alertBypass) {
    suppressPhysicalAlert();
    publishEvent(TOPIC_SECURITY, "warning_suppressed_by_alert_bypass");
    return;
  }

  currentMode = WARNING;

  Serial.println("[MODE] WARNING");

  resetBlink();
  showLCD("Mode: WARNING", "Hati-hati");

  publishEvent(TOPIC_ALARM, "warning");
  publishEvent(TOPIC_SECURITY, "warehouse_warning_mode_activated");
}

void activateDanger() {
  if (alertBypass) {
    suppressPhysicalAlert();
    publishEvent(TOPIC_SECURITY, "danger_suppressed_by_alert_bypass");
    return;
  }

  currentMode = DANGER;

  Serial.println("[MODE] DANGER");

  resetBlink();
  showLCD("Mode: DANGER", "Status: Bahaya");

  publishEvent(TOPIC_ALARM, "danger");
  publishEvent(TOPIC_SECURITY, "warehouse_danger_mode_activated");
}

void setNormal() {
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);

  noTone(PIN_BUZZER);
  digitalWrite(PIN_BUZZER, LOW);
}

void resetBlink() {
  previousMillis = millis();
  outputState = false;

  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);

  noTone(PIN_BUZZER);
  digitalWrite(PIN_BUZZER, LOW);
}

void warningMode() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= WARNING_INTERVAL) {
    previousMillis = currentMillis;
    outputState = !outputState;

    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, outputState ? HIGH : LOW);
    digitalWrite(PIN_LED_RED, LOW);

    if (outputState) {
      tone(PIN_BUZZER, 1000);
    } else {
      noTone(PIN_BUZZER);
    }
  }
}

void dangerMode() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= DANGER_INTERVAL) {
    previousMillis = currentMillis;
    outputState = !outputState;

    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, outputState ? HIGH : LOW);

    if (outputState) {
      tone(PIN_BUZZER, 2000);
    } else {
      noTone(PIN_BUZZER);
    }
  }
}

void suppressPhysicalAlert() {
  currentMode = NORMAL;

  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);

  noTone(PIN_BUZZER);
  digitalWrite(PIN_BUZZER, LOW);

  showLCD("WARESAFE SYSTEM", "Normal Condition");

  Serial.println("[CYBER] Security suppression active. Physical alert suppressed.");
}

void runFalseAlarmFloodScenario3() {
  alertBypass = false;

  Serial.println("[CYBER LOGIC] FALSE ALARM FLOOD / DoS - Scenario 3 Activated.");
  Serial.println("[ATTACK] Sending repeated false danger alarms.");

  publishEvent(TOPIC_ATTACK, "scenario_3_false_alarm_flood_started");

  for (int i = 0; i < 10; i++) {
    Serial.print("[ATTACK] False alarm flood packet ");
    Serial.println(i + 1);

    publishEvent(TOPIC_ALARM, "danger");
    publishEvent(TOPIC_SECURITY, "false_alarm_flood_packet");

    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, HIGH);

    tone(PIN_BUZZER, 2000);
    showLCD("FALSE ALARM", "FLOOD ATTACK");

    delay(200);

    digitalWrite(PIN_LED_RED, LOW);
    noTone(PIN_BUZZER);

    delay(200);
  }

  publishEvent(TOPIC_ATTACK, "scenario_3_false_alarm_flood_finished");

  delay(1000);
  activateNormal();
}

void activateSecuritySuppressionScenario4() {
  Serial.println("[CYBER LOGIC] SECURITY SUPPRESSION / ALERT BYPASS - Scenario 4 Activated.");
  Serial.println("[ATTACK] Alarm, buzzer, red LED, and warning display are suppressed.");

  alertBypass = true;

  suppressPhysicalAlert();

  publishEvent(TOPIC_ATTACK, "scenario_4_security_suppression_active");
  publishEvent(TOPIC_SECURITY, "alert_system_suppressed");
  publishEvent(TOPIC_ALARM, "fake_normal_condition");
}

void restoreNormalMode() {
  Serial.println("[SYSTEM] Normal Mode Restored.");

  alertBypass = false;

  currentMode = NORMAL;
  setNormal();
  showLCD("Mode: NORMAL", "Status: Aman");

  publishEvent(TOPIC_ATTACK, "attack_simulation_reset");
  publishEvent(TOPIC_SYSTEM, "normal_mode_restored");
  publishEvent(TOPIC_ALARM, "normal");
}

void runNormalSimulation() {
  Serial.println("[NORMAL SIMULATION] Warehouse alert module normal condition.");

  alertBypass = false;

  currentMode = NORMAL;
  setNormal();
  showLCD("WARESAFE SYSTEM", "Normal Condition");

  publishEvent(TOPIC_SYSTEM, "normal_simulation_area_b");
  publishEvent(TOPIC_ALARM, "normal");
  publishEvent(TOPIC_SECURITY, "warehouse_normal_condition");
}

void handleSerialCommand() {
  if (Serial.available() > 0) {
    char input = Serial.read();

    if (input == '\n' || input == '\r') {
      return;
    }

    if (input == 'F' || input == 'f') {
      runFalseAlarmFloodScenario3();
    }
    else if (input == 'C' || input == 'c') {
      activateSecuritySuppressionScenario4();
    }
    else if (input == 'X' || input == 'x') {
      restoreNormalMode();
    }
    else if (input == 'v') {
      runNormalSimulation();
    }
    else if (input == 'n' || input == 'N') {
      activateNormal();
    }
    else if (input == 'w' || input == 'W') {
      activateWarning();
    }
    else if (input == 'd' || input == 'D') {
      activateDanger();
    }
    else {
      Serial.println("[SYSTEM] Unknown command.");
      Serial.println("Available commands:");
      Serial.println("F = False Alarm Flood / DoS Scenario 3");
      Serial.println("C = Security Suppression / Alert Bypass Scenario 4");
      Serial.println("X = Restore Normal Mode");
      Serial.println("v = Normal Simulation");
      Serial.println("n = Manual NORMAL");
      Serial.println("w = Manual WARNING");
      Serial.println("d = Manual DANGER");
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  Wire.begin(PIN_SDA, PIN_SCL);

  lcd.init();
  lcd.backlight();

  Serial.println("WareSafe Area B - Warehouse");
  Serial.println("Alert Module + MQTT + Attack Simulation");
  Serial.println("Available commands:");
  Serial.println("F = False Alarm Flood / DoS Scenario 3");
  Serial.println("C = Security Suppression / Alert Bypass Scenario 4");
  Serial.println("X = Restore Normal Mode");
  Serial.println("v = Normal Simulation");
  Serial.println("n = Manual NORMAL");
  Serial.println("w = Manual WARNING");
  Serial.println("d = Manual DANGER");

  setupWiFi();

  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);

  reconnectMQTT();

  restoreNormalMode();
}

void loop() {
  if (!mqtt.connected()) {
    reconnectMQTT();
  }

  mqtt.loop();

  handleSerialCommand();

  if (!alertBypass) {
    if (currentMode == NORMAL) {
      setNormal();
    }
    else if (currentMode == WARNING) {
      warningMode();
    }
    else if (currentMode == DANGER) {
      dangerMode();
    }
  } else {
    suppressPhysicalAlert();
  }

  delay(50);
}