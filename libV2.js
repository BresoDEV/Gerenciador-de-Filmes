const dbName = "filmesDB";
const storeName = "filmes";
let db;

// Abrir ou criar o banco
const request = indexedDB.open(dbName, 2);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Banco de dados pronto.");
};

request.onerror = function (event) {
    console.log("Erro ao abrir IndexedDB: " + event.target.errorCode);
};


function SQL_setItem(id, valor) {
    const trans = db.transaction([storeName], "readwrite");
    const store = trans.objectStore(storeName);
    store.add({ id, valor });
    trans.oncomplete = () => console.log(`Criado: [${id}] ${valor}`);
}




function SQL_updateItem(id, valor) {
    const trans = db.transaction([storeName], "readwrite");
    const store = trans.objectStore(storeName);
    store.put({ id, valor });
    trans.oncomplete = () => console.log(`Editado: [${id}] ${valor}`);
}


function SQL_delete(id) {
    const trans = db.transaction([storeName], "readwrite");
    const store = trans.objectStore(storeName);
    store.delete(id);
    trans.oncomplete = () => console.log(`Removido item com ID: ${id}`);
}

function SQL_getItem(id) {
    const trans = db.transaction([storeName], "readonly");
    const store = trans.objectStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => {
        if (req.result) {
            console.log(`Lido: [${req.result.id}] ${req.result.valor}`);
        } else {
            console.log(`Item com ID ${id} não encontrado.`);
        }
    };
}

function SQL_getAllItens() {
    const trans = db.transaction([storeName], "readonly");
    const store = trans.objectStore(storeName);
    const req = store.openCursor();
    let output = "";
    req.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            output += `SQL_setItem("${cursor.value.id}", "${cursor.value.valor}");\n`;
            cursor.continue();
        } else {
            document.getElementById('galeriaVHS').innerHTML = `

            <div>
              <textarea>${output}</textarea>
            </div>
    
            `
        }
    };
}


function SQL_deleteAll() {
    const trans = db.transaction([storeName], "readwrite");
    const store = trans.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => console.log("Todos os itens foram apagados.");
}

function SQL_id_Exist(id) {
    const trans = db.transaction([storeName], "readonly");
    const store = trans.objectStore(storeName);
    const req = store.get(id);

    setTimeout(() => {
        req.onsuccess = function () {
            if (req.result) {
                //console.log(`ID ${getKey()} existe:`, req.result);
                return true;
            } else {
                //console.log(`ID ${getKey()} NÃO existe.`);
                return false;
            }
        };

        req.onerror = function () {
            console.log("Erro ao verificar:", req.error);
        };
    }, 1000);
}


navigator.storage.estimate().then(estimate => {
    console.log(`\n\nIndexedDB: \nUsado: ${estimate.usage}\nMáximo: ${estimate.quota}`)
    //
});


setTimeout(() => {
    reloadCapas()
}, 1000);


///funcoes so pro site de filmes


function addCapa(nome, filme) {

    var infos = filme.split('|')

    const seed = Math.floor(Math.random() * 99999999);

    //---------------------------
    const div = document.createElement('div')
    div.className = 'filme'

    const img = document.createElement('img')
    img.id = seed;
    img.src = infos[0];

    //-----------------------
    addBorda(img, infos[2])
    //------------------------

    div.appendChild(img)


    try {

        if (infos[2].includes('DVD')) {
            document.getElementById('galeriaDVD').appendChild(div)
        }
        if (infos[2].includes('VHS')) {
            document.getElementById('galeriaVHS').appendChild(div)
        }
    } catch (error) {

        // <div id="galeriaVHS" class="galeria"></div>
        document.getElementById('erro').style.display = 'block'

        console.log('SQL_delete("' + nome + '");')
        var a = nome.split('|')[0]
        var b = nome.split('|')[2]
        console.log('SQL_setItem("' + a + '","' + infos + '||' + b + '");')

        document.getElementById('erroT').value += 'SQL_delete("' + nome + '");'
        document.getElementById('erroT').value += 'SQL_setItem("' + a + '","' + infos + '||' + b + '");'
        //console.log(nome)
        return
    }


    //---------------------------




    document.getElementById(seed).addEventListener('click', () => {

        document.getElementById('Observacoes').value = infos[1]
        document.getElementById('Capa').value = infos[0]
        document.getElementById('Nome').value = nome//infos[0]
        document.getElementById('Categoria').value = infos[2]


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    })
}

function reloadCapas(busca = 'null') {

    document.getElementById('galeriaDVD').innerHTML = ''
    document.getElementById('galeriaVHS').innerHTML = ''

    const trans = db.transaction([storeName], "readonly");
    const store = trans.objectStore(storeName);
    const req = store.openCursor();
    let output = "";
    req.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {

            if (busca !== 'null') {
                if (cursor.value.id.toLowerCase().includes(busca.toLowerCase())) {
                    addCapa(cursor.value.id, cursor.value.valor)
                }
            }
            else {
                addCapa(cursor.value.id, cursor.value.valor)
            }
            // output += `[${cursor.value.id}] ${cursor.value.valor}\n`;
            cursor.continue();
        } else {
            //return output;
            console.log("Tudo carregado")
        }
    };
}



function addBorda(elemento, info, borda = '2px') {

    if (info == 'DVD - Midia Fisica Completa') {
        elemento.style.border = borda + ' solid rgb(71, 192, 109)'
    }
    if (info == 'VHS - Fita Completa') {
        elemento.style.border = borda + ' solid rgb(71, 192, 109)'
    }



    if (info == 'DVD - ISO Pronto') {
        elemento.style.border = borda + ' solid rgb(113, 179, 224)'
    }
    if (info == 'DVD - Apenas Midia Digital') {
        elemento.style.border = borda + ' solid rgb(254, 254, 254)'
    }
    if (info == 'DVD - Midia Fisica Sem Nada') {
        elemento.style.border = borda + ' solid rgb(251, 242, 64)'
    }
    if (info == 'DVD - Midia Fisica Com Capa') {
        elemento.style.border = borda + ' solid rgb(161, 64, 251)'
    }
    if (info == 'VHS - Fita sem estojo') {
        elemento.style.border = borda + ' solid rgb(228, 176, 45)'
    }
    if (info == 'VHS - Fita com Estojo e Sem Encarte') {
        elemento.style.border = borda + ' solid rgb(251, 242, 64)'
    }
    if (info == 'VHS - Fita Mofada') {
        elemento.style.border = borda + ' solid red'
    }


}