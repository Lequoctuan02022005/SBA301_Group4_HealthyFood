import {useEffect, useState} from "react";

import {getUsers} from "../../services/userService";

function AccountList(){

    const [users,setUsers]=useState([]);

    useEffect(()=>{

        loadUsers();

    },[]);

    const loadUsers=()=>{

        getUsers()

            .then(res=>{

                setUsers(res.data.content);

            })

            .catch(err=>{

                console.log(err);

            })

    }

    return(

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

                    users.map(user=>(

                        <tr key={user.id}>

                            <td>{user.id}</td>

                            <td>{user.fullName}</td>

                            <td>{user.email}</td>

                            <td>

                                {user.role}

                            </td>

                            <td>

                                {user.status}

                            </td>

                            <td>

                                Detail

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