const SignalBar = (props: { signal: number }) => {
	const { signal } = props
	if (signal < 0 && signal > -35) {
		return (
			<div className="flex h-7 w-10 items-end justify-center self-center">
				<div className=" inline-block w-1/5 border border-gray-600 h-[20%] bg-[#16a085] "></div>
				<div className=" inline-block w-1/5 border border-gray-600 h-[40%] bg-[#16a085] "></div>
				<div className=" inline-block w-1/5 border border-gray-600 h-[60%] bg-[#16a085] "></div>
				<div className=" inline-block w-1/5 border border-gray-600 h-[80%] bg-[#16a085] "></div>
				<div className=" inline-block w-1/5 border border-gray-600 h-[99%] bg-[#16a085] "></div>
			</div>
		)
	} else if (signal < -35 && signal > -50) {
		return (
			<div className="flex h-7 w-10 items-end justify-center self-center">
				<div className=" inline-block w-1/5 border border-gray-600 h-[20%] bg-[#16a085]"></div>
				<div className=" inline-block w-1/5 border border-gray-600 h-[40%] bg-[#16a085]"></div>
				<div className=" inline-block w-1/5 border border-gray-600 h-[60%] bg-[#16a085]"></div>
				<div className=" inline-block w-1/5 border border-gray-600 h-[80%] bg-[#16a085]"></div>
				<div className=" inline-block w-1/5 border border-gray-600 h-[99%]"></div>
			</div>
		)
	} else if (signal < -50 && signal > -60) {
		return (
			<div className="flex h-7 w-10 items-end justify-center self-center">
				<div className="inline-block w-1/5 border border-gray-600 h-[20%] bg-yellow-300/80"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[40%] bg-yellow-300/80"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[60%] bg-yellow-300/80"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[80%]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[99%]"></div>
			</div>
		)
	} else if (signal < -60 && signal > -75) {
		return (
			<div className="flex h-7 w-10 items-end justify-center self-center">
				<div className="inline-block w-1/5 border border-gray-600 h-[20%] bg-[#e74c3c]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[40%] bg-[#e74c3c]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[60%]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[80%]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[99%]"></div>
			</div>
		)
	} else {
		return (
			<div className="flex h-7 w-10 items-end justify-center self-center">
				<div className="inline-block w-1/5 border border-gray-600 h-[20%] bg-[#e74c3c]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[40%]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[60%]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[80%]"></div>
				<div className="inline-block w-1/5 border border-gray-600 h-[99%]"></div>
			</div>
		)
	}
}
export default SignalBar
