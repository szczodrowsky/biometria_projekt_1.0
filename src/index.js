import { async } from "@firebase/util";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7afemIGgPzm2q40yn2CZ5dhlPfSwMWfM",
  authDomain: "biometria-project-2023.firebaseapp.com",
  projectId: "biometria-project-2023",
  storageBucket: "biometria-project-2023.appspot.com",
  messagingSenderId: "179667069135",
  appId: "1:179667069135:web:72089e9fdb85e9f92defba",
};
initializeApp(firebaseConfig);
const db = getFirestore();
document.addEventListener("DOMContentLoaded", function () {
  const logowanie = document.getElementById("logowanie");

  if (logowanie) {
    logowanie.addEventListener("click", function () {
      window.location.href = "login.html";
    });
  } else {
    console.error(
      "Element o identyfikatorze 'przycisk' nie został odnaleziony."
    );
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const rejestracja = document.getElementById("rejestracja");

  if (rejestracja) {
    rejestracja.addEventListener("click", function () {
      window.location.href = "register.html";
    });
  } else {
    console.error(
      "Element o identyfikatorze 'przycisk' nie został odnaleziony."
    );
  }
});

const data = {
  clicks: [],
  timeBetween: [],
  timeTotal: [],
};
const loginBtn = document.getElementById("zaloguj");
const buttons = document.querySelectorAll(".btn");
const registerBtn = document.getElementById("zarejestruj");
let startTime = null;
let formLoaded = false;

document.addEventListener("DOMContentLoaded", function () {
  formLoaded = true;
});

buttons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    if (!formLoaded) {
      console.error("Formularz rejestracji nie został jeszcze załadowany!");
      return;
    }

    const currentTime = Date.now();

    if (startTime !== null) {
      const timeDiff = currentTime - startTime;
      data.timeBetween.push(timeDiff);
    } else {
      startTime = currentTime;
    }

    if (!data.clicks.some((click) => click.id === button.id)) {
      const clickData = {
        id: button.id,
        x: event.clientX,
        y: event.clientY,
      };
      data.clicks.push(clickData);
      button.disabled = true;
    }
    if (data.clicks.length === buttons.length) {
      const totalTime =
        data.timeBetween.reduce((acc, time) => acc + time, 0) / 1000;
      data.timeTotal.push(totalTime);
    }
    console.log(data);
  });
});

if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    try {
      const docRef = await addDoc(collection(db, "biometryczne"), data);
      registerBtn.disabled = true;
      console.log("Dane zostały dodane do Firebase! Document ID:", docRef.id);
      data.clicks = [];
      data.timeBetween = [];
      data.timeTotal = [];
      startTime = null;
      setTimeout(() => {
        window.location.href = "opening.html";
      }, 3000);
    } catch (error) {
      console.error("Błąd podczas dodawania danych do Firebase:", error);
    }
  });
}
const colRef = collection(db, "biometryczne");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      getDocs(colRef).then((snapshot) => {
        let books = [];
        snapshot.docs.forEach((doc) => {
          books.push({ ...doc.data() });
        });

        // Tolerancje dla porównań
        const tolerance = {
          clicksId: 0, // Tolerancja dla porównywania clicks - id
          clicksX: 0.1, // Tolerancja dla porównywania clicks - x
          clicksY: 0.1, // Tolerancja dla porównywania clicks - y
          timeBetween: 100, // Tolerancja dla porównywania timeBetween w milisekundach
          totalTime: 2, // Tolerancja dla porównywania totalTime w sekundach
        };

        // Porównaj clicks z tolerancją
        const clicksMatch = data.clicks.every((click, index) => {
          const bookClick = books[0].clicks[index];
          return (
            click.id === bookClick.id &&
            Math.abs(click.x - bookClick.x) <= tolerance.clicksX &&
            Math.abs(click.y - bookClick.y) <= tolerance.clicksY
          );
        });

        // Porównaj timeBetween z tolerancją w milisekundach
        const timeBetweenMatch =
          Math.abs(data.timeBetween - books[0].timeBetween) <=
          tolerance.timeBetween;

        // Porównaj totalTime z tolerancją w sekundach
        const totalTimeMatch =
          Math.abs(data.totalTime - books[0].totalTime) <= tolerance.totalTime;

        // Sprawdź czy wszystkie porównania są zgodne
        if (clicksMatch && timeBetweenMatch && totalTimeMatch) {
          console.log("Dane są zgodne z tolerancją.");
        } else {
          console.log("Dane są różne z tolerancją.");
        }

        console.log(books);
      });
    } catch (error) {
      console.error("Błąd podczas dodawania danych do Firebase:", error);
    }
  });
}
