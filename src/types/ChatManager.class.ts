/**
 * Класс Одиночка предоставляет метод getInstance, который позволяет клиентам
 * получить доступ к уникальному экземпляру одиночки.
 */
 export class ChatManager {
    private static instance: ChatManager;

    private onlineClients: Array<{
        userId: number,
        roomId: number
    }> = [];

    /**
     * Конструктор Одиночки всегда должен быть скрытым, чтобы предотвратить
     * создание объекта через оператор new.
     */
    private constructor() { }

    /**
     * Статический метод, управляющий доступом к экземпляру одиночки.
     *
     * Эта реализация позволяет вам расширять класс Одиночки, сохраняя повсюду
     * только один экземпляр каждого подкласса.
     */
    public static getInstance(): ChatManager {
        if (!ChatManager.instance) {
            ChatManager.instance = new ChatManager();
        }

        return ChatManager.instance;
    }

    public getOnlineCount() {
        return this.onlineClients.length;
    }

    public getRoomClients(roomId: number) {
        return this.onlineClients.filter(el => el.roomId === roomId)
    }

    public addClient(clientId: number) {
        if(this.onlineClients.findIndex(el => el.userId === clientId) !== -1) return;

        this.onlineClients.push({ userId: clientId, roomId: -1 });
    }

    public deleteClient(clientId: number) {
        if(this.onlineClients.findIndex(el => el.userId === clientId) === -1) return;

        this.onlineClients = this.onlineClients.filter(el => el.userId !== clientId);
    }

    public setClientRoom(clientId: number, roomId: number) {
        this.onlineClients = this.onlineClients.map(el => {
            return el.userId === clientId ? {
               ...el,
               roomId: roomId 
            } : el;
        });
    }

    public deleteClientRoom(clientId: number, roomId: number) {
        this.onlineClients = this.onlineClients.map(el => {
            return el.userId === clientId ? {
               ...el,
               roomId: -1 
            } : el;
        });
    }

    public getClientActiveRoom(clientId: number) {
        const room = this.onlineClients.find(el => el.userId === clientId)?.roomId;

        return room ? room : -1;
    }
}