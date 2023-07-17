/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useRef, useState } from "react";
import { Connection } from "../ApiRest";
import IndexedDB from "../IndexedDB/indexedDB";
import Modal from "../Components/Modal";
import './Chat.css';
import PhotoUser from "../Components/PhotoUser";
import ItemMenu from "../Components/ItemMenu";
import WebSocketCLPP from "../WebSocket/WebSocket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import User from "../Class/User";
import ContactList from "../Class/ContactList";
import Message from "../Class/Message";
import { useNavigate } from "react-router-dom";


export default function Chat(props) {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [contacts, setContacts] = useState(false);
    const [show, setShow] = useState(false);
    const [modalJson, setModalJson] = useState({ title: '', message: '', type: '' });
    const [searchContacts, setSearchContacts] = useState('');
    const [contactList, setContactList] = useState([]);
    const [tempContactsList, setTempContactsList] = useState([]);
    const [sender, setSender] = useState({});
    const [load, setLoad] = useState(props);
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);
    const [textMessage, setTextMessage] = useState('');
    const [fileMessage, setFileMessage] = useState('');
    const [fileNameMessage, setFileNameMessage] = useState('');
    const [typeFileMessage, setTypeFileMessage] = useState(0);
    const [pageMessage, setPageMessage] = useState(1);
    const [limitPageMessage, setLimitPageMessage] = useState(1);
    const [initScroll, setInitScroll] = useState(0);

    const scrollableDivRef = useRef(null);
    const changeScrollRef = useRef(changeScroll);
    const webSocket = useRef(new WebSocketCLPP());
    //Irá monitorar o Scroll, caso ele vá em direção ao topo receberá o valor false
    const [monitorScroll, setMonitorScroll] = useState(true);
    const [scrollTop, setScrollTop] = useState(0);
    const [controllerSend, setControllerSend] = useState(false);


    //Controle WebSocket:
    useEffect(() => {
        (async () => {
            try {
                let clpp = new IndexedDB();
                let userDB = await clpp.readObject(parseInt(localStorage.id_clpp) || 0);
                webSocket.current.tokens = userDB.session;
                webSocket.current.connectWebSocket();
                setWs(webSocket.current);
            } catch (error) {

            }
        })()
    }, [])

    //Controle das mensagens e destinátario.
    useEffect(() => {
        (async () => {
            try {
                webSocket.current.sender = sender;
                webSocket.current.funcReceived = receivedMessage;
                webSocket.current.funcView = viewedMessage;
            } catch (error) {
                console.error(error);
            }
        })();
        async function receivedMessage(event) {
            try {
                if (parseInt(event.send_user) === parseInt(sender.id)) {
                    let newList = messages
                    newList.push(new Message(event.send_user, event.message, 1, event.type));
                    setMessages([...messages]);
                    monitorScroll && changeScrollRef.current();
                } else {
                    contactList.forEach((contact, index) => {
                        if (contact.id === event.send_user) {
                            if (contact.youContact === 0) contact.youContact = 1;
                            if (contact.notification === 0) contact.notification = 1;
                            contactList[index] = contact;
                        }
                    });
                    setContactList([...contactList]);
                }
            } catch (error) {
            }
        }
        async function viewedMessage(event) {
            // console.warn("Eu Vizualizei a sua mensagem... ", event);
            let clpp = new IndexedDB();
            let userDB = await clpp.readObject(parseInt(localStorage.id_clpp) || 0);
            let connection = new Connection();
            await connection.put({
                id_user: event.user,
                id_sender: userDB.login,
                UpdateNotification: 1
            }, 'CLPP/Message.php');
            let newSender = new User(null, sender);
            newSender.pendingMessage = 0;
            setSender(newSender);
        }
    }, [messages, sender, contactList, monitorScroll]);

    //Primeiras informações a serem carregadas na página.
    useEffect(() => {
        (async () => {
            load.setLoading(true);
            try {
                let userDB = await datasUser();
                if (!userDB) throw new Error('Usuário não encontrado');
                // Informações do colaborador logado.
                let infoUser = new User(userDB.login);
                await infoUser.loadInfo();
                setUser(infoUser);
                await getContacts();
            } catch (error) {
                setShow(true);
                setModalJson({ title: 'Erro!', message: error.toString(), type: 'danger' });
            }
            load.setLoading(false);
        })();

        //Carregando lista de contatos e validando contatos com conversas;
        async function getContacts() {
            let userDB = await datasUser();
            let listFull = new ContactList(userDB.login);
            await listFull.loadListContacts();
            setContactList(listFull.contacts);
            setTempContactsList(listFull.contacts);
        }
        async function datasUser() {
            let clpp = new IndexedDB();
            let userDB = await clpp.readObject(parseInt(localStorage.id_clpp) || 0);
            return userDB;
        }
    }, [load]);
    // useEffect(() => { console.log(monitorScroll) }, [monitorScroll])

    return (
        <div id="pageChat">
            <Modal show={show} setShow={setShow} title={modalJson.title} message={modalJson.message} type={modalJson.type} confirm={modalJson.confirm} funcConfirm={modalJson.funcConfirm} />
            <div id="divChatContainer">
                <main className="p-1">
                    <div className='d-flex flex-column h-50'>
                        <ItemMenu title={"HELLOW"} eventButton={() => { console.log("Expandir ou retrair menu!") }} icon={'fa-bars'} />
                        <ItemMenu eventButton={() => { setContacts(!contacts); }} icon={'fa-address-book'} />
                    </div>
                    <PhotoUser base64={user.photo} logoff={() => {
                        setShow(true);
                        setModalJson({ title: 'Atenção!', message: "Deseja mesmo realizar o logoff?", type: 'light', confirm: true, funcConfirm: async () => logoff()})}} 
                        />
                </main>
                <section className="border-right">
                    <div className="d-flex justify-content-center align-items-center">
                        <input value={searchContacts} onChange={(e) => { setSearchContacts(e.target.value); filterByName(tempContactsList, 'name', e.target.value) }} type="text" placeholder='Buscar contato' className="form-control w-75" />
                    </div>
                    <span>
                        {contacts ? contactsSection() : conversationsSection()}
                    </span>
                </section>
                {chatAside()}
            </div>
        </div>
    );

    function conversationsSection() {
        return (
            orderList(contactList.filter(contact => contact.youContact === 1)).map((contact, index) => (
                <div key={`${contact.id}_${index}`} onClick={async () => {
                    props.setLoading(true);

                    setInitScroll(0);
                    setScrollTop(0);

                    setSender(contact);
                    setMessages(await getMessages(contact));
                    webSocket.current.informPreview(contact.id);
                    setPageMessage(1);
                    props.setLoading(false);
                    disableNotification(contact.id);
                    scrollDivBottom();
                }} className="d-flex align-items-center justify-content-between my-2 p-1 cardContact">
                    <PhotoUser base64={contact.photo} isGroup={contact.id_group ? true : false} />
                    <div className="d-flex flex-column px-2 descCardContact">
                        <label>{contact.name}</label>
                    </div>
                    <FontAwesomeIcon className={contact.notification === 1 ? "text-success" : "text-muted"} icon={contact.notification === 1 ? "fa-envelope" : "fa-envelope-open-text"} />
                </div>
            ))
        )
    }
    // Função de comparação para ordenação alfabética pelo nome
    function filterByName(array, keyName, value) {
        setContactList(array.filter(object => object[keyName].toUpperCase().includes(value.toUpperCase())))
    }
    function disableNotification(id) {
        let list = contactList;
        let pointer = 0;
        list.forEach((contact, index) => { if (contact.id === id) pointer = index })
        let contact = list[pointer];
        contact.notification = 0;
        contact.notification = 0;
        list[pointer] = contact;
        setContactList([...list]);
    }
    async function getMessages(contact, messagePage) {
        let page = messagePage || 1;
        let connection = new Connection();
        let req = await connection.get(`&pages=${page}&id_user=${user.id}&id_send=${contact.id}`, "CLPP/Message.php");
        req.pages && setLimitPageMessage(req.pages);
        let reqMessage = req.data ? req.data.reverse() : [];
        let listMessage = [];
        reqMessage.forEach(item => listMessage.push(convertMessage(item)));
        return listMessage;
    }
    function convertMessage(message) {
        let convert = new Message(message.id_user, message.message, message.notification, message.type);
        return convert;
    }
    function contactsSection() {
        return (
            contactList.sort(orderName).map((contact, index) => (
                <div key={`${contact.id}_${index}`} onClick={async () => {
                    setContacts(!contacts);
                    setSender(contact);
                    setMessages(await getMessages(contact));
                }}
                    className="d-flex align-items-center  my-2 p-1 cardContact">
                    <PhotoUser base64={contact.photo} isGroup={contact.id_group ? true : false} />
                    <div className="d-flex flex-column px-4 descCardContact">
                        <label className="labelNameContact">{contact.name}</label>
                        <label className="labelDetailsContact"><b>{contact.departament} - {contact.sub}</b> ({contact.shop})</label>
                    </div>
                    {/*
                        <FontAwesomeIcon className={contact.notification === 1 ? "text-success" : "text-muted"} icon={contact.notification === 1 ? "fa-envelope" : "fa-envelope-open-text"} />
                    */}

                </div>
            ))
        );
    }
    async function logoff() {
        let clpp = new IndexedDB();
        await clpp.deleteObject(parseInt(localStorage.id_clpp) || 0).then(() => {
            navigate('/login')
        }).catch((error) => {
            console.error('Erro ao excluir o objeto:', error);
        });
    }
    function orderList(list) {
        let newList = list.sort((a, b) => {
            if (a.notification === 1 && b.notification === 0) {
                return -1;
            } else if (a.notification === 0 && b.notification === 1) {
                return 1;
            } else {
                return 0;
            }
        });
        return newList;
    }
    function orderName(a, b) {
        var nameA = a.name.toUpperCase();
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    }
    function chatAside() {
        return (
            <aside>
                {sender.name
                    &&
                    <div className="d-flex flex-column h-100 justify-content-between">
                        <div id='chatAsideHeader' className="d-flex align-items-center justify-content-between">
                            <div className="p-1 d-flex align-items-center">
                                <PhotoUser base64={sender.photo} />
                                <label className="mx-2">{sender.name}</label>
                            </div>
                            <FontAwesomeIcon icon={parseInt(sender.pendingMessage) === 0 ? 'fa-check-double' : 'fa-check'} className={`mx-2 ${parseInt(sender.pendingMessage) === 0 ? 'text-success' : 'text-muted'}`} />
                        </div>
                        <div id='chatAsideBody' className="d-flex flex-column" ref={scrollableDivRef} onScroll={async (event) => {
                            await getPage(event);
                            if ((scrollTop - scrollableDivRef.current.scrollTop > 0) && monitorScroll) {
                                setMonitorScroll(false);
                            } else if (!monitorScroll && (scrollTop - scrollableDivRef.current.scrollTop <= 0)) {
                                setMonitorScroll(true);
                            }
                        }}>
                            {messages.map((message, index) =>
                                <div key={`${message.id_user}_MSG_DIV_${index}`}>
                                    <div className={parseInt(user.id) === parseInt(message.id_user) ? `message-sent ${parseInt(message.type) > 2 ? 'bg-body' : ''}` : `message-received ${parseInt(message.type) > 2 ? 'bg-body' : ''}`}>
                                        {controllerMessage(message)}
                                        {/* {parseInt(user.id) === parseInt(message.id_user) && <FontAwesomeIcon icon={parseInt(message.notification) === 0 ? 'fa-check-double' : 'fa-check'} className={`mx-2 ${parseInt(message.type) <= 2 ? 'text-light' : 'text-muted'}`} />} */}
                                    </div>
                                </div>
                            )}
                            <div className="clearfix"></div>
                        </div>
                        <div id='chatAsideFooter' className="d-flex align-items-center justify-content-around w-100 p-2">
                            {/* INcluit na primeira oportunidade:  .csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.oasis.opendocument.spreadsheet */}
                            <input id='inputFileMessage' accept="text/xml, image/png, image/jpg, image/jpeg, image/gif, video/mp4, application/pdf" className="d-none" type='file' value={fileNameMessage} onChange={(e) => sendFile(e)} />
                            <button disabled={controllerSend} className="btn" title="Anexo" onClick={() => document.getElementById('inputFileMessage').click()}>
                                <FontAwesomeIcon className={fileMessage ? "text-success" : "text-muted"} icon="fa-paperclip" />
                            </button>
                            <textarea disabled={controllerSend} value={textMessage} onKeyUp={async (event) => { if (event.key === 'Enter') await sendAllMessage() }} onChange={(e) => { setTextMessage(e.target.value) }} row={8} type="text" className="form-control" placeholder="Mensagem..." />
                            <button disabled={controllerSend} className="btn" title="Enviar" onClick={async () => await sendAllMessage()}>
                                <FontAwesomeIcon className="text-muted" icon="fa-paper-plane" />
                            </button>
                        </div>
                    </div>
                }
            </aside>
        )
    }

    async function getPage(event) {
        if (event.target.scrollTop === 0 && messages.length >= 20 && pageMessage < limitPageMessage) {
            console.error("Estou fazendo uma nova busca");
            let newPage = pageMessage + 1;
            setPageMessage(newPage);
            let reqPage = await getMessages(sender, pageMessage + 1);
            reqPage.push(...messages);
            setMessages(reqPage);
            changeScroll();
        }
    }
    function changeScroll() {
        setTimeout(() => {
            const scrollableDiv = scrollableDivRef.current;
            scrollableDiv.scrollTop = scrollableDivRef.current.scrollHeight;
            setScrollTop(scrollableDiv.scrollTop);
            scrollableDiv.scrollTop = scrollableDiv.scrollTop - initScroll;
            setInitScroll(scrollableDiv.scrollHeight);
        }, 25);
    }
    function scrollDivBottom() {
        setTimeout(() => {
            const scrollableDiv = scrollableDivRef.current;
            scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
            setScrollTop(scrollableDiv.scrollTop)
            setInitScroll(scrollableDiv.scrollHeight);
        }, 25);
    }
    async function sendAllMessage() {
        setControllerSend(true);
        let newSender = new User(null, sender);
        newSender.pendingMessage = 1;
        setSender(newSender);
        textMessage && await sendMessage(textMessage, 1); //MSG
        fileMessage && await sendMessage(fileMessage, typeFileMessage, fileNameMessage.split('.').pop()); //ARQUIVOS
        setTimeout(() => {
            scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
        }, 25);
        setControllerSend(false);
    }
    async function sendMessage(messageValue, type, extension) {
        try {
            if (messageValue.trim() !== '') {
                let connection = new Connection();
                let message = {};
                message.message = messageValue;
                message.id_user = sender.id;
                message.id_sender = user.id;
                message.type = type;
                let req = await connection.post(message, "CLPP/Message.php");
                if (req.error) throw new Error(req.message);
                clearAreaMessage();
                let newMessages = messages;
                let showMessage = extension ? `${message.id_user}_${message.id_sender}_${req.last_id}.${extension}` : messageValue;
                newMessages.push(new Message(message.id_sender, showMessage, 1, message.type));
                setMessages([...newMessages]);
                ws.informSending(2, sender.id, req.last_id);
                if (!sender.youContact) {
                    contactList.forEach(item => { if (parseInt(item.id) === parseInt(sender.id)) item.youContact = 1; })
                }
            }
        } catch (error) {
            setShow(true);
            setModalJson({ title: 'Erro!', message: error.toString(), type: 'danger' });
        }
    }
    function sendFile(event) {
        setFileNameMessage(event.target.value);
        previewFile(event.target.files[0]);
    }
    function controllerMessage(message) {
        let response;
        if (parseInt(message.type) === 1) {
            response = message.message;
        } else if (parseInt(message.type) === 2) {
            response = <img alt="Mensagem no formato de imagem." className='fileStyle' src={`http://192.168.0.99:71/GLOBAL/Controller/CLPP/uploads/${message.message}`} />;
        } else {
            response = iconFileMessage(message);
        }
        return response;
    }
    function iconFileMessage(message) {
        let style;
        let icon;
        if (parseInt(message.type) === 3) {
            style = "text-danger";
            icon = "fa-file-pdf";
        } else if (parseInt(message.type) === 4) {
            style = "text-success";
            icon = "fa-file-code"
        }
        return componentFile(message, style, icon);
    }

    function componentFile(message, style, icon) {
        return (
            <div className="d-flex flex-column fileStyle">
                <a href={`http://192.168.0.99:71/GLOBAL/Controller/CLPP/uploads/${message.message}`} target='_blank' download>
                    <FontAwesomeIcon size='3x' className={style} icon={icon} />
                </a>
                <div className="d-flex justify-content-end my-2" onClick={() => downloadFile(`http://192.168.0.99:71/GLOBAL/Controller/CLPP/uploads/${message.message}`, message.message)}>
                    <FontAwesomeIcon size='1x' className='text-dark' icon="fa-download" />
                </div>
            </div>
        );
    }

    function previewFile(file) {
        const reader = new FileReader();
        if (file) reader.readAsDataURL(file);
        reader.onloadend = () => {
            const newFile = reader.result;
            changeTypeMessageForFile(file.type);
            // console.warn(newFile.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9]+;base64,/, ""));
            // console.warn(newFile.split('base64,')[1]);
            setFileMessage(newFile.split('base64,')[1]);
        };
    }
    function downloadFile(url, name) {
        fetch(url).then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Erro ao baixar o arquivo:', error);
            });
    }

    /*
        Altera o tipo de mensagem, baseando-se no tipo de Arquivo que estou carregando
        Tipo 1 - Messagem.
        Tipo 2 - Imagem.
        Tipo 3 - PDF.
        Tipo 4 - XML.
        Tipo 5 - Planilhas.
        Tipo 6 - CSV.
    */
    function changeTypeMessageForFile(type) {
        let result = 0;
        if (type.toUpperCase().includes('IMAGE')) {
            result = 2;
        } else if (type.toUpperCase().includes('PDF')) {
            result = 3;
        } else if (type.toUpperCase().includes('XML')) {
            result = 4;
        } else if (type.toUpperCase().includes('CSV')) {
            result = 5;
        }
        else {
            console.log(type)
        }
        setTypeFileMessage(result);
    }
    function clearAreaMessage() {
        setTextMessage('');
        setFileMessage('');
        setFileNameMessage('');
        setInitScroll(0);
    }
}