enum encryption {
	WPA = "WPA",
	WPA2 = "WPA2",
	AUTO = "AUTO",
	UNKNOWN = "UNKNOWN",
}

type password = {
	password: string
	valid: boolean
}

type handshake = {
	ssid: string
	bssid: string
	snonce: string
	anonce: string
	srcAddress: string
	dstAddress: string
	mic: string
	eapolFrameBytes: string
}

type network = {
	ssid: string
	bssid: string
	signal: number
	channel: number
	encryption: encryption
	deauthState: boolean
	handshake: boolean
	handshakeData: handshake[]
	password: password[]
}

const notifyStyle = {
	style: {
		border: "1px solid #77AADD",
		padding: "16px",
		color: "#77AADD",
		background: "rgb(30 41 59)",
		fontFamily: "Roboto",
		fontSize: "14px",
		fontWeight: "bold",
	},
}

export type { network, password, handshake }
export { notifyStyle, encryption }
