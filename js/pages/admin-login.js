import { account } from "../appwrite/appwrite.js";

const loginForm = document.getElementById("loginForm");
const msg = document.getElementById("loginMsg");

async function checkExistingSession() {
  try {
    await account.get();
    location.href = "dashboard.html";
  } catch (e) {
    // لا توجد جلسة، ابقَ في صفحة الدخول
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailValue = document.getElementById("email").value.trim();
  const passwordValue = document.getElementById("password").value;

  msg.textContent = "جاري تسجيل الدخول...";

  try {
    try {
      await account.deleteSession("current");
    } catch (e) {}

    await account.createEmailPasswordSession(emailValue, passwordValue);

    location.href = "dashboard.html";
  } catch (err) {
    console.error("Login Error:", err);
    msg.textContent =
      err.message || "تعذر تسجيل الدخول. تحقق من البريد أو كلمة المرور.";
  }
});

checkExistingSession();