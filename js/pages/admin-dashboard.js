import { account, databases, storage, ID, Query, appwriteConfig } from "../appwrite/appwrite.js";

let products = [];

async function requireLogin() {
  try {
    await account.get();
    await loadProducts();
  } catch (e) {
    location.href = "login.html";
  }
}

logoutBtn.onclick = async () => {
  try {
    await account.deleteSession("current");
  } catch (e) {}
  location.href = "login.html";
};

async function uploadImage(file) {
  if (!file) return "";
  const uploaded = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    file
  );
  return uploaded.$id;
}

function getProductImageUrl(imageId) {
  if (!imageId) return "";
  return storage.getFileView(appwriteConfig.bucketId, imageId);
}

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = productForm.querySelector("button");
  const oldText = submitBtn.textContent;

  submitBtn.disabled = true;
  submitBtn.textContent = "جاري الحفظ...";

  try {
    let imageId = "";

    if (images.files && images.files[0]) {
      imageId = await uploadImage(images.files[0]);
    }

    const data = {
      name: name.value.trim(),
      category: category.value,
      description: description.value.trim(),
      specs: specs.value.trim(),
      price: price.value ? Number(price.value) : null,
      available: available.value === "true",
    };

    if (!data.name) {
      alert("يرجى كتابة اسم المنتج");
      return;
    }

    if (!data.category) {
      alert("يرجى اختيار القسم");
      return;
    }

    if (imageId) {
      data.imageId = imageId;
    }

    if (productId.value) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        productId.value,
        data
      );
    } else {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        ID.unique(),
        data
      );
    }

    productForm.reset();
    productId.value = "";

    await loadProducts();

    alert("تم حفظ المنتج بنجاح");
  } catch (err) {
    console.error("Appwrite Error:", err);
    alert(err.message || "حدث خطأ أثناء حفظ المنتج.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = oldText;
  }
});

async function loadProducts() {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    products = result.documents.map((d) => ({
      id: d.$id,
      ...d,
    }));

    totalProducts.textContent = products.length;

    productsTable.innerHTML = products
      .map((p) => {
        const imageUrl = getProductImageUrl(p.imageId);

        return `
          <tr>
            <td class="product-thumb-cell">
              ${
                imageUrl
                  ? `<img src="${imageUrl}" alt="${p.name || "صورة المنتج"}">`
                  : `<span class="admin-no-image">بدون صورة</span>`
              }
            </td>
            <td>${p.name || ""}</td>
            <td>${p.category || ""}</td>
            <td>${p.price ?? "اختياري"}</td>
            <td>${p.available !== false ? "متوفر" : "غير متوفر"}</td>
            <td>
              <button data-edit="${p.id}" class="btn btn-primary">تعديل</button>
              <button data-del="${p.id}" class="btn btn-dark">حذف</button>
            </td>
          </tr>
        `;
      })
      .join("");

    productsTable.querySelectorAll("[data-del]").forEach((b) => {
      b.onclick = async () => {
        if (confirm("حذف المنتج؟")) {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.productsCollectionId,
            b.dataset.del
          );
          loadProducts();
        }
      };
    });

    productsTable.querySelectorAll("[data-edit]").forEach((b) => {
      b.onclick = () => editProduct(b.dataset.edit);
    });
  } catch (err) {
    console.error("Load Products Error:", err);
  }
}

function editProduct(id) {
  const p = products.find((x) => x.id === id);

  if (!p) return;

  productId.value = p.id;
  name.value = p.name || "";
  category.value = p.category || "الشبكات";
  price.value = p.price || "";
  available.value = String(p.available !== false);
  description.value = p.description || "";
  specs.value = p.specs || "";

  scrollTo({ top: 0, behavior: "smooth" });
}

requireLogin();