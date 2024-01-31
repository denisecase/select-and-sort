// ManagerList.js

class ManagerList {
  constructor() {
    this.lastItemId = parseInt(localStorage.getItem("last-item-id")) || 0;
    console.log(`ManagerList instantiated. Last Item ID: ${this.lastItemId}`);
  }

  getItemsFromStorage(listName) {
    const items = JSON.parse(localStorage.getItem(`${listName}-items`)) || {};
    console.log(`Retrieved items from ${listName}:`, items);
    return items;
  }

  getNextItemId() {
    this.lastItemId += 1;
    localStorage.setItem("last-item-id", this.lastItemId.toString());
    console.log(`Generated next item ID: item-${this.lastItemId}`);
    return `item-${this.lastItemId}`;
  }

  addItemToList(listName, itemText) {
    console.log("Calling addItemToList");
    console.log("listName: ", listName);
    console.log("itemText: ", itemText);
    const itemId = this.getNextItemId();
    let items = this.getItemsFromStorage(listName);
    items[itemId] = itemText;
    this.updateStorage(listName, items);
    console.log(`Added item to ${listName}: ${itemText} with ID: ${itemId}`);
    return itemId; // Return the ID of the newly added item
  }

  removeItemFromList(listName, itemId) {
    let items = this.getItemsFromStorage(listName);
    if (items[itemId]) {
      delete items[itemId];
      this.updateStorage(listName, items);
      console.log(`Removed item from ${listName}. ID: ${itemId}`);
    } else {
      console.error(`Item not found in ${listName}. ID:`, itemId);
    }
  }

  moveItem(sourceListName, targetListName, itemId) {
    let sourceItems = this.getItemsFromStorage(sourceListName);
    let targetItems = this.getItemsFromStorage(targetListName);

    if (sourceItems[itemId]) {
      targetItems[itemId] = sourceItems[itemId];
      delete sourceItems[itemId];

      this.updateStorage(sourceListName, sourceItems);
      if (sourceListName !== targetListName) {
        this.updateStorage(targetListName, targetItems);
      }
      console.log(`Moved item ID: ${itemId} from ${sourceListName} to ${targetListName}`);
    } else {
      console.error(`Item not found in ${sourceListName}. ID:`, itemId);
    }
  }

  updateStorage(listName, items) {
    localStorage.setItem(`${listName}-items`, JSON.stringify(items));
    console.log(`Updated ${listName} in storage:`, items);
  }

  clearList(listName) {
    localStorage.removeItem(`${listName}-items`);
    console.log(`Cleared all items from ${listName}`);
  }

  clearAllLocalStorage() {
    console.log("Clearing all local storage...");
    localStorage.clear();
    console.log("All local storage cleared.");
  }
}

// Export the class
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = ManagerList;
} else {
  window.ManagerList = ManagerList;
}
