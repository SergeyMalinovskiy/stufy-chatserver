import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';

import onConnection from './socket-handlers/onConnection';

const app: Application = express();

const httpServer = new http.Server(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

const APP_PORT = 3002;

console.log(process.env)


app.use(express.static('public'));

/**
 * 
 * Express Routes
 * 
 */
app.get('/', async (req: Request, res: Response) => {
    res.sendFile('./index.html')
});

/**
 * 
 * Socket.IO Configuring
 * 
 */
io.on('connection', s => onConnection(s, io));

try {
    httpServer.listen(APP_PORT, () => {
        console.log(`Server running on *${APP_PORT} port!`)
    });
} catch (error: any) {
    console.log(`Error occured: ${error.message}`)
}

