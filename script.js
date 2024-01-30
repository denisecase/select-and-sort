document.addEventListener("DOMContentLoaded", function () {
  initializeList("selected");
  initializeList("option");
  attachEventListeners();
});

function initializeList(listName) {
  // Use `${listName}-items` consistently as the local storage key
  const items = JSON.parse(localStorage.getItem(`${listName}-items`)) || [];
  const listElement = document.querySelector(`#${listName}-list`);
  listElement.innerHTML = ""; // Clear current list
  items.forEach((item) => {
    addListItem(listElement, item);
  });
  // Add drag-and-drop functionality
  makeListDraggable(listName);
}

function addListItem(listElement, itemText, beforeElement = null) {
    const itemElement = document.createElement("li");
    itemElement.draggable = true;
    itemElement.innerHTML = `
        ${itemText}
        <span class="delete-btn">X</span>
    `;
    if (beforeElement) {
      listElement.insertBefore(itemElement, beforeElement);
    } else {
      listElement.appendChild(itemElement);
    }
  }
  

function attachEventListeners() {
  // Drag and drop event listeners
  const lists = document.querySelectorAll(".draggable");

  lists.forEach((list) => {
    list.addEventListener("dragover", handleDragOver);
    list.addEventListener("drop", handleDrop);
  });

  // Event listener for adding items to selected list
  document.querySelector("#selected-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const inputElement = document.querySelector("#selected-entry");
    const newItemText = inputElement.value.trim();
    if (newItemText) {
      const listElement = document.querySelector("#selected-list");
      addListItem(listElement, newItemText);
      inputElement.value = ""; // Clear the input
      updateLocalStorage("selected"); // Update Local Storage
    }
  });

  // Event listener for adding items to option list
  document.querySelector("#option-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const inputElement = document.querySelector("#option-entry");
    const newItemText = inputElement.value.trim();
    if (newItemText) {
      const listElement = document.querySelector("#option-list");
      addListItem(listElement, newItemText);
      inputElement.value = ""; // Clear the input
      updateLocalStorage("option"); // Update Local Storage
    }
  });

  // Event listener for deleting items
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const listItem = e.target.closest("li");
      const listId = listItem.parentNode.id;
      listItem.remove();
      updateLocalStorage(listId.split("-")[0]); // Update Local Storage
    }
  });

  // Clear all functionality for selected list
  document.querySelector("#selected-clear").addEventListener("click", () => {
    clearAll("selected");
  });

  // Clear all functionality for option list
  document.querySelector("#option-clear").addEventListener("click", () => {
    clearAll("option");
  });
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.textContent.trim()); // Transfer the text content only.
  e.dataTransfer.setData("sourceListId", e.target.closest("ul").id);
  e.dataTransfer.effectAllowed = "move";
  e.target.classList.add("dragging");
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
}

function handleDragOver(e) {
  e.preventDefault(); // Necessary to allow dropping
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();
  const target = e.target.closest("li") || e.target; // Ensure the target is an LI or the UL itself.
  const listElement = target.closest("ul");
  const draggedElementId = e.dataTransfer.getData("draggedElementId");
  const draggedElement = document.getElementById(draggedElementId);

  // Determine the drop position based on cursor position relative to the target center.
  const afterElement = getDragAfterElement(listElement, e.clientY);

  if (draggedElement) {
    if (afterElement == null) {
      listElement.appendChild(draggedElement);
    } else {
      listElement.insertBefore(draggedElement, afterElement);
    }
    updateLocalStorage(listElement.id.split("-")[0]);
  }
}

// Helper function to determine the position to insert the dragged item
function getDragAfterElement(listElement, y) {
  const draggableElements = [...listElement.querySelectorAll("li:not(.dragging)")];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2; // Distance from the middle of the child element

      console.log({ child, box, y, offset, closestOffset: closest.offset }); // Debugging line

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function updateLocalStorage(listName) {
  const listItems = document.querySelectorAll(`#${listName}-list li`);
  const itemsText = Array.from(listItems).map((item) => item.textContent.replace("X", "").trim());
  // Use `${listName}-items` consistently as the local storage key
  localStorage.setItem(`${listName}-items`, JSON.stringify(itemsText));
}

function clearAll(listName) {
  const listElement = document.querySelector(`#${listName}-list`);
  listElement.innerHTML = "";
  // Use `${listName}-items` consistently as the local storage key
  localStorage.removeItem(`${listName}-items`);
}

function makeListDraggable(listName) {
  const listItems = document.querySelectorAll(`#${listName}-items li`);
  listItems.forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
    // Assign a unique ID to each item if it doesn't already have one.
    if (!item.id) {
      item.id = "item-" + Date.now();
    }
  });
}
