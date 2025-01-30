import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import MainLayout from "../layout/main";
import AuthLayout from "../layout/auth";

const Loadable = (Component) => (props) => {
    return (
        <Suspense fallback={<></>}>
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
            children: [
                { path: "host/:id", element: <HostPage/>},
                { path: "me", element: <ProfilePage /> },
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