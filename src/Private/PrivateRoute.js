import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import IndexedDB from '../IndexedDB/indexedDB';


export default function PrivateRoute({ children }) {
    const [user, setUser] = useState({});
    useEffect(() => {
        (async () => {
            try {
                let clpp = new IndexedDB();
                if (!localStorage.id_clpp) throw new Error("Erro");
                let user = await clpp.readObject(parseInt(localStorage.id_clpp) || 0);
                if(!user) throw new Error("Usuário não encontrado.");
                setUser({ error: false });
            } catch (error) {
                setUser({ error: true });
            }
        })();
    }, []);
    return !user['error'] ? children : <Navigate to="/login" />;
} 