import {BrowserRouter, Routes, Route} from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login.jsx";
import {Provider} from "react-redux";
import appStore from "../utils/appStore.js";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import SignUp from "./components/SignUp.jsx";
import Groups from "./components/Groups.jsx";
import Balances from "./components/Balances.jsx";
import Settle from "./components/Settle.jsx";
import GroupDetail from "./components/GroupDetail.jsx";
import ActivityPage from "./components/ActivityPage.jsx";

function App() {
  
  return (
    <Provider store={appStore}>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Body />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile/>} />
          <Route path="groups" element={<Groups />} />
          <Route path="balances" element={<Balances />} />
          <Route path="settle" element={<Settle />} />
          <Route path="group/:groupId" element={<GroupDetail />} />
          <Route path="activity" element={<ActivityPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </Provider>
  )
}

export default App
