console.log("Sistema da Biblioteca carregado");

const adminIcon = document.getElementById("adminIcon");
const loginBox = document.getElementById("loginAdmin");
const menuAdmin = document.getElementById("menuAdmin");

adminIcon.addEventListener("click", () => {

    const adminLogado = localStorage.getItem("admin");

    if(adminLogado){

        menuAdmin.classList.toggle("hidden");

    }else{

        loginBox.classList.remove("hidden");

    }

});

function loginAdmin(){

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if(
        usuario === "carolina.carvalho" &&
        senha === "CC#1212*Admin"
    ){

        alert("Bem-vinda Administradora");

        localStorage.setItem("admin","true");

        loginBox.classList.add("hidden");

    }
    else{

        alert("Usuário ou senha incorretos");

    }

}

function logoutAdmin(){

    localStorage.removeItem("admin");

    menuAdmin.classList.add("hidden");

    alert("Você saiu do modo administrador");

}

/* ABRIR PÁGINAS DO SISTEMA */

function abrirPagina(pagina){

    const servidor = "http://localhost:3000";

    window.location.href = servidor;

}

/* ========================= */
/* CARREGAR LIVROS DO BANCO */
/* ========================= */

async function carregarLivros(){

    try{

        const resposta = await fetch("http://localhost:3000/livros");

        const livros = await resposta.json();

        const grid = document.querySelector(".grid-livros");

        grid.innerHTML = "";

        livros.forEach(livro => {

            const div = document.createElement("div");

            div.classList.add("livro");

            div.innerHTML = `
                <img src="${livro.capa}">
                <h3>${livro.titulo}</h3>
                <p>${livro.autor}</p>
            `;

            grid.appendChild(div);

        });

    }
    catch(erro){

        console.error("Erro ao carregar livros:", erro);

    }

}

/* carregar livros quando abrir o site */

window.addEventListener("load", carregarLivros);