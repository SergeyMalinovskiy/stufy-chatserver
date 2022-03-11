import { Server, Socket } from "socket.io";
import { createMessage, MessageDTO, MessageType } from "../api/messages";
import { getAllRooms, getRoomById } from "../api/rooms";
import { getUserById } from "../api/user";
import { GLOBAL_ROOM } from "../constants/room";
import { IncomingOrderDTO } from "../models/order";
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

    console.log(`Client ${client.id} connected!`);

    const users: any[] = await getUserById(auth.userId);

    console.log(users);

    if(users.length !== 1) client.disconnect();

    chatManager.addClient(client.id, auth.userId);

    client.on('rooms:join', (roomId: string) => {
        console.log('Join attempt!')
        if(!client) return;
        console.log(client)
        if(!roomId) client.disconnect();
        console.log(`Joined to "Room_${roomId}"`)
        chatManager.setClientRoom(client.id, roomId);
        client.join(String(roomId));
    })

    client.on('rooms:leave', () => {
        const clientCurrentRoom = chatManager.getClientActiveRoom(client.id);
        console.log(`Leaved from "Room_${clientCurrentRoom}"`)
        if(clientCurrentRoom) {
            chatManager.deleteClientRoom(client.id, clientCurrentRoom);
            client.leave(String(clientCurrentRoom));
        }
    })

    client.on('message:send', async (msg: MessageDTO) => {
        
        const clientCurrentRoom = chatManager.getClientActiveRoom(client.id);
        const result = await createMessage(msg, clientCurrentRoom);
        console.log(msg)

        const r = io.to(String(clientCurrentRoom)).emit('message:received', msg)

        console.log(r);
    })

    client.on('message:proposal', async (orderProposals: IncomingOrderDTO) => {
        if(!orderProposals) return;

        const clientCurrentRoom = chatManager.getClientActiveRoom(client.id);
        const roomClients = chatManager.getRoomClients(clientCurrentRoom);

        const matchedCompanion = roomClients.find(el => el.userId !== client.id);

        /**
         * Проверка комнаты на присутствие только лишь 2х пользователей
         */
        if((roomClients.length && roomClients.length > 2) || !matchedCompanion) {
            await client.send('message:notify', { text: 'Не получилось отправить предложение!', type: MessageType.Error });
            return;
        }

        const msg: MessageDTO = {
            sender: orderProposals.customer,
            isReaded: true,
            text: `
                Вам были предложены условия заказа:
                Сроки: ${orderProposals.targetCompletionDate.toString()}
                Сроки гарантии: ${orderProposals.garantyCompletionDate.toString()}
                Цена: ${orderProposals.price}
            `,
            departureTime: Date.now(),
            replyBy: -1,
            attachments: [],
            isSystem: true,
            type: MessageType.Proposal,
            for: matchedCompanion.externalId,
            dialogId: Number(matchedCompanion.roomId)
        }

        const createdMessage = await createMessage(msg, matchedCompanion.roomId)

        console.log(createdMessage);
        if(createdMessage) io.to(matchedCompanion.userId).emit('message:notify:recieved', createdMessage);
    })

    client.on('disconnect', () => {
        chatManager.deleteClient(client.id);
        console.log(`Client ${client.id} disconnected!`);
    })

    
}

export default onConnection;