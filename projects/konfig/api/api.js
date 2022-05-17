var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const url = "dachkonfigurator.kantmanufaktur.com";
const wsURL = "wss://" + url;
class Shard {
    constructor(url = wsURL) {
        this.id = ++Shard.count;
        this.lastRUUID = 0;
        this.buffer = [];
        this.messageAwaiters = [];
        this.onMessage = (data) => void 0;
        this.url = url;
        this.socket = new WebSocket(this.url);
        this.init();
        const t = this;
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const pingResult = (yield t.ping());
            console.log(`Shard${t.id}: Ping to the server was ${pingResult ? "successful" : "unsuccessful"}.`);
            if (!pingResult) {
                t.init();
            }
        }), 5 * 1000);
    }
    init() {
        this.socket.onclose = () => { };
        this.socket.close();
        this.socket = new WebSocket(this.url);
        this.socket.onopen = () => {
            this.ping();
        };
        this.socket.onerror = () => {
            this.init();
        };
        this.socket.onclose = () => {
            this.init();
        };
        this.socket.onmessage = msg => {
            this.onMessage(msg.data);
            var d = JSON.parse(msg.data);
            for (const a of this.messageAwaiters) {
                if (a.evaluate(d))
                    this.messageAwaiters.splice(this.messageAwaiters.indexOf(a), 1);
            }
        };
    }
    sendMessage(action, message = "") {
        this.send({ action, type: "message", data: message });
    }
    emitEvent(event, ...args) {
        this.send({ event, type: "event", args });
    }
    sendRequest(action, message = "") {
        return new Promise((resolve, reject) => {
            const ruuid = ++this.lastRUUID;
            this.send({ action, type: "request", data: message, ruuid });
            this.messageAwaiters.push(new MessageAwaiter(ruuid, resolve));
            return;
        });
    }
    close() {
        this.socket.onclose = () => { };
        this.socket.close();
    }
    send(data) {
        var t = [...this.buffer];
        this.buffer = [];
        for (var h of t) {
            try {
                this.socket.send(JSON.stringify(h));
                this.buffer.splice(this.buffer.indexOf(h), 1);
            }
            catch (e) { }
        }
        try {
            this.socket.send(JSON.stringify(data));
        }
        catch (err) {
            this.buffer.push(data);
        }
    }
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this.sendRequest("ping"));
        });
    }
}
Shard.count = 0;
class Client {
    constructor() {
        this.eventListeners = {};
        this.email = undefined;
        this.authorized = false;
        this.shard = new Shard();
        this.shard.onMessage = data => {
            const obj = JSON.parse(data);
            if (obj.type !== "event")
                return;
            this.emit(obj.event, ...obj.args);
        };
    }
    emit(event, ...args) {
        if (!this.eventListeners[event])
            this.eventListeners[event] = [];
        for (const c of this.eventListeners[event]) {
            c(...args);
        }
    }
    on(event, callback) {
        if (!this.eventListeners[event])
            this.eventListeners[event] = [];
        this.eventListeners[event].push(callback);
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            this.authorized = yield this.shard.sendRequest("login", { email, password });
            if (this.authorized)
                this.email = email;
            else
                this.email = undefined;
            return this.authorized;
        });
    }
    register(email, name, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.shard.sendRequest("registration", { email, name, password });
        });
    }
    createProject(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("createProject", { name });
        });
    }
    saveProject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("saveProject", { id });
        });
    }
    updateProject(id, data, partOfReverStack) {
        if (!this.authorized)
            throw new Error("Action requires authorization.");
        return void this.shard.emitEvent("projectUpdated", id, data, partOfReverStack);
    }
    addFileListener(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.shard.sendRequest("listenForProjectUpdates", { id });
        });
    }
    removeFileListener(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.shard.sendRequest("stopListenForProjectUpdates", { id });
        });
    }
    getOwnedProjectsIDs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("getMyProjectIDs");
        });
    }
    getProjectDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.shard.sendRequest("getProjectDetails", { id });
        });
    }
    deleteAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("deleteAccount");
        });
    }
    generateKey() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.shard.sendRequest("generateKey");
        });
    }
    useKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            var data = yield this.shard.sendRequest("keyAuth", { key });
            if (data.authorized)
                this.authorized = true;
        });
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            if (!this.name)
                this.name = yield this.shard.sendRequest("getName");
            if (!this.name)
                throw new Error("Could not retrieve name.");
            return this.name;
        });
    }
    addEditorToProject(id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("editShareProject", { id, email });
        });
    }
    removeEditorFromProject(id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("removeEditorFromProject", { id, email });
        });
    }
    changeProjectName(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("changeProjectName", { id, name });
        });
    }
    transferProjectOwnership(id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("transferProjectOwnership", { id, email });
        });
    }
    deleteProject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("deleteProject", { id });
        });
    }
    getEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("getEmail");
        });
    }
    forkProject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("forkProject", { id });
        });
    }
    restrictProjectEdit(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("restrictProjectEdit", { id });
        });
    }
    liftProjectEditRestriction(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authorized)
                throw new Error("Action requires authorization.");
            return yield this.shard.sendRequest("liftProjectEditRestriction", { id });
        });
    }
    getProjectListeners(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.shard.sendRequest("getProjectListeners", { id });
        });
    }
}
class MessageAwaiter {
    constructor(ruuid, resolve) {
        this.resolve = resolve;
        this.ruuid = ruuid;
    }
    evaluate(message) {
        if (message.ruuid == this.ruuid) {
            this.resolve(message.body);
            return true;
        }
        return false;
    }
}
