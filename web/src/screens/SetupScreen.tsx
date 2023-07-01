import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { network } from "@/lib/config"
import { useState } from "react"
import { handleHandshakeFile, handleReset, handleSSID, handleUpload, validatePassword } from "./helper"

const SetupScreen = ({ networks }: { networks: network[] }) => {
	const [selectedNetwork, setSelectedNetwork] = useState<network>()
    const [selectedPassword, setSelectedPassword] = useState("")
    const networksWithHandshake = networks.filter((network) => network.handshake)
	return (
		<div className="w-[300px] sm:w-[500px] md:w-[600px] p-5 border border-gray-700 rounded-lg items-center justify-center mt-3">
			<Label htmlFor="ssid-change">SSID</Label>
			<div className="flex flex-col w-full items-center justify-between sm:flex-row gap-2 mt-1">
				<Input
					className="w-full md:max-w-md"
					type="text"
					id="ssid-change"
					placeholder="Change SSID"
				/>
				<Button variant={"outline"} className="w-full sm:w-fit" onClick={handleSSID}>
					Change
				</Button>
			</div>
			<div className="mt-7">
				<Label htmlFor="handshake-file">Handshake</Label>
				<div className="flex flex-col w-full items-center justify-between sm:flex-row gap-2">
					<Input
						id="handshake-file"
						type="file"
						className="mt-1 w-full md:max-w-md cursor-pointer "
						onChange={handleHandshakeFile}
						accept=".cap,.pcap"
					/>
					<Button variant={"outline"} className="w-full sm:w-fit" onClick={handleUpload}>
						Upload
					</Button>
				</div>
			</div>

			<div className="mt-7">
				<Label htmlFor="password-validation">Password Validation</Label>
				<p className="text-sm text-gray-400">(Only SSID with Handshake can be validated)</p>
				<div className="flex flex-col w-full items-center justify-between sm:flex-row gap-2 mt-3">
					<Select disabled={networksWithHandshake.length === 0}
						onValueChange={(value) =>
							setSelectedNetwork(networks.find((network) => network.ssid === value)!)
						}
					>
						<SelectTrigger className="mt-1 w-full md:max-w-[200px]">
							<SelectValue placeholder={networksWithHandshake.length > 0 ? "Select SSID" : "No SSID with Handshake"} />
						</SelectTrigger>
						<SelectContent>
                            {networksWithHandshake.map((network) => ( 
                                <SelectItem key={network.ssid} value={network.ssid}>
                                    {network.ssid}
                                </SelectItem>
                            ))}
						</SelectContent>
					</Select>
					<Input
						id="password-validation"
						type="text"
						className="mt-1 w-full md:max-w-md"
                        onChange={(e) => setSelectedPassword(e.target.value)}
                        disabled={networksWithHandshake.length === 0}
					/>
					<Button
						variant={"outline"}
						className="w-full sm:w-fit"
                        onClick={() => validatePassword(selectedPassword, selectedNetwork!)}
                        disabled={networksWithHandshake.length === 0}
					>
						Validate
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-5 mt-5 border rounded-lg  border-opacity-25 p-3">
				<label className="text-white text-lg font-semibold">Danger Zone :</label>
				<div className="flex gap-3 flex-col md:flex-row md:items-center ">
					<span className="hidden sm:block md:w-3/5 ">
						<label className="text-white text-md font-semibold">Reset handshakes</label>
						<p className="text-white text-sm">
							This will delete all the handshakes stored in the device.
						</p>
					</span>
					<Button
						variant="destructive"
						className="w-full md:w-2/5"
						onClick={() => handleReset("handshake")}
					>
						Reset Handshakes
					</Button>
				</div>

				<div className="flex gap-3 flex-col md:flex-row md:items-center">
					<span className="hidden sm:block md:w-3/5">
						<label className="text-white text-md font-semibold">Reset Passwords</label>
						<p className="text-white text-sm">
							This will delete all the passwords stored in the device.
						</p>
					</span>
					<Button
						variant="destructive"
						className="w-full md:w-2/5"
						onClick={() => handleReset("password")}
					>
						Reset Passwords
					</Button>
				</div>
			</div>
		</div>
	)
}

export default SetupScreen
