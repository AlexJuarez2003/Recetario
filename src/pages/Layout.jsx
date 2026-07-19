import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { useRef, useState } from "react";
import "./Layout.css";

const Layout = () => {
    const mainRef = useRef(null);
    const lastScroll = useRef(0);
    const [chromeHidden, setChromeHidden] = useState(false);

    const handleScroll = () => {
        const top = mainRef.current?.scrollTop || 0;
        const delta = top - lastScroll.current;

        if (top > 90 && delta > 8) {
            setChromeHidden(true);
        }

        if (delta < -8 || top < 35) {
            setChromeHidden(false);
        }

        lastScroll.current = top;
    };

    return (
        <div className={`app-shell ${chromeHidden ? "mobile-chrome-hidden" : ""}`}>
            <Navbar />

            <div className="app-shell-body">
                <Sidebar />

                <main className="app-shell-main" ref={mainRef} onScroll={handleScroll}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
