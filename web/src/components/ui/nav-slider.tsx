import { useEffect, useRef } from "react"

import { cn } from "../../lib/utils"

const NavSlider = ({
	containerClassName,
	buttonClassName,
	indicatorClassName,
	activeNav,
	setActiveNav,
	children,
}: {
	containerClassName?: string
	buttonClassName?: string
	indicatorClassName?: string
	activeNav: number
	setActiveNav: Function
	children: string[]
}) => {
	const navRef = useRef<HTMLDivElement>(null)
	const indicatorRef = useRef<HTMLDivElement>(null)

	const moveNavIndicator = (index: number) => {
		const navItems = navRef.current!.children
		const navItem = navItems[index]
		const navItemRect = navItem.getBoundingClientRect()
		const navRect = navRef.current!.getBoundingClientRect()
		const left = navItemRect.left - navRect.left
		const width = navItemRect.width
		indicatorRef.current!.style.transform = `translateX(${left - 10}px)`
		indicatorRef.current!.style.width = `${width + 20}px`
	}

	useEffect(() => moveNavIndicator(0), [])

	return (
		<div
			className={cn(
				"relative flex w-full max-w-fit items-center justify-between gap-10 rounded-md bg-[#1E293B] px-10 shadow-md font-medium",
				containerClassName
			)}
			ref={navRef}
		>
			{children.map((child, index) => (
				<button
					key={index}
					className={cn(
						"py-3",
						activeNav === index ? "text-white" : "text-gray-500",
						buttonClassName
					)}
					onClick={() => {
						moveNavIndicator(index)
						setActiveNav(index)
					}}
				>
					{child}
				</button>
			))}
			<div
				className={cn(
					"absolute bottom-0 left-0 h-1 w-0 rounded-md bg-white transition-all duration-700",
					indicatorClassName
				)}
				ref={indicatorRef}
			></div>
		</div>
	)
}

NavSlider.displayName = "NavSlider"

export default NavSlider
