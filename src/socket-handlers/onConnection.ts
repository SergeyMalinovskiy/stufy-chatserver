import { Server, Socket } from "socket.io";
import { GLOBAL_ROOM } from "../constants/room";
import { Dialog, RoomCreationResult } from "../types/dialog";
import { UserDTO } from "../types/userDto";
import makeid from "../utils/generateRoomId";
import mockedRooms from "./mocked-rooms";

let onlineClients: string[] = [];


let activeDialogs: Array<Dialog> = [];

const createRoom = (
    members: UserDTO['userId'][],
    isPrivate = false,
    roomId: string = '', 
    forcedCreate = false
): RoomCreationResult => {

    function generateUniqueRoomId(id: string): string {
        return activeDialogs.findIndex(el => el.roomId === id) === -1
            ? id
            : generateUniqueRoomId(`${roomId}_${makeid(16)}`);
    }
    /**
     * Проверяем существование комнаты с похожим roomId
     */
    const existRoomId = activeDialogs.findIndex(el => el.roomId === roomId)

    /**
     * Проверяем существование комнаты с похожим набором участников
     */
    const existsRoomWithMembers = activeDialogs.findIndex(el => el.members === members)

    /**
     * Если комната с похожим roomId существует 
     * и принудительное создание комнаты выключено, 
     * выдаём результат и не создаем комнату
     */
    if((existRoomId !== -1) && !forcedCreate) return {
        roomId: roomId,
        result: 'Room: already exists'
    }

    /**
     * Если комната с похожим набором участников существует, 
     * выдаём результат и не создаем новую комнату
     */
    if((existsRoomWithMembers !== -1)) return {
        roomId: activeDialogs[existRoomId].roomId,
        result: 'Room: with matched members already exists'
    }

    const newRoomId = generateUniqueRoomId(roomId);

    activeDialogs.push({
        isPrivate: isPrivate,
        roomId: newRoomId,
        members: members
    });

    return {
        roomId: newRoomId,
        result: forcedCreate ? 'Room: forced created' : 'Room: created'
    }
}

const getRoomByCompanion = (rooms = mockedRooms, currentUserId: UserDTO['userId'], companionId: UserDTO['userId']): Dialog['roomId'] | undefined => {
    const findRoom = rooms.find(el => {
        return el.members.length === 2 && el.members.includes(companionId) && el.members.includes(currentUserId)
    });
    
    return findRoom ? findRoom.roomId : undefined
}

const validateUser = (user: UserDTO): boolean => {
    return user.userId && user.companionId && user.token
}

/**
 * ############################################################################################
 */
const onConnection = (client: Socket, io: Server): void => {
    
    const { handshake: { auth: authData } } = client;

    const auth = authData as { userId: string, companionId: string, token: any }

    const isUserAlreadyExists = onlineClients.findIndex(el => el === auth.userId) !== -1;

    /**
     * Если пользователь не имеет данных авторизации или уже есть в списке пользователей онлайн, закидываем в общую комнату
     * TODO: сделать проверку на существование пользователя в бд - запрос к бэку!
     */
    (!validateUser(auth) || isUserAlreadyExists) && client.disconnect();

    !isUserAlreadyExists && onlineClients.push(auth.userId)

    const foundRoom = getRoomByCompanion(mockedRooms, auth.userId, auth.companionId);

    console.log(`Client ${auth.userId} connected!`)
    console.log(`For client ${auth.userId} found "${foundRoom}" room`)

    client.emit('connection', 'Succesfuly connection!');
    
    client.on('sendMessage', msg => {
        io.emit('messageRecieved', msg)
    })

    client.on('disconnect', () => {
        onlineClients = onlineClients.filter(cl => cl !== auth.userId);
        console.log(`Client ${auth.userId} disconnected!`);
    })

    
}

export default onConnection;