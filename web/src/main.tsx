import ReactDOM from "react-dom/client"
import App from "./App"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "@/globals.css"
import Home from "./Home"
const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/attack",
		element: <App />,
	},
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<RouterProvider router={router} />
)
