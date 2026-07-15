import { useEffect, useState } from "react";

import { getUsers, updateRole } from "../../services/userService";
import { updateStatus } from "../../services/userService";
import { Link } from "react-router-dom";

function AccountList() {

    const [users, setUsers] = useState([]);
    const roles = [
        "CUSTOMER",
        "SELLER",
        "NUTRIENT",
        "MANAGER"
    ];
    useEffect(() => {
        loadUsers();
    }, []);
    const loadUsers = () => {
        getUsers()
            .then(res => {
                setUsers(res.data.content);
            })
            .catch(err => {
                console.log(err);
            })
    }
    const handleRoleChange = async (id, role) => {
        if (!window.confirm(`Change role to ${role}?`)) {
            loadUsers();
            return;
        }
        try {
            await updateRole(id, role);
            loadUsers();
        } catch (err) {
            loadUsers();
            alert("Cannot update role.");
        }
    }
    const handleStatus = async (user) => {
        const ok = window.confirm(
            `Change status of ${user.fullName}?`
        );
        if (!ok) return;
        try {
            await updateStatus(user.id);
            loadUsers();
        } catch (err) {
            alert("Update failed");
        }
    }
    return (
        <div>
            <h2 className="mb-4">
                Account Management
            </h2>
            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Detail</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>
                                    {
                                        user.role === "ADMIN" ?
                                            <span className="badge bg-danger">
                                                ADMIN
                                            </span>
                                            :
                                            <select
                                                className="form-select"
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleRoleChange(user.id, e.target.value)
                                                }
                                            >
                                                {
                                                    roles.map(role => (
                                                        <option
                                                            key={role}
                                                            value={role}
                                                        >
                                                            {role}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                    }
                                </td>
                                <td>

                                    <button
                                        className={
                                            user.status === "ACTIVE"
                                                ? "btn btn-success btn-sm"
                                                : "btn btn-danger btn-sm"
                                        }
                                        onClick={() => handleStatus(user)}
                                    >
                                        {user.status}
                                    </button>
                                </td>
                                <td>
                                    <Link
                                        to={`/admin/users/${user.id}`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Detail
                                    </Link>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>

    )

}

export default AccountList;