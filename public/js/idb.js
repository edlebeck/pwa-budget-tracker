let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('transaction', { autoIncrement: true });
  };

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransactions();
    }
};
  
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('transaction');
    budgetObjectStore.add(record);
};

function uploadTransactions() {
    // open a transaction on your db
    const transaction = db.transaction(['transaction'], 'readwrite');
  
    // access your object store
    const budgetObjectStore = transaction.objectStore('transaction');
  
    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
              // open one more transaction
              const transaction = db.transaction(['transaction'], 'readwrite');
              // access the new_pizza object store
              const budgetObjectStore = transaction.objectStore('transaction');
              // clear all items in your store
              budgetObjectStore.clear();
    
              alert('All saved transactions has been submitted!');
            })
            .catch(err => {
              console.log(err);
            });
        }
      };
  };

  window.addEventListener('online', uploadTransactions);