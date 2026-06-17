#include <SPI.h>
#include <LoRa.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

#define SS 5
#define RST 14
#define DIO0 26

#define GPS_RX 16
#define GPS_TX 17

#define SOS_BUTTON 4

String NODE_ID = "A";   // Change for each boat

TinyGPSPlus gps;
HardwareSerial GPSSerial(2);

unsigned long lastSend = 0;
unsigned long packetCounter = 0;

String recentPackets[20];
int recentIndex = 0;

bool alreadySeen(String id)
{
  for(int i=0;i<20;i++)
  {
    if(recentPackets[i] == id)
      return true;
  }
  return false;
}

void savePacket(String id)
{
  recentPackets[recentIndex] = id;
  recentIndex++;

  if(recentIndex >= 20)
    recentIndex = 0;
}

void setup()
{
  Serial.begin(115200);

  pinMode(SOS_BUTTON, INPUT_PULLUP);

  GPSSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  LoRa.setPins(SS, RST, DIO0);

  while(!LoRa.begin(433E6))
  {
    Serial.println("LoRa Failed");
    delay(500);
  }

  Serial.println("Mesh Node Ready");
}

void loop()
{
  while(GPSSerial.available())
  {
    gps.encode(GPSSerial.read());
  }

  // Send own location every 10 seconds
  if(millis() - lastSend > 10000)
  {
    lastSend = millis();

    if(gps.location.isValid())
    {
      packetCounter++;

      String status = "NORMAL";

      if(digitalRead(SOS_BUTTON) == LOW)
        status = "SOS";

      String packet =
        NODE_ID + "," +
        String(packetCounter) + "," +
        "3," +
        status + "," +
        String(gps.location.lat(),6) + "," +
        String(gps.location.lng(),6);

      LoRa.beginPacket();
      LoRa.print(packet);
      LoRa.endPacket();

      Serial.print("Sent: ");
      Serial.println(packet);
    }
  }

  int packetSize = LoRa.parsePacket();

  if(packetSize)
  {
    String msg="";

    while(LoRa.available())
      msg += (char)LoRa.read();

    int p1 = msg.indexOf(',');
    int p2 = msg.indexOf(',', p1+1);
    int p3 = msg.indexOf(',', p2+1);

    String originID = msg.substring(0,p1);
    String packetID = msg.substring(p1+1,p2);

    int hops = msg.substring(p2+1,p3).toInt();

    String uniqueID = originID + "_" + packetID;

    if(originID == NODE_ID)
      return;

    if(alreadySeen(uniqueID))
      return;

    savePacket(uniqueID);

    Serial.print("Received: ");
    Serial.println(msg);

    if(hops > 0)
    {
      hops--;

      String forwarded =
        originID + "," +
        packetID + "," +
        String(hops) +
        msg.substring(p3);

      delay(100);

      LoRa.beginPacket();
      LoRa.print(forwarded);
      LoRa.endPacket();

      Serial.print("Forwarded: ");
      Serial.println(forwarded);
    }
  }
}