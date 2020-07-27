const myApiKey = "90c2f9fc3e078991092e3670886d6b33";
const myApiToken =
  "6fa9a11f388672e4b3aa3f56438d927bda96b340719151a6a3d7b8edde35fb72";


/*main function*/
fetchCheckList().then(checklist => {
  let checkListItems = arrayOfCheckListItems(checklist);

  displayItemsOfCheckList(checkListItems);

  mainEventListeners(checklist);
});

async function fetchCheckList() {
  let cardsOfTrello= await fetch(
    `https://api.trello.com/1/boards/VdCtl2na/checklists?key=${myApiKey}&token=${myApiToken}`
  );

  let dataOfChecklist = await cardsOfTrello.json();

  return dataOfChecklist;
}

/*adding new item*/
async function addNewChecklistItem(name, checklist) {
  let checklistID = checklist.map(listId => listId.id);

  await fetch(
    `https://api.trello.com/1/checklists/${
      checklistID[1]
    }/checkItems?name=${name}&pos=bottom&checked=false&key=${
      myApiKey
    }&token=${myApiToken}`,
    {
      method: "POST",
      withCredentials: true
    }
  );
}

/*deleting the item*/
async function deleteChecklistItems(checkListId, itemId) {
  await fetch(
    `https://api.trello.com/1/checklists/${checkListId}/checkItems/${itemId}?key=${myApiKey}&token=${myApiToken}`,
    {
      method: "DELETE",
      withCredentials: true
    }
  );
}

/*updating the list*/
async function updatingItemsOfChecklist(itemId, cardId, state, name) {
  await fetch(
    `https://api.trello.com/1/cards/${cardId}/checkItem/${itemId}?state=${state}&name=${name}&key=${myApiKey}&token=${myApiToken}`,
    {
      method: "PUT",
      withCredentials: true
    }
  );
}

function arrayOfCheckListItems(checklists) {
  let checkListItems = [];

  checklists.forEach(checklist => {
    checklist.checkItems.forEach(item => {
      checkListItems.push(item);
    });
  });

  return checkListItems;
}

function displayItemsOfCheckList(checklistItems) {
  // console.log(checklistItems);
  let unorderedList = document.getElementById("checklist");
  let listItem = document.getElementById("items-of-checklist");
  checklistItems.forEach(checkItem => {
    let newListItem = listItem.cloneNode(true);
    let itemName = newListItem.querySelector("p");
    itemName.textContent = checkItem.name;
    newListItem.style.display = "grid";
    itemName.setAttribute("itemId", checkItem.id);
    itemName.setAttribute("checklistId", checkItem.idChecklist);

    if (checkItem.state == "complete") {
      itemName.style.textDecoration = "line-through";
      newListItem
        .querySelector('input[type="checkbox"]')
        .setAttribute("checked", "true");
    }
    unorderedList.appendChild(newListItem);
  });
}

function mainEventListeners(checklist) {
  let unorderedList= document.getElementById("checklist");
  let listItem = document.getElementById("items-of-checklist");
  const addingChecklistItems = document.forms[0];

  addingChecklistItems.addEventListener("submit", event => {
    event.preventDefault();
    const inputValue = addingChecklistItems.querySelector('input[type="text"]').value;
    let newListItem = listItem.cloneNode(true);
    newListItem.querySelector("p").textContent = inputValue;
    newListItem.style.display = "grid";
    unorderedList.appendChild(newListItem);

    let clearingFirstChildValue = event.target.firstElementChild;
    clearingFirstChildValue.value = "";
    addNewChecklistItem(inputValue, checklist);
  });

  unorderedList.addEventListener("click", event => {
    let cardId = "";
    let checkListId = "";
    

    if (event.target.classList.contains("delete")) {
      var listItem = event.target.parentElement;
      let itemId = listItem.querySelector("p").getAttribute("itemId");
      // console.log(itemId);
      let checkListId = listItem.querySelector("p").getAttribute("checklistId");
      // console.log(checkListId);
      unorderedList.removeChild(listItem);
      /*delete checklistItems*/
      deleteChecklistItems(checkListId, itemId);
    }

    if (event.target.tagName === "INPUT") {
      let itemName = event.target.nextElementSibling;
      if (event.target.checked === true) {
        itemName.style.textDecoration = "line-through";
      } else {
        itemName.style.textDecoration = "";
      }

      let statusOfCheckBox = event.target.checked;
      let itemId = itemName.getAttribute("itemid");
      let name = itemName.textContent;

      /*to check if the item is checked or not*/
      checklist.forEach(obj => {
        obj.checkItems.forEach(checkItem => {
          if (checkItem.id == itemId) {
            checkListId = checkItem.idChecklist;
          }
        });
        if (obj.id == checkListId) {
          cardId = obj.idCard;
        }
      });
      let state = "incomplete";
      if (statusOfCheckBox) {
        state = "complete";
      }

      /*updating items of checklist*/
      updateChecklistItems(itemId, cardId, state, name);

      
    }
  });


  unorderedList.addEventListener("keydown", event => {
    let checkListId = "";
    let cardId = "";
    
    if (event.code === "Enter") {
      if (event.target.classList.contains("dashed")) {
        let name = event.target.textContent;
        let itemId = event.target.getAttribute("itemId");
        let statusOfCheckBox = event.target.checked;


        checklist.forEach(obj => {
          obj.checkItems.forEach(checkItem => {
            if (checkItem.id == itemId) {
              checkListId = checkItem.idChecklist;
            }
          });
          if (obj.id == checkListId) {
            cardId = obj.idCard;
          }
        });
        let state = "incomplete";
        if (statusOfCheckBox) {
          state = "complete";
        }
      
        /*updating items of checklist*/
        updatingItemsOfChecklist(itemId, cardId, state, name);

      
      }
    }
  });
}





