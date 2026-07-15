import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import AccountList from "./pages/admin/AccountList";
import AccountDetail from "./pages/admin/AccountDetail";

function App() {

    return (

        <BrowserRouter>

            <Navbar />

            <div className="container mt-4">

                <Routes>

                    <Route path="/" element={<Navigate to="/admin/users"/>}/>

                    <Route
                        path="/admin/users"
                        element={<AccountList/>}
                    />

                    <Route
                        path="/admin/users/:id"
                        element={<AccountDetail/>}
                    />

                </Routes>

            </div>

        </BrowserRouter>

    )

}

export default App;