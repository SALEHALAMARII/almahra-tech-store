# طريقة الدخول إلى لوحة الإدارة

## الرابط
بعد رفع المشروع على GitHub Pages:
`https://YOUR-USERNAME.github.io/YOUR-REPO/admin/login.html`

أو محليًا:
`admin/login.html`

## قبل الدخول
يجب إعداد Firebase:

1. أنشئ مشروعًا في Firebase Console.
2. فعّل Authentication.
3. اختر Sign-in method ثم فعّل Email/Password.
4. أضف مستخدم Admin من Authentication > Users.
5. فعّل Firestore Database.
6. فعّل Firebase Storage.
7. انسخ إعدادات Firebase Web App وضعها في:
`js/firebase/config.js`

## مثال
```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...firebaseapp.com",
  projectId: "...",
  storageBucket: "...appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

بعد ذلك ادخل من صفحة الإدارة باستخدام البريد وكلمة المرور التي أنشأتها في Firebase.
