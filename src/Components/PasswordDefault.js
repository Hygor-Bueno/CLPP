/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import './passwordDefaultDiv.css'
import InputField from "./InputField";
import { Connection } from "../ApiRest";
export default function PasswordDefault(props) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    if (props.show) {
        return (
            <div id="passwordDefaultDiv">
                <div className='rounded form-control'>
                    <header className="d-flex justify-content-center align-items-center">
                        <strong>Alterar senha</strong>
                        <button onClick={() => props.setShow(false)} title="Fechar a página." className='btn btn-danger rounded-circle p-0'><b>X</b></button>
                    </header>
                    <section className="d-flex flex-column align-items-center justify-content-center">
                        <InputField
                            mandatory={true}
                            valueInput={newPassword}
                            setValue={setNewPassword}
                            label={"Nova senha"}
                            disabledInput={false}
                            typeInput="password"
                        />
                        <InputField
                            mandatory={true}
                            label={"Confirmar senha"}
                            disabledInput={false}
                            valueInput={confirmPassword}
                            typeInput="password"
                            setValue={setConfirmPassword}
                        />
                    </section>
                    <footer className="d-flex flex-column align-items-center justify-content-center">
                        <button className="btn btn-success w-50" type='button' title="Salvar" onClick={async () => {
                            try {
                                let validation = validate();
                                if (validation.error) throw new Error(validation.message);
                                let update = await updatePassword();
                                if (update.error) throw new Error(update.message);
                                updateSuccess();
                            } catch (error) {
                                props.showValueModal({ type: 'danger', title: 'Erro!', message: error.toString() });
                                props.setShowModal(true);
                            }
                        }}>Salvar</button>
                    </footer>
                </div>
            </div>
        )
    }
    function validate() {
        let result = { error: false, message: '' }
        let isEquals = validateEquals(newPassword, confirmPassword);
        let passLenght = validateLength(newPassword);
        if (isEquals.error) {
            result.error = true;
            result.message += `${isEquals.message} \n`
        }
        if (passLenght.error) {
            result.error = true;
            result.message += `${passLenght.message}\n`
        }
        return result;
    }

    function validateEquals(password, confirm) {
        let result = { error: false, message: '' }
        if (password !== confirm) {
            result.error = true;
            result.message = "As senhas não conferem."
        }
        return result;
    }
    function validateLength(password) {
        let result = { error: false, message: '' }
        if (password.length < 8) {
            result.error = true;
            result.message = "Os valores não atingiram a requisião mínima de 8 caracteres."
        }
        return result;
    }
    async function updatePassword() {
        let connection = new Connection();
        let update = {
            new_password: newPassword,
            confirm_password: confirmPassword,
            user: props.user,
            password: props.password
        };
        let response = await connection.putDefaltPassw(update, 'CCPP/Login.php');
        return response;
    }
    function updateSuccess() {
        props.setShow(false);
        props.showValueModal({ type: 'success', title: 'Sucesso!', message: 'Senha Alterada com sucesso' });
        props.setShowModal(true);
    }
}