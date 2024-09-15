let currentURL = location.href
function waitTargetElement(){
    return new Promise(resolve => {
        let interval  = setInterval(() => {
            if(document.querySelector(".AppHeader-actions")){
                resolve()
                clearInterval(interval)
            }
        }, 100)
    })
}

function getUserName(){
    return document.querySelector("meta[name='user-login']").content
}

function writeQuickActionElement(name, href, icon, userName){
    let hrefReplaced = href.replace("$NAME", userName)
    document.querySelector(".AppHeader-actions").insertAdjacentHTML("beforeend",`
        <a title="${name}" href="${hrefReplaced}" data-view-component="true" class="Button Button--iconOnly Button--secondary Button--medium AppHeader-button color-fg-muted">
            ${icon}
        </a>
    `)
}

setInterval(() => {
    if(currentURL != location.href){
        currentURL = location.href
        main()
    }
}, 100)

async function main(){
    await waitTargetElement()
    let actions = await fetch(chrome.runtime.getURL("./actions.json")).then(e => e.json())
    let currentItems = await chrome.storage.local.get("currentItems").then(e => e?.currentItems) || ["issues", "pulls"]
    let userName = getUserName()

    currentItems.forEach(item => {
        let itemDict = actions.find(e => item == e.id)
        writeQuickActionElement(itemDict.name, itemDict.href, itemDict.icon, userName)
    })
}
main()
