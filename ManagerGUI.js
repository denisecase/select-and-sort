// ManagerGUI.js

const managerList = new ManagerList();
// managerList.clearAllLocalStorage();

document.addEventListener("DOMContentLoaded", function () {
  initializeLists();
  attachEventListeners();
});

function attachEventListeners() {
  attachListEventListeners();
  attachFormEventListeners();
  attachItemEventListeners();
  attachButtonEventListeners();
}

function attachListEventListeners() {
  const lists = document.querySelectorAll(".draggable");
  lists.forEach((list) => {
    list.addEventListener("dragover", handleDragOver);
    list.addEventListener("drop", handleDrop);
  });
}

function attachFormEventListeners() {
  document.querySelector("#selected-form").addEventListener("submit", (e) => handleFormSubmit(e, "selected"));
  document.querySelector("#option-form").addEventListener("submit", (e) => handleFormSubmit(e, "option"));
}

function attachItemEventListeners() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      handleItemDelete(e);
    }
  });
}

function attachButtonEventListeners() {
  document.querySelector("#selected-clear").addEventListener("click", () => clearAll("selected"));
  document.querySelector("#option-clear").addEventListener("click", () => clearAll("option"));
}

function clearAll(listName) {
  const listElement = document.querySelector(`#${listName}-list`);
  listElement.innerHTML = "";
  localStorage.removeItem(`${listName}-items`);
}

function initializeLists() {
  const lists = ["selected", "option"];
  lists.forEach((listName) => {
    initializeList(listName);
  });
}

function initializeList(listName) {
  const itemsObj = managerList.getItemsFromStorage(listName);
  const listElement = document.querySelector(`#${listName}-list`);
  listElement.innerHTML = ""; // Clear current list
  Object.entries(itemsObj).forEach(([itemId, itemText]) => {
    console.log(`Adding item to list: ${listName}, Item ID: ${itemId}, Text: ${itemText}`);
    addListItem(listElement, itemText, itemId);
  });
  makeListDraggable(listName);
}

function addListItem(listElement, itemText, itemId) {
  const itemElement = document.createElement("li");
  itemElement.id = itemId || managerList.getNextItemId();
  itemElement.draggable = true;
  itemElement.innerHTML = `${itemText} <span class="delete-btn">X</span>`;
  listElement.appendChild(itemElement);
}

function handleFormSubmit(e, listName) {
  e.preventDefault();
  const inputElement = document.querySelector(`#${listName}-entry`);
  const newItemText = inputElement.value.trim();
  if (newItemText) {
    const listElement = document.querySelector(`#${listName}-list`);
    const itemId = managerList.addItemToList(listName, newItemText);
    addListItem(listElement, newItemText, itemId);
    inputElement.value = ""; // Clear input
  }
}

function handleDragStart(e) {
  const itemId = e.target.id;
  const itemText = e.target.textContent.trim(); // Extract text content of item
  console.log(`Dragging item with ID: ${itemId} and Text: ${itemText}`);

  e.dataTransfer.setData("text/plain", e.target.id);
  e.dataTransfer.effectAllowed = "move";
  e.target.classList.add("dragging");
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  const existingPlaceholder = document.querySelector(".drop-placeholder");
  if (existingPlaceholder) {
    existingPlaceholder.remove();
  }
}

function handleDragOver(e) {
  console.log("handleDragOver called");
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const listElement = e.currentTarget;
  const afterElement = getDragAfterElement(listElement, e.clientY);
  updateDropPlaceholder(listElement, afterElement);
}

function handleDrop(e) {
  console.log("handleDrop called");
  e.preventDefault();
  const listElement = e.currentTarget;
  const draggedElementId = e.dataTransfer.getData("text/plain");
  const draggedItem = document.getElementById(draggedElementId);
  if (!draggedItem || !listElement) {
    console.error("Dragged item or target list not found.");
    return;
  }
  finalizeDrop(listElement, draggedItem);
}

function finalizeDrop(listElement, draggedItem) {
  const targetListName = listElement.id.split("-")[0];
  const sourceListName = draggedItem.parentNode.id.split("-")[0];
  const placeholder = document.querySelector(".drop-placeholder");
  const newPosition = findNewPosition(listElement, placeholder);
  managerList.moveItem(sourceListName, targetListName, draggedItem.id, newPosition);
  draggedItem.classList.remove("dragging");
  if (placeholder) {
    placeholder.remove();
  }
  
  // Redraw  list to reflect  new order
  if (sourceListName === targetListName) {
    initializeList(targetListName);
  } else {
    // If items were moved between lists, reinitialize both
    initializeList(sourceListName);
    initializeList(targetListName);
  }
}

function handleItemDelete(e) {
  const listItem = e.target.closest("li");
  const listId = listItem.parentNode.id;
  const listName = listId.split("-")[0];
  managerList.removeItemFromList(listName, listItem.id);
  listItem.remove();
}

function findNewPosition(listElement, placeholder) {
  const items = Array.from(listElement.children); // Get all children, including `li` and placeholder `div`
  const draggableItems = items.filter((item) => item.matches("li:not(.dragging)")); // Filter only draggable items
  const placeholderIndex = items.indexOf(placeholder); // Find index of placeholder among all children

  console.log(
    "Draggable items in list:",
    draggableItems.map((item) => item.textContent.trim())
  );
  console.log(
    "All children in list:",
    items.map((item) => item.outerHTML)
  );
  console.log("Placeholder index among all children:", placeholderIndex);

  if (placeholderIndex === -1) {
    console.warn("Placeholder not found within the list children.");
    return draggableItems.length;
  }

  return placeholderIndex;
}

// Helper function to determine the position to insert the dragged item
function getDragAfterElement(listElement, y) {
  const draggableElements = [...listElement.querySelectorAll("li:not(.dragging)")];

  const result = draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2; // Distance from the middle of the child element

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  );
  return result.element;
}

function makeListDraggable(listName) {
  const listItems = document.querySelectorAll(`#${listName}-list li`);
  listItems.forEach((item) => {
    if (!item.id) {
      item.id = "item-" + Date.now();
    }
    item.draggable = true;
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
  });
}
function createDropPlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.classList.add("drop-placeholder");
  return placeholder;
}

function updateDropPlaceholder(listElement, afterElement) {
  const existingPlaceholder = document.querySelector(".drop-placeholder");
  if (existingPlaceholder) {
    existingPlaceholder.remove();
  }
  const placeholder = createDropPlaceholder();
  if (afterElement) {
    listElement.insertBefore(placeholder, afterElement);
  } else {
    listElement.appendChild(placeholder);
  }
}
