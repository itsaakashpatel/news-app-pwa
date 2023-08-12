// Get the notification toggle element
const notificationToggle = document.getElementById("notificationToggle");

//App will store settings in local storage using Indexed DB
const request = window.indexedDB.open("inbriefs", 1);
let db = null;

request.onerror = function (event) {
  console.error("Error opening request:", event.target.errorCode);
  //return from the function if there is an error
  return;
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains("settings")) {
    db.createObjectStore("settings");
    console.log("Object store created successfully!", db.objectStoreNames);
  }
};

request.onsuccess = (event) => {
  db = event.target.result;
  if (!notificationToggle) return;
  console.log("Database opened successfully!", { db });

  if (!db.objectStoreNames.contains("settings")) {
    db.createObjectStore("settings");
    console.log("Object store created successfully!");
  }

  //Get the notification status from local DB
  const tx = db.transaction("settings", "readonly");
  const store = tx.objectStore("settings");
  const request = store.get("notifications");

  request.onerror = function (event) {
    console.error(
      "Error getting notification settings from local:",
      event.target.errorCode
    );
  };

  request.onsuccess = function (event) {
    if (event.target.result) {
      notificationToggle.checked = true;
    } else notificationToggle.checked = false;
  };
};

// Function to handle toggle action
const toggleNotifications = async () => {
  // Perform actions based on toggle status (enable or disable notifications)
  if (!("Notification" in window)) {
    console.error("This browser does not support notifications!");
    return;
  }

  if (notificationToggle.checked) {
    //Send notifications permission
    if (Notification.permission === "granted") {
      console.log("Permission granted!");

      changeNotificationStatus(true);
    } else if (
      Notification.permission === "denied" ||
      Notification.permission === "default"
    ) {
      //Permission is not granted, ask for the permission first
      console.log("Permission not granted!");
      Notification.requestPermission().then((permission) => {
        toggleNotifications();
      });
    }
  } else {
    // Disable notifications
    console.log("Notifications disabled");
    changeNotificationStatus(false);
  }
};

const changeNotificationStatus = (status) => {
  const tx = db.transaction("settings", "readwrite");
  const store = tx.objectStore("settings");
  const request = store.put(status, "notifications");

  request.onerror = (event) => {
    console.error(
      "Error storing notification settings in local:",
      event.target.errorCode
    );
  };

  request.onsuccess = (event) => {
    if (status) {
      notificationToggle.checked = status;
      //Permission is granted, send the notification
      sendNotification("You have enabled notifications");
    } else {
      notificationToggle.checked = false;
    }
  };
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("inbriefs", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("settings", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.error);
    };
  });
}

const getNotificationStatus = async () => {
  //Get the notification status from local DB
  const db = await openDatabase();
  const tx = db.transaction("settings", "readonly");
  const store = tx.objectStore("settings");

  return new Promise((resolve, reject) => {
    const request = store.get("notifications");
    request.onerror = function (event) {
      console.error(
        "Error getting notification settings from local:",
        event.target.errorCode
      );
      reject(false);
    };

    request.onsuccess = function (event) {
      if (event.target.result) {
        resolve(true);
      } else resolve(false);
    };
  });
};

async function sendNotification(msg) {
  const notificationOptions = {
    body: msg || "",
    icon: "./assets/inbriefs-512x512.png",
    image: "./assets/inbriefs-192x192",
  };

  console.log("Sending notification!", await getNotificationStatus());

  if ((await getNotificationStatus()) === false) return;

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.showNotification(
        "Inbriefs - Notification!",
        notificationOptions
      );
    })
    .catch((error) => {
      console.error("Error showing notification:", error);
    });
}

// Add event listener for the toggle switch
if (notificationToggle)
  notificationToggle.addEventListener("change", toggleNotifications);

export { sendNotification };
