import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login/Login';
import { useEffect, useState } from 'react';
import Modal from './Components/Modal';
import { HashRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './Private/PrivateRoute';
import Chat from './Chat/Chat';
import LoadingModal from './Components/LoadingModal';
import { faCheckSquare, faCoffee, faUserCircle, faLock, faBars, faAddressBook,faContactBook, faSearch, faExclamation, faEnvelope, faEnvelopeOpenText,faPaperclip, faPaperPlane, faCheckDouble, faCheck, faFilePdf, faDownload, faFileCode, faFileExcel } from '@fortawesome/free-solid-svg-icons'
library.add(faCheckSquare, faCoffee, faUserCircle, faLock, faBars, faAddressBook,faContactBook, faSearch, faExclamation, faEnvelope, faEnvelopeOpenText,faPaperclip, faPaperPlane, faCheckDouble, faCheck, faFilePdf, faDownload, faFileCode, faFileExcel);

export default function App() {
  const [modalJson, setModalJson] = useState({ title: '', message: '', type: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const appVersion = "0.1a";
        let internal = await getAppVersion("http://192.168.0.99:71/GLOBAL/Controller/CCPP/AppVersion.php?id=7");
        if (internal.error) throw new Error(internal.message);
        if (internal.data[0].version !== appVersion) throw new Error("Sua versão é incompatível. Atualize sua versão ou entre em contato com o suporte");
      } catch (error) {
        modalError(error.toString());
      }
    })();

    async function getAppVersion(url) {
      let result;
      await fetch(url)
        .then(response => response.json())
        .then(body => {
          result = body;
        }).catch(error => {
          console.error(error)
        })
      return result;
    }

    function modalError(message) {
      let values = {};
      values.message = message;
      values.title = 'Erro!';
      values.type = 'danger';
      setModalJson({ ...values });
      setShow(true);
    }
  }, []);

  return (
    <div className="App">
      <LoadingModal loading={loading} />
      <Modal show={show} setShow={setShow} title={modalJson.title} message={modalJson.message} type={modalJson.type} noClose={true} />
      <HashRouter>
        <Routes>
          <Route exact path='/chat' element={<PrivateRoute><Chat setLoading={setLoading} /></PrivateRoute>} />
          <Route path="*" element={<PrivateRoute><Chat setLoading={setLoading} /></PrivateRoute>} />
          <Route path='/chat' element={<PrivateRoute><Chat setLoading={setLoading} /></PrivateRoute>} />
          <Route path="/login" element={<Login setLoading={setLoading} />} />
        </Routes>
      </HashRouter>
    </div>
  );
}