import Signup from "./signup/signup.jsx";
import "./App.css";
import User from "./getuser/user";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./login/login.jsx";
import Syslogs from "./syslog/syslog";

function App() {
  const route = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/register", element: <Signup /> },

    // Users dashboard (modals live here)
    { path: "/user", element: <User /> },

    // Backward compatible routes: they now open the modal inside the same UI
    { path: "/add", element: <User /> },
    { path: "/update/:id", element: <User /> },

    { path: "/syslogs", element: <Syslogs /> },
  ]);

  return (
    <div className="App">
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;
