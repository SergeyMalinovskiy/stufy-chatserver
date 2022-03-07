import axios from "axios";
import API from "../constants/api";

export function getUserById(id: number) {
    const axr = axios.get(
        `${API.HOST}/users?id=${id}`
    ).then(r => r.data)
    .catch(err => [])

    return axr;
}
