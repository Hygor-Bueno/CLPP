export default class IndexedDB {
    // Abrir conexão com o banco de dados
    openDatabase(callback) {
        var request = window.indexedDB.open('CLPP', 1);
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            // Cria uma object store (armazenamento de objetos) para armazenar os dados
            var objectStore = db.createObjectStore('login', { keyPath: 'login', unique: true });
            // Cria um índice para permitir a pesquisa por nome
            objectStore.createIndex('session', 'session', { unique: false });
            objectStore.createIndex('administrator', 'administrator', { unique: false });
            objectStore.createIndex('validate', 'validate', { unique: false });
        };
        request.onsuccess = function (event) {
            var db = event.target.result;
            callback(null, db);
        };
        request.onerror = function (event) {
            callback('Erro ao abrir o banco de dados.', null);
        };
    }

    // Criar um novo objeto
    createObject(objeto, callback) {
        this.openDatabase(function (error, db) {
            if (error) {
                callback(error);
                return;
            }
            var transaction = db.transaction(['login'], 'readwrite');
            var objectStore = transaction.objectStore('login');
            var request = objectStore.add(objeto);
            request.onsuccess = function (event) {
                callback(null);
            };
            request.onerror = function (event) {
                callback('Erro ao criar o objeto.');
            };
        });
    }

    // Ler um objeto por ID
    readObject(id) {
        return new Promise(async (resolve, reject) => {
            new IndexedDB().openDatabase(function (error, db) {
                if (error) {
                    reject(error);
                    return;
                }
                var transaction = db.transaction(['login'], 'readonly');
                var objectStore = transaction.objectStore('login');
                var request = objectStore.get(id);
                request.onsuccess = function (event) {
                    var objeto = event.target.result;
                    resolve(objeto);
                };
                request.onerror = function (event) {
                    reject('Erro ao ler o objeto.');
                };
            });
        })
    }

    // Atualizar um objeto
    updateObject(objeto, callback) {
        openDatabase(function (error, db) {
            if (error) {
                callback(error);
                return;
            }
            var transaction = db.transaction(['login'], 'readwrite');
            var objectStore = transaction.objectStore('login');
            var request = objectStore.put(objeto);
            request.onsuccess = function (event) {
                callback(null);
            };
            request.onerror = function (event) {
                callback('Erro ao atualizar o objeto.');
            };
        });
    }

    // Excluir um objeto por ID:
    /*
    deleteObject(id, callback) {
        this.openDatabase(function (error, db) {
            if (error) {
                callback(error);
                return;
            }
            var transaction = db.transaction(['login'], 'readwrite');
            var objectStore = transaction.objectStore('login');
            var request = objectStore.delete(id);
            request.onsuccess = function (event) {
                callback(null);
            };
            request.onerror = function (event) {
                callback('Erro ao excluir o objeto.');
            };
        });
    }*/

    deleteObject(id) {
        return new Promise((resolve, reject) => {
            this.openDatabase((error, db) => {
                if (error) {
                    reject(error);
                    return;
                }
                const transaction = db.transaction(['login'], 'readwrite');
                const objectStore = transaction.objectStore('login');
                const request = objectStore.delete(id);

                request.onsuccess = (event) => {
                    resolve();
                };

                request.onerror = (event) => {
                    reject('Erro ao excluir o objeto.');
                };
            });
        });
    }

}
