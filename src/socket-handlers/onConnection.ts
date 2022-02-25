import { Server, Socket } from "socket.io";
import { getAllRooms, getRoomById } from "../api/rooms";
import { GLOBAL_ROOM } from "../constants/room";
import { Dialog, RoomCreationResult } from "../types/dialog";
import { UserDTO } from "../types/userDto";
import makeid from "../utils/generateRoomId";
import mockedRooms from "./mocked-rooms";

let onlineClients: string[] = [];


let activeDialogs: Array<Dialog> = [];

const validateUser = (user: UserDTO): boolean => {
    return user.userId && user.dialogId && user.token
}

/**
 * ############################################################################################
 */
const onConnection = async (client: Socket, io: Server) => {
    
    const { handshake: { auth: authData } } = client;

    const auth = authData as { userId: string, dialogId: string, token: any }

    const isUserAlreadyExists = onlineClients.findIndex(el => el === auth.userId) !== -1;

    /**
     * Если пользователь не имеет данных авторизации или уже есть в списке пользователей онлайн, закидываем в общую комнату
     * TODO: сделать проверку на существование пользователя в бд - запрос к бэку!
     */
    (!validateUser(auth) || isUserAlreadyExists) && client.disconnect();

    !isUserAlreadyExists && onlineClients.push(auth.userId)

    const foundRooms = await getRoomById({ userId: auth.userId, roomId: auth.dialogId, jwt: {} })

    

    console.log(`Client ${auth.userId} connected!`)
    

    if(foundRooms.length !== 1) client.disconnect()
    if(foundRooms.length === 0) {
        client.emit('server:attention', 'Not found matched rooms, you was disconnected!');
        client.disconnect()
    }

    const clientRoom = foundRooms[0].dialogId;
    
    console.log(`For client ${auth.userId} found "${foundRooms[0].dialogId}" room`)

    client.emit('connection', 'Succesfuly connection!');

    client.join(clientRoom)
    
    client.on('sendMessage', msg => {
        io.emit('messageRecieved', msg)
    })

    client.on('disconnect', () => {
        onlineClients = onlineClients.filter(cl => cl !== auth.userId);
        console.log(`Client ${auth.userId} disconnected!`);
    })

    
}

export default onConnection;