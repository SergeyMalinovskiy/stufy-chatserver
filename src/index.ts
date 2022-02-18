import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';

import { sequelize } from './instances/sequelize'
import onConnection from './socket-handlers/onConnection';

const app: Application = express();

const httpServer = new http.Server(app);

const io = new Server(httpServer);

const APP_PORT = 3002;

console.log(process.env)


app.use(express.static('public'));

sequelize.sync();

/**
 * 
 * Express Routes
 * 
 */
app.get('/', async (req: Request, res: Response) => {
    res.sendFile('./index.html')
});

app.get('/messages', async (req: Request, res: Response) => {
    console.log(req.query)
    res.send({
        msg: 'GetMessages'
    }) 
})

app.get('/dialogs', async (req: Request, res: Response) => {
    console.log(req.query)
    res.send({
        msg: 'GetMessages'
    }) 
})


/**
 * 
 * Socket.IO Configuring
 * 
 */
io.on('connection', onConnection);

try {
    httpServer.listen(APP_PORT, () => {
        console.log(`Server running on *${APP_PORT} port!`)
    });
} catch (error: any) {
    console.log(`Error occured: ${error.message}`)
}

