#include <SPI.h>
#include <LoRa.h>

#define SS 5
#define RST 14
#define DIO0 26

void setup()
{
  Serial.begin(115200);

  LoRa.setPins(SS,RST,DIO0);

  while(!LoRa.begin(433E6))
  {
    Serial.println("LoRa Failed");
    delay(500);
  }

  Serial.println("Base Station Ready");
}

void loop()
{
  int packetSize = LoRa.parsePacket();

  if(packetSize)
  {
    String msg="";

    while(LoRa.available())
      msg += (char)LoRa.read();

    Serial.println(msg);
  }
}