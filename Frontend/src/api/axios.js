import axios from "axios";

export default axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json"
    }
});
export const getUsers = () => axios.get(API);

export const updateRole = (id, role) =>
    axios.put(`${API}/${id}/role?role=${role}`);