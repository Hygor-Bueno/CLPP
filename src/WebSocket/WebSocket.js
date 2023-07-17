var ws;
export default class WebSocketCLPP {
  isConnected = false;
  tokens;
  sender;
  funcReceived;
  funcView;
  constructor(tokens, funcReceived, funcView) {
    this.tokens = tokens;
    this.funcReceived = funcReceived;
    this.funcView = funcView;
  }

  connectWebSocket() {
    try {
      let localWs = new WebSocket('ws://192.168.0.99:9193');
      ws = localWs;
      localWs.onopen = () => {
        this.onOpen(localWs)
      };
      localWs.onerror = (ev) => {
        this.onError(ev);
      };
      localWs.onclose = () => {
        this.onClose();
      };
      localWs.onmessage = (ev) => {
        this.onMessage(ev);
      };
    } catch (error) {
      console.log(error, true);
    }
  }

  onOpen(localWs) {
    let jsonString = {
      auth: this.tokens,
      app_id: 7,
    };
    localWs.send(JSON.stringify(jsonString));
    this.isConnected = true;
  }

  onError(ev) {
    console.log(ev.data, true);
  }

  onClose() {
    setTimeout(() => {
      this.connectWebSocket();
    }, 1000);
    this.isConnected = false;
  }

  async onMessage(ev) {
    let getNotify = JSON.parse(ev.data);
    if (getNotify.objectType == 'notification') {
      // console.log(' ****** vizualizaram sua mensagem ****** ',getNotify.user);
      if (getNotify.user == this.sender.id) {
        await this.funcView(getNotify);
        // console.warn("A janela ta aberta arrombado. User: "+this.sender.id);
      }
    } else if (getNotify.message) {
      if (!getNotify.error) {
        // console.log(' ****** Você recebeu uma mensagem ****** ',this.sender.id);
        await this.funcReceived(getNotify);
        if (getNotify.send_user == this.sender.id) {
          this.informPreview(this.sender.id);
        }
      }
    }
  }
  // "Eu visualizei a mensagem"
  async informPreview(idSender) {
    const jsonString = {}
    jsonString.type = 3;
    // jsonString[idSender[0] === 'send' ? 'send_id' : 'id_group'] = idSender[1];
    jsonString.send_id = idSender;
    ws.send(JSON.stringify(jsonString))
  }
  // Eu estou enviando a mensagem  
  informSending(type, send_id, message_id) {
    let jsonString = {}
    jsonString.type = type;
    jsonString.send_id = send_id;
    jsonString.last_id = message_id;
    ws.send(JSON.stringify(jsonString))
  }
  // Eu estou enviando a mensagem Grupo
  informSendingGroup(type, group_id, message_id) {
    let jsonString = {}
    jsonString.type = type;
    jsonString.group_id = group_id;
    jsonString.last_id = message_id;
    ws.send(JSON.stringify(jsonString))
  }
}
