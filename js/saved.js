import {
  collection,
  db,
  FIRESTORE_DB_COLLECTION,
  getDocs,
  deleteDoc,
  doc,
} from "./globals.js";
import { sendNotification } from "./settings.js";

const dbCollection = collection(db, FIRESTORE_DB_COLLECTION);
let news = [];

window.addEventListener("DOMContentLoaded", loadData);

async function loadData() {
  //Get data from firestore
  getDocs(dbCollection)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const newsArticle = {
          id: doc.id,
          title: doc.data().title,
          url: doc.data().url,
          source: doc.data().source,
          image: doc.data().image,
          description: doc.data().description,
          publisedAt: doc.data().publisedAt,
          content: doc.data().content,
        };
        news.push(newsArticle);
      });
      savedArticles();
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
      const noArticle = document.getElementById("noArticlesError");
      noArticle.classList.remove("hidden");
    });
}

function savedArticles() {
  const savedArticles = document.querySelector("#savedArticlesData");

  if (news && news.length > 0) {
    news.forEach((element) => {
      const {
        articleBlock,
        imgElement,
        title,
        description,
        link,
        deleteButton,
        deleteIcon,
      } = newArticleBlock();
      imgElement.src = element.image;
      title.textContent = element.title;
      description.textContent = element.description;
      link.href = element.url;
      link.textContent = "Read More >>";
      deleteIcon.src = "./../assets/bin.png";
      deleteIcon.alt = "Bookmark";
      deleteButton.append(deleteIcon);

      //create read more and bookmark button container
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add(
        "flex",
        "flex-row",
        "align-center",
        "justify-between"
      );
      buttonContainer.append(link, deleteButton);

      deleteButton.addEventListener("click", () => {
        deleteArticle(element);
      });
      articleBlock.append(imgElement, title, description, buttonContainer);
      savedArticles.append(articleBlock);
    });
  }

  if (news.length === 0) {
    const noArticle = document.getElementById("noArticlesError");
    noArticle.classList.remove("hidden");
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
  const deleteButton = document.createElement("button");
  const deleteIcon = document.createElement("img");
  deleteButton.classList.add(
    "mt-2",
    "px-3",
    "py-2",
    "bg-grey-500",
    "text-white"
  );

  deleteIcon.classList.add("w-5", "h-5", "mr-2");

  return {
    articleBlock,
    imgElement,
    title,
    description,
    link,
    deleteButton,
    deleteIcon,
  };
}

const deleteArticle = async (element) => {
  //Delete from DB
  try {
    const docRef = doc(db, FIRESTORE_DB_COLLECTION, element.id);
    await deleteDoc(docRef);
    sendNotification("Article deleted successfully");
    window.location.reload();
  } catch (error) {
    console.log("Error deleting document: ", error);
  }
};
