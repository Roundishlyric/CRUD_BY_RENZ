import AddUser from './adduser/adduser';
import Signup from './signup/signup.jsx'
import './App.css';
import User from './getuser/user';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Update from './updateuser/update.jsx';
import Login from './login/login.jsx';
import Syslogs from './syslog/syslog';


function App() {
  const route = createBrowserRouter([
    {
      path:"/",
      element:<Login />
    },
    {
      path:"/register",
      element:<Signup />
    },
    {
      path: "/user",
      element: <User />,
    },
    {
      path: "/add",
      element: <AddUser />,  
    },
    {
      path: "/update/:id",
      element:<Update />
    },
    {
      path: "/syslogs",
      element:<Syslogs />
    },
    {
      path:"/register",
      element:<Signup />
    }
  ]);

  return (
    <div className="App">
      <RouterProvider router={route}></RouterProvider>
    </div>
  );
}

export default App;
