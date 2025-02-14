import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import MainLayout from "../layout/main";
import AuthLayout from "../layout/auth";
import ProfileLayout from "../layout/profile";
import Fallback from "../pages/Fallback";

const Loadable = (Component) => (props) => {
    return (
        <Suspense fallback={<Fallback />}>
            <Component {...props} />
        </Suspense>
    );
};

export default function Router() {
    return useRoutes([
        {
            path: "/auth",
            element: <AuthLayout />,
            children: [
                { path: "login", element: <LoginPage /> },
                { path: "register", element: <SignupPage /> },
            ],
        },
        {
            path: "/",
            element: <MainLayout />,
            children: [
                { path: "", element: <HomePage /> },
                { path: "property/:id", element: <PropertyPage /> }
            ],
        },
        {
            path: "/",
            element: <ProfileLayout />,
            children: [
                { path: "host/:id", element: <HostPage/>},
                { path: "profile", element: <ProfilePage /> },
                { path: "host-home", element: <HostHomePage /> },
                { path: "booking/:id", element: <BookingPage />},
            ],
        },
    ]);
}

const HomePage = Loadable(lazy(() => import("../pages/Home")));
const HostPage = Loadable(lazy(() => import("../pages/HostPage")));
const LoginPage = Loadable(lazy(() => import("../pages/Login")));
const ProfilePage = Loadable(lazy(() => import("../pages/Profile")));
const PropertyPage = Loadable(lazy(() => import("../pages/PropertyPage")));
const SignupPage = Loadable(lazy(() => import("../pages/Signup")));
const HostHomePage = Loadable(lazy(() => import("../pages/HostHome")));
const BookingPage = Loadable(lazy(() => import("../pages/Booking")));