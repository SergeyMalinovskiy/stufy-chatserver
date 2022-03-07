import axios from "axios";
import API from "../constants/api";

export function getRoomById(params: {
    roomId: string,
    userId: string,
    jwt: any
}): Promise<{ dialogId: string, userId: string }[]> {
    const axr = axios.get(
            `${API.HOST}/userToDialogs?userId=${params.userId}&dialogId=${params.roomId}`,
        )
            .then(result => result.data)
            .catch(error => error)
            
    return axr;
}

export function getAllRooms() {
    const axr = axios.get(
        `${API.HOST}/userToDialogs`,
    )
        .then(result => result.data)
        .catch(error => error)
        
    return axr;
}