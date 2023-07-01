#pragma once

#include <ArduinoJson.h>
#include <LittleFS.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

extern DynamicJsonDocument readJsonFile(const char* fileName);
extern void writeJsonFile(const char* file_path, DynamicJsonDocument& doc);
extern void listDir(const char* dirname, uint8_t levels);
extern void storageInfo();
extern void BLINK(int times);
extern String encryption_str(int encryption);

void listDir(const char* dirname, uint8_t levels) {
  File root = LittleFS.open(dirname,"r");
  if (!root) {
    Serial.println("Failed to open directory");
    return;
  }

  if (!root.isDirectory()) {
    Serial.println("Not a directory");
    return;
  }

  File file = root.openNextFile();
  while (file) {
    if (file.isDirectory()) {
      Serial.println("-"+String(file.name()));
      if (levels) {
        listDir(file.name(), levels - 1);
      }
    } else {
      Serial.print(" |- ");
      Serial.print(file.name());
      Serial.print("  SIZE: ");
      Serial.print(file.size());
      Serial.println(" bytes");
    }

    file = root.openNextFile();
  }
}

DynamicJsonDocument readJsonFile(const char* file_path) {
  DynamicJsonDocument doc(4000);
  File file = LittleFS.open(file_path, "r");
  deserializeJson(doc, file);
  file.close();
  return doc;
}

void writeJsonFile(const char* file_path, DynamicJsonDocument& doc) {
  File file = LittleFS.open(file_path, "w");
  serializeJson(doc, file);
  file.close();
}

void storageInfo(){
  FSInfo fs_info;
  LittleFS.info(fs_info);
  Serial.printf("LittleFS Total space: %u KB\n", fs_info.totalBytes/1000);
  Serial.printf("LittleFS Used space: %u KB\n", fs_info.usedBytes/1000);
  Serial.printf("LittleFS Free space: %u KB\n", (fs_info.totalBytes - fs_info.usedBytes)/1000);
}

void BLINK(int times) {
  for (int counter = 0; counter < times * 2 ; counter++)
  {
    digitalWrite(BUILTIN_LED, counter % 2);
    delay(500);
  }
}

String encryption_str(int encryption)
{
  switch (encryption)
    {
    case ENC_TYPE_WEP:
      return "WEP";
    case ENC_TYPE_TKIP:
      return "WPA";
    case ENC_TYPE_CCMP:
      return "WPA2";
    case ENC_TYPE_NONE:
      return "OPEN";
    case ENC_TYPE_AUTO:
      return "AUTO";
    default:
      return "UNKNOWN";
    }
}