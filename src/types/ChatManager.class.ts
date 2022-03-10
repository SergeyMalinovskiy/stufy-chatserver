/**
 * Класс Одиночка предоставляет метод getInstance, который позволяет клиентам
 * получить доступ к уникальному экземпляру одиночки.
 */
 export class ChatManager {
    private static instance: ChatManager;

    private onlineClients: Array<{
        userId: string,
        roomId: string
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

    public getRoomClients(roomId: string) {
        return this.onlineClients.filter(el => el.roomId === roomId)
    }

    public addClient(clientId: string) {
        if(this.onlineClients.findIndex(el => el.userId === clientId) !== -1) return;

        this.onlineClients.push({ userId: clientId, roomId: '' });
    }

    public deleteClient(clientId: string) {
        if(this.onlineClients.findIndex(el => el.userId === clientId) === -1) return;

        this.onlineClients = this.onlineClients.filter(el => el.userId !== clientId);
    }

    public setClientRoom(clientId: string, roomId: string) {
        this.onlineClients = this.onlineClients.map(el => {
            return el.userId === clientId ? {
               ...el,
               roomId: roomId 
            } : el;
        });
    }

    public deleteClientRoom(clientId: string, roomId: string) {
        this.onlineClients = this.onlineClients.map(el => {
            return el.userId === clientId ? {
               ...el,
               roomId: '' 
            } : el;
        });
    }

    public getClientActiveRoom(clientId: string) {
        const room = this.onlineClients.find(el => el.userId === clientId)?.roomId;

        return room ? room : '';
    }
}