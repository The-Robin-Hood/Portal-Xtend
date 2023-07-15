import { handshake, network, notifyStyle } from "@/lib/config"
import { toast } from "react-hot-toast"
import CryptoJS from "crypto-js"

interface CapFile {
	extractPmkFields(): any
}

declare var CapFile: {
	new (data: ArrayBuffer, isPcap: boolean): CapFile
}

const deauth = async (state: boolean, apNo: number) => {
	if (!state) {
		const request = fetch("http://172.0.0.1/stop_deauth").then((response) => response.json())
		toast.promise(
			request,
			{
				loading: "Stopping Deauth...",
				success: "Deauth Stopped",
				error: (err) => err.message,
			},
			notifyStyle
		)
		return false
	} else {
		const request = fetch("http://172.0.0.1/deauth?ap=" + apNo)
			.then((response) => {
				return response.json()
			})
			.then((data) => {
				if (data.status == "error") {
					throw new Error(data.message)
				}
				return data
			})
		toast.promise(
			request,
			{
				loading: "Deauthing...",
				success: (data) => data.message,
				error: (err) => err.message,
			},
			notifyStyle
		)

		try {
			await request
		} catch (err) {
			return false
		}

		return true
	}
}

const handleHandshakeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
	if (e.target.files?.length === 0) return
	const file = e.target.files?.[0]
	if (file) {
		var extension = file.name.split(".").pop()?.toLowerCase()
		if (extension != "cap" && extension != "pcap") {
			toast.error("Please upload a .cap or .pacp file", notifyStyle)
			e.target.value = ""
			e.target.files = null
			return
		}
	}
}

const handleUpload = () => {
	const handshakeFile = (document.getElementById("handshake-file") as HTMLInputElement).files?.[0]
	if (handshakeFile) {
		let reader = new FileReader()
		reader.onload = async (e) => {
			const result = e.target!.result as ArrayBuffer
			try {
				let cap = new CapFile(result, false)
				let handshake = cap.extractPmkFields()
				delete handshake.bssid
				delete handshake.keyDescriptorVersion
				delete handshake.keyLength
				let res = await fetch("http://172.0.0.1/post_handshake", {
					method: "POST",
					body: JSON.stringify(handshake),
				})
				if (res.status == 200) {
					toast.success("Handshake uploaded successfully", notifyStyle)
					window.location.reload()
				} else {
					toast.error("Handshake upload failed", notifyStyle)
				}
			} catch (err) {
				console.log(err)
				toast.error("Please upload a valid handshake file", notifyStyle)
			}
		}
		reader.readAsBinaryString(handshakeFile)
	} else {
		toast.error("Please select a handshake file", notifyStyle)
	}
}

const handleSSID = () => {
	const ssid = (document.getElementById("ssid-change") as HTMLInputElement).value
	if (ssid.length === 0) return
	if (!confirm("Warning: \nChanging the SSID will restart the device. Do you want to continue?"))
		return
	let formData = new FormData()
	formData.append("ssid", ssid)
	fetch("http://172.0.0.1/post_ssid", { method: "POST", body: formData })
	let message = toast.loading(
		"SSID will be changed in a few seconds. Please switch to the new network.",
		notifyStyle
	)
	setTimeout(() => {
		toast.dismiss(message)
		window.location.reload()
	}, 10000)
}

const handleReset = async (x: "handshake" | "password") => {
	if (x == "password") {
		if (!confirm("Warning: \nDo you want to clear all the passwords?")) return
		toast.promise(
			fetch("http://172.0.0.1/clear_passwords"),
			{
				loading: "Clearing Passwords...",
				success: "Passwords Cleared",
				error: (err) => err.message,
			},
			notifyStyle
		)
	}
	if (x == "handshake") {
		if (!confirm("Warning: \nDo you want to clear all the handshakes?")) return
		toast.promise(
			fetch("http://172.0.0.1/clear_handshakes"),
			{
				loading: "Clearing Handshakes...",
				success: "Handshakes Cleared",
				error: (err) => err.message,
			},
			notifyStyle
		)
	}
}

function kckFromPmk(srcAddress: string, dstAddress: string, anonce: string, snonce: string) {
	let prefix = "5061697277697365206b657920657870616e73696f6e00"
	if (srcAddress < dstAddress) {
		prefix += srcAddress
		prefix += dstAddress
	} else {
		prefix += dstAddress
		prefix += srcAddress
	}
	if (snonce < anonce) {
		prefix += snonce
		prefix += anonce
	} else {
		prefix += anonce
		prefix += snonce
	}
	prefix += "00"
	return prefix
}

function crackPassword(network: handshake, password: string) {
	const pmk = CryptoJS.PBKDF2(password, network.ssid, { keySize: 8, iterations: 4096 })
	const kck_pmk = kckFromPmk(network.srcAddress, network.dstAddress, network.anonce, network.snonce)
	const prefix = CryptoJS.enc.Hex.parse(kck_pmk)
	const hmac = CryptoJS.HmacSHA1(prefix, pmk).toString()
	let kck = hmac.substring(0, 32)
	const bytes = CryptoJS.enc.Hex.parse(network.eapolFrameBytes)
	let newkck = CryptoJS.enc.Hex.parse(kck)
	const computedMic = CryptoJS.HmacSHA1(bytes, newkck).toString().substring(0, 32)
	// console.log("network", network.ssid)
	// console.log("Expected MIC :", network.mic)
	// console.log("Calculated MIC :", computedMic)
	if (computedMic === network.mic) {
		return true
	} else {
		return false
	}
}

const validatePassword = (password: string, network: network) => {
	if (network == undefined) {
		toast.error("Please select a network", notifyStyle)
		return false
	}
	if (password.length < 8) {
		toast.error("Password must be at least 8 characters long", notifyStyle)
		return false
	}
	network.handshakeData.forEach((handshake) => {
		if (handshake.ssid !== network.ssid) return
		if (crackPassword(handshake, password)) {
			toast.success("Password is valid for " + handshake.ssid, notifyStyle)
		} else {
			toast.error("Password is not valid for " + handshake.ssid, notifyStyle)
		}
	})
}

export {
	deauth,
	handleSSID,
	handleHandshakeFile,
	handleUpload,
	handleReset,
	validatePassword,
	crackPassword,
}
