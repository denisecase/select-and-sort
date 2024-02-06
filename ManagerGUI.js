// ManagerGUI.js

const managerList = new ManagerList();
// managerList.clearAllLocalStorage();

document.addEventListener("DOMContentLoaded", function () {
  initialize();
  attachEventListeners();
});

function attachEventListeners() {
  attachListEventListeners();
  attachFormEventListeners();
  attachItemEventListeners();
  attachButtonEventListeners();
  attachCheckboxEventListeners();
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

  document.querySelectorAll(".draggable").forEach((list) => {
    list.addEventListener("dblclick", (e) => {
      if (e.target.tagName === "LI") {
        handleItemEdit(e);
      }
    });
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      if (e.target.tagName === "INPUT") {
        const listItem = e.target.closest("li");
        revertEditing(listItem);
      }
    }
  });
}

function attachButtonEventListeners() {
  document.querySelector("#selected-clear").addEventListener("click", () => clearAll("selected"));
  document.querySelector("#option-clear").addEventListener("click", () => clearAll("option"));
}

function attachCheckboxEventListeners() {
  const checkboxes = document.querySelectorAll("[type='checkbox']");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      localStorage.setItem(this.id, this.checked); // Store checkbox state in local storage
    });
  });
}

function clearAll(listName) {
  const listElement = document.querySelector(`#${listName}-list`);
  listElement.innerHTML = "";
  localStorage.removeItem(`${listName}-items`);
}

function initialize() {
  const lists = ["selected", "option"];
  lists.forEach((listName) => {
    initializeList(listName);
  });
  initializeCheckboxes();
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

function initializeCheckboxes() {
  const checkboxes = document.querySelectorAll("[type='checkbox']");
  checkboxes.forEach((checkbox) => {
    const storedState = localStorage.getItem(checkbox.id); // Get state from local storage
    if (storedState) {
      checkbox.checked = storedState === "true"; // Set state based on stored value
    }
  });
}

function handleItemEdit(e) {
  e.stopPropagation();
  const listItem = e.target;
  // If already an input (don't nest inputs)
  if (listItem.tagName.toLowerCase() === "input") {
    return;
  }
  const currentText = listItem.textContent.replace(" X", ""); // Remove the delete button text
  console.log('Current text:', currentText);

  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.addEventListener("blur", (e) => finishEditing(listItem, input.value));
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      finishEditing(listItem, input.value);
    }
  });

  listItem.innerHTML = "";
  listItem.appendChild(input);
    // Delay focusing the input slightly
    setTimeout(() => input.focus(), 0);
}

function finishEditing(listItem, newText) {
  const listId = listItem.parentNode.id;
  const listName = listId.split("-")[0];
  newText = newText.trim();
  if (newText === "") {
    managerList.removeItemFromList(listName, listItem.id);
    listItem.remove();
  } else {
    managerList.editItemInList(listName, listItem.id, newText);
    listItem.innerHTML = `${newText} <span class="delete-btn">X</span>`;
    attachItemEventListeners(); // Reattach listeners to newly added elements
  }
  location.reload();
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
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const listElement = e.currentTarget;

  // Detect if the list is empty
  if (listElement.children.length === 0) {
    const placeholder = createDropPlaceholder();
    listElement.appendChild(placeholder);
  } else {
    const afterElement = getDragAfterElement(listElement, e.clientY);
    updateDropPlaceholder(listElement, afterElement);
  }
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
  attachItemEventListeners();
  location.reload();

}

function handleItemDelete(e) {
  const listItem = e.target.closest("li");
  const listId = listItem.parentNode.id;
  const listName = listId.split("-")[0];
  managerList.removeItemFromList(listName, listItem.id);
  listItem.remove();
  location.reload();

}

function findNewPosition(listElement, placeholder) {
  const items = Array.from(listElement.children); // Get all children, including `li` and placeholder `div`
  const draggableItems = items.filter((item) => item.matches("li:not(.dragging)")); // Filter only draggable items
  const placeholderIndex = items.indexOf(placeholder); // Find index of placeholder among all children
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
    // in case the list is empty when this is called
    listElement.appendChild(placeholder);
  }
}
