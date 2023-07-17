let ws;
let isConnected = false;
let tokens;
let sender;
let funcReceived;
let funcView;

export default function WebSocketCLPP(tokensParam, funcReceivedParam, funcViewParam) {
  tokens = tokensParam;
  funcReceived = funcReceivedParam;
  funcView = funcViewParam;
  connectWebSocket();
}

function connectWebSocket() {
  try {
    ws = new WebSocket('ws://192.168.0.99:9193');
    // console.log(ws);
    ws.onopen = ws.send('FOI')
    ws.onerror = onError;
    ws.onclose = onClose;
    ws.onmessage = onMessage;
  } catch (error) {
    console.log(error, true);
  }
}

function onOpen(ws) {
  let jsonString = {
    auth: tokens,
    app_id: 7,
  };
  ws.send(JSON.stringify(jsonString));
  isConnected = true;
}

function onError(ev) {
  console.log(ev.data, true);
}

function onClose() {
  setTimeout(connectWebSocket, 1000);
  isConnected = false;
}

async function onMessage(ev) {
  let getNotify = JSON.parse(ev.data);
  if (getNotify.objectType === 'notification') {
    if (getNotify.user === sender.id) {
      await funcView(getNotify);
    }
  } else if (getNotify.message) {
    if (!getNotify.error) {
      await funcReceived(getNotify);
      if (getNotify.send_user === sender.id) {
        informPreview(sender.id);
      }
    }
  }
}

async function informPreview(idSender) {
  const jsonString = {
    type: 3,
    send_id: idSender,
  };
  // Verifica se a conexão WebSocket está no estado OPEN antes de enviar dados
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(jsonString));
  } else {
    // Aguarda um tempo e tenta novamente
    setTimeout(() => {
      informPreview(idSender);
    }, 1000);
  }
}

export function informSending(type, send_id, message_id) {
  let jsonString = {
    type: type,
    send_id: send_id,
    last_id: message_id,
  };
  // Verifica se a conexão WebSocket está no estado OPEN antes de enviar dados
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(jsonString));
  } else {
    // Aguarda um tempo e tenta novamente
    setTimeout(() => {
      informSending(type, send_id, message_id);
    }, 1000);
  }
}

function informSendingGroup(type, group_id, message_id) {
  let jsonString = {
    type: type,
    group_id: group_id,
    last_id: message_id,
  };
  // Verifica se a conexão WebSocket está no estado OPEN antes de enviar dados
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(jsonString));
  } else {
    // Aguarda um tempo e tenta novamente
    setTimeout(() => {
      informSendingGroup(type, group_id, message_id);
    }, 1000);
  }
}
