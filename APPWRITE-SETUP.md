# إعداد Appwrite للمتجر

## 1) ربط الموقع بـ Appwrite
افتح الملف:

`js/appwrite/config.js`

وضع بيانات مشروعك:

```js
export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "PROJECT_ID",
  databaseId: "DATABASE_ID",
  productsCollectionId: "products",
  bucketId: "product-images"
};
```

## 2) إنشاء Database
Databases > Create database

Name:
`almahra-store`

انسخ Database ID وضعه في `databaseId`.

## 3) إنشاء Table للمنتجات
داخل قاعدة البيانات اضغط Create table:

Table name:
`products`

Table ID:
`products`

أضف الأعمدة التالية:

| Column | Type | Required |
|---|---|---|
| name | String | Yes |
| description | String | No |
| specs | String | No |
| price | Float / Double | No |
| category | String | Yes |
| available | Boolean | Yes |
| imageId | String | No |

## 4) صلاحيات Table المنتجات
من Permissions أضف:

- Any: Read
- Users: Create
- Users: Update
- Users: Delete

## 5) إنشاء Bucket للصور
Storage > Create bucket

Bucket name:
`product-images`

Bucket ID:
`product-images`

Permissions:

- Any: Read
- Users: Create
- Users: Update
- Users: Delete

## 6) إنشاء حساب الأدمن
Auth > Users > Create user

أنشئ بريد وكلمة مرور لصاحب المتجر.

## 7) إضافة Web Platform
من Connect أو Settings > Platforms:

Add platform > Web

أضف أثناء التجربة:

`http://127.0.0.1:5500`

`http://localhost:5500`

وعند الرفع على GitHub Pages أضف رابط موقعك.
