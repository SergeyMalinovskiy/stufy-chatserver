import httpServer from 'http';
import { Server, Socket } from 'socket.io';

const io = new Server(httpServer.createServer());

const onConnection  = (socket: Socket) => {
    console.log('Client connected!')

    socket.on('disconnect', () => {
        console.log('Client disconnected!');
    })
}

io.on('connection', onConnection)

io.listen(3002);
