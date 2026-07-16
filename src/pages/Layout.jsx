import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import "./Layout.css";

const Layout = () => {

    return (
        <div className="app-shell">
            <Navbar />

            <div className="app-shell-body">
                <Sidebar />

                <main className="app-shell-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
