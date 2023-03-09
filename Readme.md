<div id="top"></div>

[![MIT License][license-shield]][license-url]
[![YouTube][youtube-shield]][youtube-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/The-Robin-Hood/deauth_portal">
    <img src="/images/logo.png" alt="Logo" width="490px" height="230px">
  </a>
</div>

Version 1.0.0

<!-- ABOUT THE PROJECT -->
## About The Project
This project implements a captive portal for WiFi networks that allows users to upload handshakes and expose the password of the victim. When victim connects with the WiFi network created by the ESP8266 board, they will be redirected to the captive portal page. This page shows that the WiFi needs to be upgraded with a prompt to the user to enter the password.
This password is checked against the password of the handshakes uploaded by the user. If the password matches, the victim is redirected to the final page which shows fake wifi upgrading process. If the password does not match, the victim is alerted that the password is incorrect.

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

To run this project, you will need:

- An ESP8266 board (such as NodeMCU ESP8266)
- Arduino IDE
- ESP8266 core for Arduino IDE
- ArduinoJson library
- LittleFS library

## Configuring
Before running the sketch, you may need to adjust some configuration settings in the data/config.json file:
```json
{
  "ssid": "Free Wifi",
}
```
ssid: The name of the WiFi network you want to create.

### Installing
1. Connect your ESP8266 board to your computer via USB.
2. Open the captive_portal.ino file in Arduino IDE.
3. Install the required libraries (mentioned above) using the Library Manager in Arduino IDE.
4. Select your ESP8266 board from the "Tools" menu in Arduino IDE.
5. Click the "ESP8266 LittleFS Data Upload" button in Arduino IDE Tools section to upload the data folder to the ESP8266 board.
6. Upload the sketch to your ESP8266 board.

### Running
1. Connect to the WiFi network created by the ESP8266 board (the default SSID is "Free Wifi").
2. Open a web browser and navigate to http://172.0.0.1/handshake.
3. Upload a handshake file if you have one else this step can be skipped.
4. Navigate to http://172.0.0.1/ssid and change the SSID of the WiFi network.

(Note: When there is no handshake uploaded by the user then when a victim enters the password and submits it, for the first time they will be alerted that the password is incorrect. This is because to make the victim the site is upgrading, the password is checked against the real password of the WiFi network. After that, the second time the victim will be redirected to the final page which shows fake wifi upgrading process.)

## Usage
### Commands
The following commands can be entered via the serial monitor (at a baud rate of 115200) to interact with the ESP8266 board:

- help: Show available commands.
- ls: List files on the file system.
- show config: Show the contents of the config.json file.
- show datas: Show the contents of the datas.json file.
- reset ssid: Reset the config.json file to use the default SSID ("Free Wifi").
- storage info: Show the available space on the file system.

### APIs
The following HTTP APIs are provided by the ESP8266 board:

**These APIs are for serving pages.**
- `GET /` : Serve the captive portal page.
- `GET /handshake` : Serve the page to capture handshakes.
- `GET /ssid` : Serve the page to change the SSID of the WiFi network.

**These APIs are for actions can be performed by the user.**
- `GET /get_datas` : Get the captured handshakes and cracked passwords in JSON format.
- `GET /clear_handshakes` : Clear the captured handshakes.
- `GET /clear_passwords` : Clear the cracked passwords.

## Educational Purpose
This project is for educational purposes only. So Kindly use it at your own risk. 
I am not responsible for any misuse of this project.

## Contributing
Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**. If you want to contribute to this project, you can create a pull request with your changes. Before submitting a pull request, make sure that your changes pass all tests and conform to the project's coding standards.

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

[![Twitter][twitter-shield]][twitter-url]
[![YouTube][youtube-shield]][youtube-url]
[![Mail][yahoo-shield]][yahoo-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

Project Link: https://github.com/The-Robin-Hood/Portal-Xtend

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[license-url]: https://github.com/The-Robin-Hood/portal-xtend/blob/master/LICENSE
[license-shield]: https://img.shields.io/github/license/The-Robin-Hood/dropit.svg
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?logo=linkedin&colorB=blue
[linkedin-url]: https://linkedin.com/in/ansari-s
[youtube-shield]: https://img.shields.io/badge/-YouTube-red.svg?logo=youtube&colorB=red
[youtube-url]: https://www.youtube.com/@amsorry
[twitter-shield]: https://img.shields.io/badge/-Twitter-blue.svg?logo=twitter&colorB=blue
[twitter-url]: https://twitter.com/amsorry_offl
[yahoo-shield]: https://img.shields.io/badge/-Email-red.svg?logo=yahoo&colorB=red
[yahoo-url]: mailto:ansari_official@yahoo.com