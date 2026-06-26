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
      name: document.getElementById("name")?.value?.trim() || "",
      category: document.getElementById("category")?.value || "",
      description: document.getElementById("description")?.value?.trim() || "",
      specs: document.getElementById("specs")?.value?.trim() || "",
      price: document.getElementById("price")?.value
        ? Number(document.getElementById("price").value)
        : null,
      available: document.getElementById("available")?.value === "true",
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
    } else if (productId.value) {
      const oldProduct = products.find((x) => String(x.id) === String(productId.value));
      if (oldProduct?.imageId) {
        data.imageId = oldProduct.imageId;
      }
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
              <button type="button" data-edit="${p.id}" class="btn btn-primary">تعديل</button>
              <button type="button" data-del="${p.id}" class="btn btn-dark">حذف</button>
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

    productsTable.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-edit");
        editProduct(id);
      });
    });
  } catch (err) {
    console.error("Load Products Error:", err);
  }
}

function editProduct(id) {
  const p = products.find((x) => String(x.id) === String(id));

  if (!p) {
    alert("لم يتم العثور على المنتج المطلوب تعديله");
    return;
  }

  document.getElementById("productId").value = p.id;
  document.getElementById("name").value = p.name || "";
  document.getElementById("category").value = p.category || "الشبكات";
  document.getElementById("price").value = p.price ?? "";
  document.getElementById("available").value = String(p.available !== false);
  document.getElementById("description").value = p.description || "";
  document.getElementById("specs").value = p.specs || "";

  const formSection = document.getElementById("productForm");

  if (formSection) {
    formSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

requireLogin();




function fixAdminInitialScroll() {
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      window.scrollTo({
        left: document.body.scrollWidth,
        top: 0,
        behavior: "instant",
      });

      document.documentElement.scrollLeft = document.documentElement.scrollWidth;
      document.body.scrollLeft = document.body.scrollWidth;
    }, 300);
  }
}

fixAdminInitialScroll();