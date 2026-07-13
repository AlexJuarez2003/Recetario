import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {

    return (
        <div className="flex flex-col h-screen">
            
            <div className="h-15 bg-gray-200">
                <Navbar className="shrink-0" />
            </div>
            
            <div className="flex flex-1 overflow-hidden">

                <Sidebar className="shrink-0" />

                <main className="flex-1 p-4 overflow-y-auto">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default Layout;