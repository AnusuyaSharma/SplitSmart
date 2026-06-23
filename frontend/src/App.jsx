import {BrowserRouter, Routes, Route} from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login.jsx";
import {Provider} from "react-redux";
import appStore from "../utils/appStore.js";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";

function App() {
  
  return (
    <Provider store={appStore}>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Body />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile/>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </Provider>
  )
}

export default App
