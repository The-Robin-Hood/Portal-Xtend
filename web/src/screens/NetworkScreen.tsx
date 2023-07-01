import { DataTable } from "@/components/ui/data-table"
import { network } from "@/lib/config"
import { ColumnDef } from "@tanstack/react-table"
import { Switch } from "@/components/ui/switch"
import SignalBar from "@/components/ui/signal-bar"
import { deauth } from "./helper"
import { useState } from "react"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const DesktopTable: ColumnDef<network>[] = [
	{
		accessorKey: "bssid",
		header: "Wifi Networks",
		cell: ({ row }) => {
			return (
				<div className="flex flex-col gap-1">
					<div className="text-md font-medium">{row.original.ssid}</div>
					<div className="text-sm">{row.original.bssid}</div>
				</div>
			)
		},
	},
	{
		accessorKey: "encryption",
		header: "Encryption",
		cell: ({ row }) => <div className="flex justify-center">{row.original.encryption}</div>,
	},
	{
		accessorKey: "signal",
		header: "Signal",
		cell: ({ row }) => {
			return <SignalBar signal={row.original.signal} />
		},
	},
	{
		accessorKey: "handshake",
		header: "Handshake",
		cell: ({ row }) => (
			<div className="flex justify-center">{row.original.handshake ? "Yes" : "No"}</div>
		),
	},
	{
		accessorKey: "deauthState",
		header: "Deauth",
		cell: ({ row }) => {
			const [deauthState, setDeauthState] = useState(row.original.deauthState)
			return (
				<div className="flex justify-center space-x-2">
					<Switch
						id="deauth-mode"
						className="w-8 h-4"
						defaultChecked={deauthState}
						checked={deauthState}
						onCheckedChange={async (e) => {
							setDeauthState(true);
							setDeauthState(await deauth(e, row.index + 1))
						}}
					/>
				</div>
			)
		},
	},
	{
		accessorKey: "password",
		header: "Password",
		cell: ({ row }) => {
			return (
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="link">Veiw</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Password List - {row.original.ssid}</SheetTitle>
							<SheetDescription>List of all the passwords victim has entered</SheetDescription>
						</SheetHeader>
						<div className="flex flex-col mt-5 gap-2">
							{row.original.password.length > 0
								? row.original.password.map((password, index) => {
										return (
											<div
												key={index}
												className="flex break-all overflow-clip justify-start text-md font-medium gap-2"
											>
												{index +
													1 +
													". " +
													password.password +
													" - " +
													(password.valid ? "Valid" : "Invalid")}
											</div>
										)
								  })
								: "No Passwords Found"}
						</div>
					</SheetContent>
				</Sheet>
			)
		},
	},
]

const MobileTable: ColumnDef<network>[] = [
	DesktopTable[0],
	{
		accessorKey: "Details",
		header: "Details",
		cell: ({ row }) => {
			return (
				<div className="flex flex-col gap-1 items-center">
					<SignalBar signal={row.original.signal} />
					<div className="text-xs">{row.original.encryption}</div>
				</div>
			)
		},
	},
	DesktopTable[4],
	DesktopTable[5],
]

const NetworkScreen = ({ networks }: { networks: network[] }) => {
	return (
		<>
			<div className="container mx-auto py-5 hidden md:block">
				<DataTable columns={DesktopTable} data={networks} />
			</div>
			<div className="container mx-auto py-5 md:hidden">
				<DataTable columns={MobileTable} data={networks} />
			</div>
		</>
	)
}

export default NetworkScreen
