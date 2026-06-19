import {BrowserRouter, Routes, Route} from "react-router-dom";
import Body from "./components/Body";
function App() {
  
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Body />}>
          <Route path="/login" element={<div>Login Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
