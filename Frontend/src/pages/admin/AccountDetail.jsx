import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser } from "../../services/userService";

function AccountDetail() {

    const { id } = useParams();

    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = () => {
        getUser(id)
            .then(res => {
                setUser(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }

    if (!user) {
        return <h4>Loading...</h4>;
    }

    return (

        <div className="container mt-4">

            <div className="card shadow">

                <div className="card-header bg-primary text-white">

                    <h3>Account Detail</h3>

                </div>

                <div className="card-body">

                    <div className="row">

                        <div className="col-md-4 text-center">

                            {
                                user.avatar ?

                                    <img
                                        src={user.avatar}
                                        alt=""
                                        className="img-fluid rounded-circle"
                                        style={{
                                            width: "180px",
                                            height: "180px"
                                        }}
                                    />

                                    :

                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                        alt=""
                                        className="img-fluid rounded-circle"
                                        style={{
                                            width: "180px",
                                            height: "180px"
                                        }}
                                    />

                            }

                        </div>

                        <div className="col-md-8">

                            <table className="table table-bordered">

                                <tbody>

                                <tr>
                                    <th>ID</th>
                                    <td>{user.id}</td>
                                </tr>

                                <tr>
                                    <th>Full Name</th>
                                    <td>{user.fullName}</td>
                                </tr>

                                <tr>
                                    <th>Email</th>
                                    <td>{user.email}</td>
                                </tr>

                                <tr>
                                    <th>Phone</th>
                                    <td>{user.phone}</td>
                                </tr>

                                <tr>
                                    <th>Role</th>
                                    <td>{user.role}</td>
                                </tr>

                                <tr>
                                    <th>Status</th>
                                    <td>{user.status}</td>
                                </tr>

                                <tr>
                                    <th>Email Verified</th>
                                    <td>
                                        {
                                            user.emailVerified
                                                ? "Verified"
                                                : "Not Verified"
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <th>Violation</th>
                                    <td>{user.violationCount}</td>
                                </tr>

                                <tr>
                                    <th>Expire At</th>
                                    <td>{user.expireAt}</td>
                                </tr>

                                <tr>
                                    <th>Unban At</th>
                                    <td>{user.unbanAt}</td>
                                </tr>

                                <tr>
                                    <th>Personal Info</th>
                                    <td>{user.customerPersonalInfo}</td>
                                </tr>

                                </tbody>

                            </table>

                            <Link
                                to="/admin/users"
                                className="btn btn-secondary"
                            >
                                Back
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AccountDetail;