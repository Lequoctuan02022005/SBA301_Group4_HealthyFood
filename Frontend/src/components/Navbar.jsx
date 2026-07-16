import { Link } from "react-router-dom";

function Navbar(){

    return(

        <nav className="navbar navbar-dark bg-dark">

            <div className="container">

                <Link
                    className="navbar-brand"
                    to="/admin/users"
                >

                    HealthyFood Admin

                </Link>

                <div className="collapse navbar-collapse show">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/users">Users</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/reports">Reports</Link>
                        </li>
                    </ul>
                </div>

            </div>

        </nav>

    )

}

export default Navbar;