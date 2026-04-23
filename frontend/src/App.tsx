import {BrowserRouter} from "react-router-dom"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import AppRouter from "./router"
import {useTokenInit} from "./hooks/auth.ts";

//用于管理向后端请求的数据
const queryClient = new QueryClient()

export default function App() {
    useTokenInit()
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppRouter/>
            </BrowserRouter>
        </QueryClientProvider>
    )
}
