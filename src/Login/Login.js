import logo from '../Assets/Image/CLPP.png'
import React, { useEffect, useState } from "react";
import InputField from "../Components/InputField";
import './Login.css'
// import { Alert } from 'react-bootstrap';
import Modal from '../Components/Modal';
import { Connection } from '../ApiRest';
import PasswordDefault from '../Components/PasswordDefault';
import IndexedDB from '../IndexedDB/indexedDB';
import Util from '../Util/Util';
import { useNavigate } from 'react-router-dom';
export default function Login(props) {
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [defaultPasswordView, setDefaultPasswordView] = useState(false);
    const [modalJson, setModalJson] = useState({ title: '', message: '', type: '' });
    const [Jclpp, setJclpp] = useState({
        login: '',
        session: '',
        administrator: '',
        validate: '',
    });
    // useEffect(() => { console.log(modalJson); }, [modalJson])
    return (
        <div id='pageLogin' className="d-flex align-items-center justify-content-center h-100 w-100">
            <Modal show={show} setShow={setShow} title={modalJson.title} message={modalJson.message} type={modalJson.type} />
            <PasswordDefault user={login} password={password} show={defaultPasswordView} setShow={setDefaultPasswordView} showValueModal={setModalJson} setShowModal={setShow} />
            <form className="form form-control d-flex flex-column align-items-center rounded">
                <img src={logo} alt='Logo' />
                <fieldset className='d-flex flex-column h-50'>
                    <InputField
                        label={'Login'}
                        typeInput={'text'}
                        icon='fa-user-circle'
                        setValue={setLogin}
                        valueInput={login}
                    />
                    <InputField
                        label={'Senha'}
                        typeInput={'password'}
                        icon='fa-lock'
                        setValue={setPassword}
                        valueInput={password}
                    />
                </fieldset>
                <button className='btn btn-outline-success w-25 my-1' type='button' onClick={async () => {
                    props.setLoading(true);
                    await loginButton();
                    props.setLoading(false);
                }}>Login</button>
            </form>
        </div>
    );

    function modalError(message) {
        let values = modalJson;
        values.message = message;
        values.title = 'Erro!';
        values.type = 'danger';
        setModalJson({ ...values });
        setShow(true);
    }
    async function loginButton() {
        try {
            const connection = new Connection();
            let body = { user: login.trim(), password: password }
            let request = await connection.postLogin(body, "CCPP/Login.php");
            if (request.error) throw new Error(request.message);
            await registerUser(request.data);
            navigate("/chat");
        } catch (error) {
            if (!error.toString().includes('Default password')) {
                modalError(error.toString());
            } else {
                setDefaultPasswordView(true);
            }
        }
    }
    async function registerUser(user) {
        let clpp = new IndexedDB();
        localStorage.setItem('id_clpp', user.id);
        clpp.openDatabase((error) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Objeto criado com sucesso!');
            }
        });
        setJclpp({ ...await changeJclpp(user) });
        clpp.createObject(Jclpp, (error) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Objeto criado com sucesso!');
            }
        });
    }
    async function changeJclpp(user) {
        return new Promise((resolve, reject) => {
            try {
                let newClpp = Jclpp;
                let utils = new Util();
                newClpp.login = user.id;
                newClpp.session = user.session;
                newClpp.administrator = user.administrator;
                newClpp.validate = utils.toDay();
                resolve(newClpp);
            } catch (e) {
                reject(e)
            }
        })
    }
}