# mqtt_subscriber.py

import json
import pymysql
import paho.mqtt.client as mqtt
from datetime import datetime

MQTT_SERVER = "broker.emqx.io"
MQTT_PORT = 1883

TOPICS = [
     # OFFICE
    ("office/floor1/system", 0),
    ("office/floor1/security", 0),
    ("office/floor1/attack", 0),
    ("office/floor1/IRsensor", 0),
    ("office/floor1/reedA", 0),
    ("office/floor1/maindoor", 0),
    ("office/floor1/vibration", 0),
    ("office/floor1/buzzerA", 0),

    # WAREHOUSE
    ("warehouse/floor2/system", 0),
    ("warehouse/floor2/security", 0),
    ("warehouse/floor2/attack", 0),
    ("warehouse/floor2/access", 0),
    ("warehouse/floor2/reedB", 0),
    ("warehouse/floor2/warehousedoor", 0),
    ("warehouse/floor2/ledlight", 0),
    ("warehouse/floor2/buzzerB", 0),
    ("warehouse/floor2/displaytext", 0),
    ("warehouse/floor2/alarm", 0),
]

DB_HOST = "127.0.0.1"
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "waresafe_db"

SENSOR_ID_IR = 1
SENSOR_ID_REED = 2
SENSOR_ID_VIBRATION = 3
SENSOR_ID_BUZZER_A = 4
SENSOR_ID_RFID = 5
SENSOR_ID_REED_B = 6
SENSOR_ID_LED_GREEN = 7
SENSOR_ID_LED_YELLOW = 8
SENSOR_ID_LED_RED = 9
SENSOR_ID_BUZZER_B = 10
SENSOR_ID_LCD = 11


ATTACK_ID_SCENARIO_1 = 1
ATTACK_ID_SCENARIO_2 = 2
ATTACK_ID_SCENARIO_3 = 3
ATTACK_ID_SCENARIO_4 = 4

def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )


def insert_sensor_data(sensor_id, value):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO sensor_data (sensor_id, value, timestamp)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, (
                sensor_id,
                value,
                datetime.now()
            ))

        connection.commit()

    except Exception as e: 
        print("[DB ERROR SENSOR]", e)

    finally:
        connection.close()


def insert_alert(sensor_id, attack_id, alert_type):
    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO alerts (sensor_id, attack_id, alert_type, timestamp)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (
                sensor_id,
                attack_id,
                alert_type,
                datetime.now()
            ))

        connection.commit()

    except Exception as e: 
        print("[DB ERROR ALERT]", e)

    finally:
        connection.close()


def on_connect(client, userdata, flags, rc):
    print("[MQTT] Connected with result code:", rc)

    for topic in TOPICS:
        client.subscribe(topic)
        print("[MQTT] Subscribed to:", topic[0])


def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()

    print(f"[MQTT] {topic} => {payload}")
    
    if topic == "office/floor1/IRsensor":
        insert_sensor_data(SENSOR_ID_IR, payload)

    elif topic == "office/floor1/reedA": 
        insert_sensor_data(SENSOR_ID_REED, payload)

    elif topic == "office/floor1/maindoor": 
        insert_sensor_data(SENSOR_ID_REED, f"door_{payload.lower()}")

    elif topic == "office/floor1/vibration": 
        insert_sensor_data(SENSOR_ID_VIBRATION, payload)

        if payload in [ 
            "ABNORMAL VIBRATION", 
            "danger_vibration_detected", 
            "abnormal_vibration_detected" 
        ]: 
            insert_alert( 
                SENSOR_ID_VIBRATION, 
                ATTACK_ID_SCENARIO_2, 
                payload 
            )

    elif topic == "office/floor1/buzzerA": 
        insert_sensor_data(SENSOR_ID_BUZZER_A, payload)

    elif topic == "office/floor1/security": 
        if payload in [
            "SCENARIO_1_DETECTED",
            "DOOR OPEN WARNING"
        ]:
            insert_alert(
                SENSOR_ID_IR,
                ATTACK_ID_SCENARIO_1,
                payload
            )

        elif payload in [
            "SCENARIO_2_DETECTED",
            "FALSE_VIBRATION_INJECTION",
            "DANGER ACTIVE",
            "DANGER CONDITION"
        ]:
            insert_alert(
                SENSOR_ID_VIBRATION,
                ATTACK_ID_SCENARIO_2,
                payload
            )

    elif topic == "office/floor1/attack": 
        if "SCENARIO_1" in payload: 
            insert_alert( 
                SENSOR_ID_IR, 
                ATTACK_ID_SCENARIO_1, 
                payload 
            ) 
            
        elif "SCENARIO_2" in payload: 
            insert_alert( 
                SENSOR_ID_VIBRATION, 
                ATTACK_ID_SCENARIO_2, 
                payload 
            )

    elif topic == "office/floor1/system": 
        if "SCENARIO_1" in payload: 
            insert_alert( 
                SENSOR_ID_IR, 
                ATTACK_ID_SCENARIO_1, 
                payload 
            ) 
            
        elif "SCENARIO_2" in payload: 
            insert_alert( 
                SENSOR_ID_VIBRATION, 
                ATTACK_ID_SCENARIO_2, 
                payload 
            )
