let currentItems = await chrome.storage.local.get("currentItems").then(e => e?.currentItems) || ["issues", "pulls"]

let actions = await fetch("./actions.json").then(e => e.json())
actions.forEach(action => {
    document.getElementById("items").insertAdjacentHTML("beforeend",`
        <input id="${action.id}" type="checkbox"/>
        <label for="${action.id}">${action.name}</label><br>
    `)
    document.getElementById(action.id).checked =  currentItems.includes(action.id)
    document.getElementById(action.id).addEventListener("change", e => {
        e.target.checked ? addItem(e.target.id) : removeItem(e.target.id)
    })
})

writeTable()

function addItem(id){
    currentItems.push(id)
    writeTable()
}

function removeItem(id){
    currentItems = currentItems.filter(item => item !== id)
    writeTable()
}

function upItem(index){
    if(currentItems[index - 1]){
        let move = currentItems.splice(index, 1)[0]
        currentItems.splice(index - 1, 0, move)
        writeTable()
    }
}

function downItem(index){
    if(currentItems[index + 1]){
        let move = currentItems.splice(index, 1)[0]
        currentItems.splice(index + 1, 0, move)
        writeTable()
    }
}

function writeTable(){
    let target = document.getElementById("currentItems")
    target.innerHTML = ""
    chrome.storage.local.set({"currentItems": currentItems})
    currentItems.forEach((item, index) => {
        let itemDict = actions.find(e => item == e.id)
        target.insertAdjacentHTML("beforeend",`
            <tr>
                <th>${itemDict.name}</th>
                <th><a id="up${item}" href="#!">↑</a></th>
                <th><a id="down${item}"  href="#!">↓</a></th>
            </tr>
        `)
        document.getElementById(`up${item}`).addEventListener("click", () => upItem(index))
        document.getElementById(`down${item}`).addEventListener("click", () => downItem(index))
    })
}