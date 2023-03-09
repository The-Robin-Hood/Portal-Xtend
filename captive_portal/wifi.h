#pragma once

#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include "utils.h"

extern bool setupWifi();
extern bool changeWifi(String ssid);
extern void initialServerSetup(IPAddress APIP);

void initialServerSetup(IPAddress APIP){
    WiFi.mode(WIFI_AP);
    WiFi.softAPConfig(APIP, APIP, IPAddress(255, 255, 255, 0));
    if(setupWifi()){
      Serial.println("Wifi setup successful");
    }
    else{
      Serial.println("Wifi setup failed");
    }
}

bool setupWifi(){
  DynamicJsonDocument config = readJsonFile("/json/config.json");
  const char* ssid = config["ssid"];
  Serial.println("SSID: " + String(ssid));
  WiFi.softAP(ssid);
  return true;
}

bool changeWifi(String ssid){
  DynamicJsonDocument config = readJsonFile("/json/config.json");
  config["ssid"] = ssid;
  writeJsonFile("/json/config.json", config);
  setupWifi();
  return true;
}