# Wwarehouse
    elif topic == "warehouse/floor2/access":
        insert_sensor_data(
            SENSOR_ID_RFID,
            payload
        )

    elif topic == "warehouse/floor2/reedB":
        insert_sensor_data(
            SENSOR_ID_REED_B,
            payload
        )

    elif topic == "warehouse/floor2/warehousedoor":
        insert_sensor_data(
            SENSOR_ID_REED_B,
            f"door_{payload.lower()}"
        )
        
    elif topic == "warehouse/floor2/ledlight":
        if "GREEN" in payload.upper():
            insert_sensor_data(
                SENSOR_ID_LED_GREEN,
                payload
            )

        elif "YELLOW" in payload.upper():
            insert_sensor_data(
                SENSOR_ID_LED_YELLOW,
                payload
            )

        elif "RED" in payload.upper():
            insert_sensor_data(
                SENSOR_ID_LED_RED,
                payload
            )

    elif topic == "warehouse/floor2/buzzerB":
        insert_sensor_data(
            SENSOR_ID_BUZZER_B,
            payload
        )

    elif topic == "warehouse/floor2/displaytext":
        insert_sensor_data(
            SENSOR_ID_LCD,
            payload
        )

    elif topic == "warehouse/floor2/alarm":

    # Attack Scenario 3
        if (
            "FLOODING" in payload.upper()
            or "SCENARIO 3" in payload.upper()
        ):

            insert_alert(
                SENSOR_ID_BUZZER_B,
                ATTACK_ID_SCENARIO_3,
                payload
            )

        # Attack Scenario 4
        elif (
            "SUPPRESSION" in payload.upper()
            or "SCENARIO 4" in payload.upper()
        ):

            insert_alert(
                SENSOR_ID_BUZZER_B,
                ATTACK_ID_SCENARIO_4,
                payload
            )

        # Normal alarm status
        else:

            insert_sensor_data(
                SENSOR_ID_BUZZER_B,
                payload
            )


    elif topic == "warehouse/floor2/security":

        # Scenario 4 events only
        if payload in [
            "UNAUTHORIZED ACCESS",
            "ACCESS DENIED",
            "SECURITY SUPPRESSION",
            "SCENARIO 4 STARTED",
            "SCENARIO 4 BLOCKED"
        ]:

            insert_alert(
                SENSOR_ID_RFID,
                ATTACK_ID_SCENARIO_4,
                payload
            )

        # Safe/normal events
        else:

            insert_sensor_data(
                SENSOR_ID_REED_B,
                payload
            )

            if "SAFE" in payload.upper():

                insert_sensor_data(
                    SENSOR_ID_LED_GREEN,
                    "ON"
                )

            elif "WARNING" in payload.upper():

                insert_sensor_data(
                    SENSOR_ID_LED_YELLOW,
                    "ON"
                )

            elif "DANGER" in payload.upper():

                insert_sensor_data(
                    SENSOR_ID_LED_RED,
                    "ON"
                )


    elif topic == "warehouse/floor2/attack":

        # Scenario 3
        if (
            "SCENARIO 3" in payload.upper()
            or "FLOODING" in payload.upper()
        ):

            insert_alert(
                SENSOR_ID_BUZZER_B,
                ATTACK_ID_SCENARIO_3,
                payload
            )

        # Scenario 4
        elif (
            "SCENARIO 4" in payload.upper()
            or "SUPPRESSION" in payload.upper()
        ):

            insert_alert(
                SENSOR_ID_RFID,
                ATTACK_ID_SCENARIO_4,
                payload
            )
    
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_SERVER, MQTT_PORT, 60)

print("[SYSTEM] WareSafe MQTT Subscriber Running...")
client.loop_forever()