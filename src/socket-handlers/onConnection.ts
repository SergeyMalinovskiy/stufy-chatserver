import { Server, Socket } from "socket.io";
import { createMessage, MessageDTO } from "../api/messages";
import { getAllRooms, getRoomById } from "../api/rooms";
import { getUserById } from "../api/user";
import { GLOBAL_ROOM } from "../constants/room";
import { ChatManager } from "../types/ChatManager.class";
import { Dialog, RoomCreationResult } from "../types/dialog";
import { UserDTO } from "../types/userDto";
import makeid from "../utils/generateRoomId";
import mockedRooms from "./mocked-rooms";

let onlineClients: number[] = [];


let activeDialogs: Array<Dialog> = [];

const validateUser = (user: UserDTO): boolean => {
    return user.userId && user.dialogId && user.token
}

const chatManager = ChatManager.getInstance();

/**
 * ############################################################################################
 */
const onConnection = async (client: Socket, io: Server) => {
    
    const { handshake: { auth: authData } } = client;

    const auth = authData as { userId: number, dialogId: number, token: any }

    console.log(`Client ${auth.userId} connected!`);

    const users: any[] = await getUserById(auth.userId);

    console.log(users);

    if(users.length !== 1) client.disconnect();

    chatManager.addClient(auth.userId);

    client.on('rooms:join', (roomId: number) => {
        console.log(`Joined to "Room_${roomId}"`)
        chatManager.setClientRoom(auth.userId, roomId);
        client.join(String(roomId));
    })

    client.on('rooms:leave', () => {
        const clientCurrentRoom = chatManager.getClientActiveRoom(auth.userId);
        console.log(`Leaved from "Room_${clientCurrentRoom}"`)
        chatManager.deleteClientRoom(auth.userId, clientCurrentRoom);
        client.leave(String(clientCurrentRoom));
    })

    client.on('message:send', async (msg: MessageDTO) => {
        
        const clientCurrentRoom = chatManager.getClientActiveRoom(auth.userId);
        const result = await createMessage(msg, clientCurrentRoom);
        console.log(msg)

        const r = io.to(String(clientCurrentRoom)).emit('message:received', msg)

        console.log(r);
    })

    client.on('disconnect', () => {
        chatManager.deleteClient(auth.userId);
        console.log(`Client ${auth.userId} disconnected!`);
    })

    
}

export default onConnection;