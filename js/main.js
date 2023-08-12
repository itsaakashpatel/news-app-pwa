import { collection, db, FIRESTORE_DB_COLLECTION, addDoc } from "./globals.js";
import { sendNotification } from "./settings.js";

const dbCollection = collection(db, FIRESTORE_DB_COLLECTION);
const notificationCollection = collection(db, "notifications");
const channel = new BroadcastChannel("inbriefs-channel");

const latitudeElement = document.getElementById("latitude");
const longitudeElement = document.getElementById("longitude");

let news = [];

window.addEventListener("DOMContentLoaded", loadData);

async function loadData() {
  if (localStorage.getItem("news")) {
    news = JSON.parse(localStorage.getItem("news"));
    homeScreen();
  } else {
    const data = await getNewsData();

    if (data && data.length > 0) {
      localStorage.setItem("news", JSON.stringify(data));
      news = data;
      homeScreen();
    } else {
      const noArticle = document.getElementById("noArticlesError");
      noArticle.classList.remove("hidden");
    }
  }
}

async function getNewsData() {
  //Make an api call to get the news
  try {
    const response = await fetch("https://news-akpatel.cyclic.app");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function homeScreen() {
  const homeScreen = document.querySelector("#homeScreenData");

  console.log("🚀 ~ file: main.js:73 ~ homeScreen ~ news:", news);
  if (news && news.length > 0) {
    news.forEach((element) => {
      const {
        articleBlock,
        imgElement,
        title,
        description,
        link,
        bookmarkButton,
        bookmarkIcon,
      } = newArticleBlock();
      imgElement.src = element.image;
      title.textContent = element.title;
      description.textContent = element.description;
      link.href = element.url;
      link.textContent = "Read More >>";
      bookmarkIcon.src = "./../assets/bookmark-empty.png";
      bookmarkIcon.alt = "Bookmark";
      bookmarkButton.append(bookmarkIcon);

      //create read more and bookmark button container
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add(
        "flex",
        "flex-row",
        "align-center",
        "justify-between"
      );
      buttonContainer.append(link, bookmarkButton);

      bookmarkButton.addEventListener("click", () => {
        console.log("CLICKING");
        bookmarkArticle(element);
      });
      articleBlock.append(imgElement, title, description, buttonContainer);
      homeScreen.append(articleBlock);
    });
  }
}

function newArticleBlock() {
  const articleBlock = document.createElement("div");
  articleBlock.className = "bg-white rounded-lg shadow p-4 mb-4";
  const imgElement = document.createElement("img");
  imgElement.className = "w-full h-40 object-cover mb-4 rounded";
  const title = document.createElement("h2");
  title.className = "text-lg font-semibold text-base md:text-lg mb-2";
  const description = document.createElement("p");
  description.classList.add(["text-base", "text-gray-500"]);
  const link = document.createElement("a");
  link.className = "mt-2 text-blue-500 hover:underline";
  const bookmarkButton = document.createElement("button");
  const bookmarkIcon = document.createElement("img");
  bookmarkButton.classList.add(
    "mt-2",
    "px-3",
    "py-2",
    "bg-grey-500",
    "text-white",
    "rounded",
    "focus:outline-none"
  );

  bookmarkIcon.classList.add("w-5", "h-5", "mr-2");

  return {
    articleBlock,
    imgElement,
    title,
    description,
    link,
    bookmarkButton,
    bookmarkIcon,
  };
}

const bookmarkArticle = async (element) => {
  // Perform bookmark action and Firestore integration here
  try {
    const newsId = await addDoc(dbCollection, element);
    sendNotification("You bookmarked an article");
  } catch (error) {
    console.log("Error adding document: ", error);
  }
};

// Listen for messages from the service worker
channel.addEventListener("message", (event) => {
  if (event.data.action === "sendDataToFirestore") {
    sendDataToFirestore(event.data?.data.value);
  }

  if (event.data.action === "syncNews") {
    getNewsData()
      .then((data) => {
        if (data && data.length > 0) {
          localStorage.setItem("news", JSON.stringify(data));
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
});

const sendDataToFirestore = async (value) => {
  // Perform bookmark action and Firestore integration here
  try {
    const notificationId = await addDoc(notificationCollection, {
      value: value,
    });
    return notificationId;
  } catch (error) {
    console.log("Error adding document: ", error);
  }
};

//GEOLOCATION API

if ("geolocation" in navigator) {
  // Get current position
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Update DOM with location data
      latitudeElement.textContent = `Latitude: ${latitude}`;
      longitudeElement.textContent = `Longitude: ${longitude}`;
    },
    (error) => {
      console.error("Error getting location:", error);
      latitudeElement.textContent = "Location not available";
      longitudeElement.textContent = "Location not available";
    }
  );
} else {
  // Geolocation is not supported
  latitudeElement.textContent = "Geolocation not supported";
  longitudeElement.textContent = "Geolocation not supported";
}
