<div id="top"></div>

<!-- PROJECT LOGO -->
<div id="user-content-toc"  align="center">
  <img src="/captive_portal/data/png/router.png" alt="Logo">
  <ul>
    <summary><h1 style="display: inline-block;">Portal Xtend </h1></summary>
    <p align="center">Version 2.0.0</p>
  </ul>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project
- This project implements a captive portal for WiFi networks.
- Users can upload handshakes to expose the password of the victim.
- When the victim connects to the WiFi network created by the ESP8266 board, they are redirected to a captive portal page.
- The captive portal page prompts the user to enter their password, claiming that a WiFi upgrade is required.
- The entered password is checked against the uploaded handshakes.
- If the password matches, the victim is shown a fake WiFi upgrading process.
- If the password is incorrect, the victim is alerted that the password is wrong.

<!-- GETTING STARTED -->
## Getting Started
### Prerequisites

To run this project, you will need:

- An ESP8266 board (such as NodeMCU ESP8266)
- Arduino IDE
- ESP8266 core for Arduino IDE
- ArduinoJson library
- LittleFS library

### Installing
With Browser:
1. Download the latest release from [here](https://github.com/The-Robin-Hood/Portal-Xtend/releases/tag/v2.0.0)
2. Connect your ESP8266 board to your computer via USB.
3. Visit [esp website](https://esp.huhn.me/)
4. Connect your esp8266 device
5. Reset your esp8266 device
6. Upload the binary file to your esp8266 device
7. Connect to the WiFi network created by the ESP8266 board (the default SSID is "Free Wifi").
8. Upload the data folder extracted from the captive_portal.zip file.
9. Happy Hacking!

With Arduino IDE:
1. Connect your ESP8266 board to your computer via USB.
2. Open the captive_portal.ino file in Arduino IDE.
3. Install the required libraries (mentioned above) using the Library Manager in Arduino IDE.
4. Select your ESP8266 board from the "Tools" menu in Arduino IDE.
5. Click the "ESP8266 LittleFS Data Upload" button in Arduino IDE Tools section to upload the data folder to the ESP8266 board.
6. Upload the sketch to your ESP8266 board.

### Running
1. Connect to the WiFi network created by the ESP8266 board (the default SSID is "Free Wifi").
2. Open a web browser and navigate to http://172.0.0.1/attack.
3. Change the SSID of the WiFi network to the name of the WiFi network you want to attack.
4. Go to Setup section and upload the handshakes file if you have one else this step can be skipped.
5. Go to Networks Section and start deauth attack on the target WiFi network.

(Note: When there is no handshake uploaded by the user then when a victim enters the password and submits it, for the first time they will be alerted that the password is incorrect. This is because to make the victim the site is upgrading, the password is checked against the real password of the WiFi network. After that, the second time the victim will be redirected to the final page which shows fake wifi upgrading process.)

https://github.com/The-Robin-Hood/Portal-Xtend/assets/32297581/01eb4174-72f7-4a1b-8e65-11121c8de5a0

## Usage
### Commands
The following commands can be entered via the serial monitor (at a baud rate of 115200) to interact with the ESP8266 board:

- help: Show available commands.
- ls: List files on the file system.
- show config: Show the contents of the config.json file.
- show datas: Show the contents of the datas.json file.
- reset ssid: Reset the config.json file to use the default SSID ("Free Wifi").
- storage info: Show the available space on the file system.
- scan : Scan for WiFi networks.
- list networks: List the WiFi networks found by the scan command.
- deauth [ap num]: Deauthenticate an access point.
- stop deauth: Stop all deauthentication attacks.

### APIs
The following HTTP APIs are provided by the ESP8266 board:

**These APIs are for serving pages.**
- `GET /` : Serve the captive portal page.
- `GET /attack` : Serve the attack page.
- `GET /reupload` : Serve the file reupload page.

**These APIs are for actions can be performed by the user.**
- `GET /get_datas` : Get the captured handshakes and cracked passwords in JSON format.
- `GET /clear_handshakes` : Clear the captured handshakes.
- `GET /clear_passwords` : Clear the cracked passwords.

## Educational Purpose
This project is intended for educational purposes only. Please be aware that any use of this project is at your own risk. I cannot be held responsible for any misuse or unauthorized actions taken with this project.

## Contributing
Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**. If you want to contribute to this project, you can create a pull request with your changes. Before submitting a pull request, make sure that your changes pass all tests and conform to the project's coding standards.

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
### Contact

[![Twitter][twitter-shield]][twitter-url] [![Instagram][instagram-shield]][instagram-url] [![YouTube][youtube-shield]][youtube-url] 


<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[license-url]: https://github.com/The-Robin-Hood/portal-xtend/blob/master/LICENSE
[license-shield]: https://img.shields.io/github/license/The-Robin-Hood/dropit.svg
[youtube-shield]: https://img.shields.io/badge/-YouTube-red.svg?logo=youtube&colorB=red
[youtube-url]: https://www.youtube.com/@amsorry
[twitter-shield]: https://img.shields.io/badge/-Twitter-blue.svg?logo=twitter&colorB=blue
[twitter-url]: https://twitter.com/am5orry
[instagram-shield]: https://img.shields.io/badge/-Instagram-blue.svg?logo=instagram&colorB=purple
[instagram-url]: https://instagram.com/amsorry_offl
