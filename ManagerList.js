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

  moveItem(sourceListName, targetListName, itemId, newPosition) {
    let sourceItems = this.getItemsFromStorage(sourceListName);
    let targetItems = sourceItems; // By default, targetItems references sourceItems

    if (sourceItems[itemId]) {
      console.log(`Item before moving: ${itemId} - ${sourceItems[itemId]}`);

      if (sourceListName === targetListName) {
        const reorderedItems = {};
        let index = 0;

        for (let key in sourceItems) {
          if (index === newPosition) {
            reorderedItems[itemId] = sourceItems[itemId];
          }
          if (key !== itemId) {
            reorderedItems[key] = sourceItems[key];
            index++;
          }
        }

        if (newPosition >= index) {
          reorderedItems[itemId] = sourceItems[itemId];
        }

        targetItems = reorderedItems; 
      } else {
        // Handle moving to different list 
        targetItems = this.getItemsFromStorage(targetListName);
        targetItems[itemId] = sourceItems[itemId];
        delete sourceItems[itemId];
      }

      // Update storage
      this.updateStorage(sourceListName, sourceItems);
      if (sourceListName !== targetListName) {
        this.updateStorage(targetListName, targetItems);
      }

      // Log updated lists
      console.log(`Moved item ID: ${itemId} from ${sourceListName} to ${targetListName}`);
      console.log(`Source items after move:`, sourceItems);
      console.log(`Target items after move:`, targetItems);
    } else {
      console.error(`Item not found in ${sourceListName}. ID:`, itemId);
    }
  }

  updateStorage(listName, items) {
    console.log(`Before updating local storage for ${listName}:`, JSON.stringify(items));
    localStorage.setItem(`${listName}-items`, JSON.stringify(items));
    console.log(`After updating local storage for ${listName}:`, localStorage.getItem(`${listName}-items`));
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
