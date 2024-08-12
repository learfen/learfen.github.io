let keyboard
let app
let keyScreen 

function useButtonShift(){
    document.addEventListener('keydown', event => {
        event.preventDefault()
        if(event.key == 'Shift'){
            keyboard.classList.add('key-uppercase')
        }
    })
    document.addEventListener('keypress', event => {
        event.preventDefault()
    })
    document.addEventListener('keyup', event => {
        event.preventDefault()
        if(event.key == 'CapsLock'){
            keyboard.classList.toggle('key-uppercase')
            keyboard.classList.toggle('key-uppercase-lock')
        }else{
            if(event.key == 'Shift' && !keyboard.classList.contains('key-uppercase-lock')){
                keyboard.classList.remove('key-uppercase')
            }
        }
        console.log(event)
        keyScreen.innerHTML = `${event.key} ${event.code}`
    })
}

function installSvg(){
    const svgs = Array.from(document.querySelectorAll("[svg]"))
    for(let icon of svgs){
        fetch(`./images/${icon.getAttribute("svg")}.svg`)
        .then( async res => {
            icon.innerHTML = await res.text()
        })
    }
}


window.onload = async () => {
    app = document.querySelector("#app")
    const data = await fetch("./app.html")
    app.innerHTML = await data.text()
    setTimeout(()=>{

        keyboard = document.querySelector('.keyboard')
        installSvg()

        keyScreen = document.querySelector("#key")
        keyScreen.innerHTML = "#"

        useButtonShift()

        document.addEventListener("click", event => {
            const target = nodo => {
                keyScreen.innerHTML = nodo.getAttribute("name")
                const buttonsActive = Array.from( document.querySelectorAll(".key-active" ) )
                for(let button of buttonsActive) {
                    button.classList.remove("key-active")
                }
                const buttons = Array.from(document.querySelectorAll("[name="+nodo.getAttribute("name")+"]"))
                for(let button of buttons){
                    button.classList.add("key-active")
                }
            }
            if(event.target.classList.contains("keys")){
                target( event.target )
                return 0
            }
            if(event.target.parentNode.classList.contains("keys")){
                target( event.target.parentNode )
                return 0
            }
            if(event.target.parentNode.parentNode.classList.contains("keys")){
                target( event.target.parentNode.parentNode )
                return 0
            }
        })
    }, 500)
}