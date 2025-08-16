let currentItems = await chrome.storage.local.get("currentItems").then(e => e?.currentItems) || ["issues", "pulls"]

let actions = await fetch("./actions.json").then(e => e.json())

// Initialize the UI
function initializeUI() {
    actions.forEach(action => {
        const checkboxItem = document.createElement('div')
        checkboxItem.className = 'checkbox-item'
        checkboxItem.innerHTML = `
            <input id="${action.id}" type="checkbox"/>
            <label for="${action.id}">${action.name}</label>
        `
        document.getElementById("items").appendChild(checkboxItem)
        
        const checkbox = document.getElementById(action.id)
        checkbox.checked = currentItems.includes(action.id)
        checkbox.addEventListener("change", e => {
            e.target.checked ? addItem(e.target.id) : removeItem(e.target.id)
        })
    })
}

// Drag and drop functionality
let draggedElement = null
let draggedIndex = -1

function initializeDragAndDrop() {
    const dragList = document.getElementById('currentItems')
    const dragContainer = document.querySelector('.drag-container')
    
    dragList.addEventListener('dragover', handleDragOver)
    dragList.addEventListener('drop', handleDrop)
    dragList.addEventListener('dragleave', handleDragLeave)
    
    // Add container-level drag events
    dragContainer.addEventListener('dragenter', handleDragEnter)
    dragContainer.addEventListener('dragover', handleDragOver)
    dragContainer.addEventListener('drop', handleDrop)
}

function handleDragEnter(e) {
    e.preventDefault()
    e.currentTarget.classList.add('drag-active')
}

function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    const dragItem = e.target.closest('.drag-item')
    if (dragItem && dragItem !== draggedElement) {
        // Remove drag-over from all items first
        document.querySelectorAll('.drag-item').forEach(item => {
            item.classList.remove('drag-over')
        })
        dragItem.classList.add('drag-over')
    }
}

function handleDrop(e) {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-active')
    
    const dropTarget = e.target.closest('.drag-item')
    
    if (dropTarget && draggedElement && draggedIndex !== -1) {
        const allItems = Array.from(dropTarget.parentNode.querySelectorAll('.drag-item'))
        const dropIndex = allItems.indexOf(dropTarget)
        
        console.log(`Moving item from index ${draggedIndex} to index ${dropIndex}`)
        
        // Ensure indices are valid
        if (draggedIndex >= 0 && draggedIndex < currentItems.length && 
            dropIndex >= 0 && dropIndex < currentItems.length) {
            moveItem(draggedIndex, dropIndex)
        }
    }
    
    clearDragState()
}

function handleDragLeave(e) {
    // Only remove drag-over if we're leaving the drag container entirely
    if (!e.target.closest('.drag-container')) {
        document.querySelectorAll('.drag-item').forEach(item => {
            item.classList.remove('drag-over')
        })
        e.currentTarget.classList.remove('drag-active')
    }
}

function clearDragState() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging')
        draggedElement = null
    }
    draggedIndex = -1
    document.querySelectorAll('.drag-item').forEach(item => {
        item.classList.remove('drag-over')
    })
    document.querySelector('.drag-container').classList.remove('drag-active')
}

function makeDraggable(element, index) {
    element.draggable = true
    
    element.addEventListener('dragstart', (e) => {
        draggedElement = element
        draggedIndex = parseInt(element.dataset.index)
        element.classList.add('dragging')
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())
        
        console.log(`Started dragging item at index ${draggedIndex}`)
    })
    
    element.addEventListener('dragend', clearDragState)
}

function addItem(id){
    if (!currentItems.includes(id)) {
        currentItems.push(id)
        writeTable()
    }
}

function removeItem(id){
    currentItems = currentItems.filter(item => item !== id)
    writeTable()
}

function moveItem(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= currentItems.length || toIndex >= currentItems.length) {
        console.log(`Invalid move: from ${fromIndex} to ${toIndex}`)
        return
    }
    
    console.log(`Moving item from ${fromIndex} to ${toIndex}`)
    console.log('Before move:', [...currentItems])
    
    const item = currentItems.splice(fromIndex, 1)[0]
    currentItems.splice(toIndex, 0, item)
    
    console.log('After move:', [...currentItems])
    writeTable()
}

function upItem(index){
    if (index > 0 && currentItems[index - 1]) {
        moveItem(index, index - 1)
    }
}

function downItem(index){
    if (index < currentItems.length - 1 && currentItems[index + 1]) {
        moveItem(index, index + 1)
    }
}

function writeTable(){
    const target = document.getElementById("currentItems")
    target.innerHTML = ""
    chrome.storage.local.set({"currentItems": currentItems})
    
    currentItems.forEach((item, index) => {
        const itemDict = actions.find(e => item === e.id)
        const dragItem = document.createElement('div')
        dragItem.className = 'drag-item'
        dragItem.dataset.index = index
        dragItem.innerHTML = `
            <div class="drag-handle">⋮⋮</div>
            <div class="drag-item-name">${itemDict.name}</div>
            <div class="drag-actions">
                <a class="drag-action" id="up${item}" href="#!" title="Move Up">↑</a>
                <a class="drag-action" id="down${item}" href="#!" title="Move Down">↓</a>
            </div>
        `
        
        target.appendChild(dragItem)
        
        // Make item draggable
        makeDraggable(dragItem, index)
        
        // Add event listeners for up/down buttons
        document.getElementById(`up${item}`).addEventListener("click", (e) => {
            e.preventDefault()
            upItem(index)
        })
        document.getElementById(`down${item}`).addEventListener("click", (e) => {
            e.preventDefault()
            downItem(index)
        })
    })
}

// Initialize everything
initializeUI()
initializeDragAndDrop()
writeTable()