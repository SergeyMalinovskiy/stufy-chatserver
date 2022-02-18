import { Socket } from "socket.io";

const onConnection = (socket: Socket): void => {
    console.log('Client connected!')

    const { handshake: { auth } } = socket;

    if(auth.userId) console.log(auth.userId)

    socket.on('disconnect', () => {
        console.log('Client disconnected!');
    })
}

export default onConnection;