import { useEffect, useRef, useState } from "react"
import { Toaster, toast } from "react-hot-toast"
import { network, encryption, password, notifyStyle, handshake } from "./lib/config"
import NavSlider from "./components/ui/nav-slider"
import NetworkScreen from "./screens/NetworkScreen"
import { Button } from "./components/ui/button"
import SetupScreen from "./screens/SetupScreen"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./components/ui/sheet"
import LogsScreen from "./screens/LogsScreen"

function App() {
	const [networks, setNetworks] = useState<network[] | null>(null)
	const [networksWithHandshakes, setnetworksWithHandshakes] = useState<network[]>([])
	const [section, setSection] = useState<number>(0)
	const [logs, setLogs] = useState<string[]>([])
	const ws = useRef<WebSocket | null>(null)
	const connected = useRef<boolean>(false)
	const initialConnection = useRef<boolean>(true)

	async function retryConnection() {
		let style: any = notifyStyle
		style.style["textAlign"] = "center"
		try {
			ws.current = new WebSocket("ws://172.0.0.1:81/attack")
			ws.current.onopen = () => {
				connected.current = true
				initialConnection.current = false
				toast.dismiss()
				toast.success("Connected to device")
				setNetworks(null)
				setSection(0)
				fetchData()
				ws.current?.send("ping")
			}

			ws.current.onmessage = (event) => {
				if (event.data === "Victim connected") {
					setLogs((prev) => [...prev,"Victim connected"]);
					return toast.success("Victim connected")
				}
				if (event.data === "Victim disconnected") {
					setLogs((prev) => [...prev, "Victim disconnected"]);
					return toast.error("Victim disconnected")
				}
				const data = JSON.parse(event.data)
				if (data.type === "password") {
					setLogs((prev) => [...prev, "Victim entered password : " + data.password]);
					return toast.success("Victim entered password");
				}
				if (data.type === "message") {
					setLogs((prev) => [...prev, data.message]);
					return
				}
				setLogs((prev) => {
                    return [...prev, data];
                  });
			}
			ws.current.onclose = () => {
				if (initialConnection.current) {
					toast.loading("Could not connect to device", style)
					initialConnection.current = false
				} else if (connected.current) {
					toast.error("Connection to device lost", style)
					connected.current = false
					initialConnection.current = true
					setNetworks(null)
					setSection(0)
				}
				retryConnection()
			}

			setTimeout(() => {
				if (ws.current?.readyState !== 1) {
					ws.current?.close()
				}
			}, 15000)
		} catch (err) {
			console.log(err, "WebSocket error")
		}
	}

	const checkHandshake = (datas: handshake[], bssid: string): boolean => {
		for (let i in datas) {
			let incoming = bssid.replaceAll(":", "").toLowerCase()
			if (incoming === datas[i].dstAddress) {
				return true
			}
		}
		return false
	}
	const checkPassword = (datas: any, ssid: string): password[] => {
		let passwords: password[] = []
		for (let i in datas) {
			if (ssid === datas[i].ssid) {
				let valid = false
				if (datas[i].handshakes && datas[i].matched) {
					valid = true
				}
				passwords.push({
					password: datas[i].password,
					valid: valid,
				})
			}
		}
		return passwords
	}

	const fetchData = async () => {
		const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
		await sleep(1000)
		const get_networks = await fetch("http://172.0.0.1/get_networks")
		const get_datas = await fetch("http://172.0.0.1/get_datas")
		// const get_networks = await fetch("/temp/temp-networks.json")
		// const get_datas = await fetch("/temp/temp-datas.json")
		const data = await get_networks.json()
		const datas = await get_datas.json()
		if (data.length === 0) {
			console.log("No networks found")
			setNetworks([])
			setnetworksWithHandshakes([])
		}
		for (let i in data) {
			let new_network: network = {
				ssid: data[i].ssid,
				bssid: data[i].bssid,
				signal: parseInt(data[i].signal),
				channel: parseInt(data[i].channel),
				encryption: data[i].encryption,
				deauthState: data[i].deauthState === "1" ? true : false,
				handshake: checkHandshake(datas.handshakes, data[i].bssid),
				password: checkPassword(datas.passwords, data[i].ssid),
				handshakeData: datas.handshakes.filter(
					(handshake: handshake) =>
						handshake.dstAddress === data[i].bssid.replaceAll(":", "").toLowerCase()
				),
			}
			setNetworks((prev) => {
				return prev ? [...prev, new_network] : [new_network]
			})
		}
		for (let i in datas.handshakes) {
			let newNetwork: network = {
				ssid: datas.handshakes[i].ssid,
				bssid: datas.handshakes[i].dstAddress,
				signal: 0,
				channel: 0,
				encryption: encryption.UNKNOWN,
				deauthState: false,
				handshake: true,
				password: checkPassword(datas.passwords, datas.handshakes[i].ssid),
				handshakeData: [datas.handshakes[i]],
			}
			setnetworksWithHandshakes((prev) => {
				if (prev) {
					let found = prev.find((network) => network.bssid === newNetwork.bssid)
					if (found) {
						return prev
					}
				}
				return prev ? [...prev, newNetwork] : [newNetwork]
			})
		}
	}
	useEffect(() => {
		retryConnection()
		document.title = "Portal-Xtend"
	}, [])

	return (
		<div className="flex flex-col h-screen bg-[#040a1b] justify-center items-center overflow-hidden">
			<h1 className="text-[#77AADD] font-semibold text-[50px] mb-2">Portal-Xtend</h1>
			<Toaster position="bottom-center" />
			<div className="flex flex-col justify-center items-center">
				{networks != null ? (
					<>
						<NavSlider
							activeNav={section}
							setActiveNav={setSection}
							children={["Networks", "Setup","Logs"]}
						/>
						{section === 0 ? (
							<>
								<NetworkScreen networks={networks} />
								<Button
									variant="link"
									onClick={() => {
										setNetworks(null)
										setSection(0)
										fetchData()
									}}
									>
									Refresh
								</Button>
							</>
						) : section === 1 ? (
							<SetupScreen networks={networksWithHandshakes} />
						) : 
						<LogsScreen logs={logs} setLogs={setLogs}/>
						}
					</>
				) : (
					<div className="loading">
						<svg width="64px" height="48px">
							<polyline
								points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
								id="back"
							></polyline>
							<polyline
								points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
								id="front"
							></polyline>
						</svg>
					</div>
				)}
			</div>
		</div>
	)
}

export default App
