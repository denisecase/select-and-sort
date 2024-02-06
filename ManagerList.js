// ManagerList.js

class ManagerList {
  constructor() {
    this.STORAGE_PREFIX = 'sns-';
    this.lastItemIdKey = `${this.STORAGE_PREFIX}last-item-id`;
    this.lastItemId = parseInt(localStorage.getItem(this.lastItemIdKey)) || 0;
 }

  getItemsFromStorage(listName) {
    const itemsKey = `${this.STORAGE_PREFIX}${listName}-items`;
    const items = JSON.parse(localStorage.getItem(itemsKey)) || {};
    return items;
  }

  getNextItemId() {
    this.lastItemId += 1;
    localStorage.setItem(this.lastItemIdKey, this.lastItemId.toString());
    return `item-${this.lastItemId}`;
  }

  addItemToList(listName, itemText) {
    const itemId = this.getNextItemId();
    let items = this.getItemsFromStorage(listName);
    items[itemId] = itemText;
    this.updateStorage(listName, items);
    return itemId; // Return the ID of the newly added item
  }

  editItemInList(listName, itemId, newText) {
    let items = this.getItemsFromStorage(listName);
    if (items[itemId]) {
      items[itemId] = newText;
      this.updateStorage(listName, items);
    } else {
      console.error(`Item not found in ${listName}. ID:`, itemId);
    }
  }

  removeItemFromList(listName, itemId) {
    let items = this.getItemsFromStorage(listName);
    if (items[itemId]) {
      delete items[itemId];
      this.updateStorage(listName, items);
    } else {
      console.error(`Item not found in ${listName}. ID:`, itemId);
    }
  }

  moveItem(sourceListName, targetListName, itemId, newPosition) {
    let sourceItems = this.getItemsFromStorage(sourceListName);
    let targetItems = this.getItemsFromStorage(targetListName);

    if (sourceItems[itemId]) {
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
        this.updateStorage(sourceListName, reorderedItems);
      } else {
        targetItems[itemId] = sourceItems[itemId];
        if (!document.querySelector(`#${sourceListName}-checkbox`).checked) {
          delete sourceItems[itemId]; // delete if not checked
        }
        this.updateStorage(sourceListName, sourceItems);
        this.updateStorage(targetListName, targetItems);
      }
    } else {
      console.error(`Item not found in ${sourceListName}. ID:`, itemId);
    }
  }

  updateStorage(listName, items) {
    const itemsKey = `${this.STORAGE_PREFIX}${listName}-items`;
    localStorage.setItem(itemsKey, JSON.stringify(items));
  }

  clearList(listName) {
    const itemsKey = `${this.STORAGE_PREFIX}${listName}-items`;
    localStorage.removeItem(itemsKey);
  }

  clearAllLocalStorage() {
    console.log("Clearing all local storage...");
    localStorage.clear();
  }
}

// Export the class
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = ManagerList;
} else {
  window.ManagerList = ManagerList;
}
