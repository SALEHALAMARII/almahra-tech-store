import { getCart, removeFromCart, updateQty, cartTotal, checkoutWhatsApp } from "./store.js";
import { databases, storage, Query, appwriteConfig } from "./appwrite/appwrite.js";

export const categories = [
  {name:"الشبكات", icon:"📡", desc:"راوترات، سويتشات، تمديدات وحلول شبكات."},
  {name:"الكاميرات", icon:"📷", desc:"كاميرات مراقبة وأجهزة تسجيل وحلول حماية."},
  {name:"الكمبيوتر", icon:"💻", desc:"أجهزة مكتبية، لابتوبات، وملحقات تقنية."},
  {name:"الطابعات", icon:"🖨️", desc:"طابعات، أحبار، وصيانة مكتبية."}
];

function imageMarkup(p){
  if (p.imageId && !appwriteConfig.projectId.includes("PUT_")) {
    const url = storage.getFileView(appwriteConfig.bucketId, p.imageId);
    return `<img src="${url}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:18px">`;
  }
  if (p.imageUrl) return `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:18px">`;
  if (Array.isArray(p.images) && p.images.length) return `<img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:18px">`;
  return `<div>${p.icon || "📦"}</div>`;
}

export function productCard(p){
  return `<article class="card product-card">
    <div class="product-img"><span class="status">${p.available !== false ? "متوفر" : "غير متوفر"}</span>${imageMarkup(p)}</div>
    <div class="product-body"><h3>${p.name}</h3><p>${p.description || ""}</p><div class="price">${p.price ? p.price + " $" : "السعر عند الطلب"}</div>
    <div class="actions"><button class="btn btn-dark add-cart" data-id="${p.id}">إضافة للسلة</button><button class="btn btn-primary details" data-id="${p.id}">تفاصيل</button></div></div>
  </article>`;
}

export function setupShell(products=[]){
  const menu=document.getElementById("menuToggle"), links=document.getElementById("navLinks");
  if(menu) menu.onclick=()=>links.classList.toggle("open");
  const drawer=document.getElementById("cartDrawer");
  document.getElementById("cartToggle")?.addEventListener("click",()=>drawer.classList.add("open"));
  document.getElementById("closeCart")?.addEventListener("click",()=>drawer.classList.remove("open"));
  document.getElementById("cartBackdrop")?.addEventListener("click",()=>drawer.classList.remove("open"));
  document.getElementById("checkoutBtn")?.addEventListener("click",checkoutWhatsApp);
  window.addEventListener("cart:change", renderCart);
  renderCart();
}

export function renderCart(){
  const count=document.getElementById("cartCount"), list=document.getElementById("cartItems"), total=document.getElementById("cartTotal");
  const cart=getCart();
  if(count) count.textContent=cart.reduce((s,x)=>s+x.qty,0);
  if(total) total.textContent=cartTotal()+" $";
  if(list){
    list.innerHTML = cart.length ? cart.map(x=>`<div class="cart-item">
      <div class="cart-product-img">
        ${
          x.imageId
            ? `<img src="${storage.getFileView(appwriteConfig.bucketId, x.imageId)}" alt="${x.name}">`
            : x.imageUrl
            ? `<img src="${x.imageUrl}" alt="${x.name}">`
            : `<span>📦</span>`
        }
      </div>
      <div><strong>${x.name}</strong><div>${x.price?x.price+" $":"السعر عند الطلب"}</div><div class="qty"><button data-dec="${x.id}">-</button><span>${x.qty}</span><button data-inc="${x.id}">+</button></div></div><button class="icon-btn" data-remove="${x.id}">🗑️</button></div>`).join("") : "<p>لا توجد منتجات في السلة.</p>";
    list.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>removeFromCart(b.dataset.remove));
    list.querySelectorAll("[data-inc]").forEach(b=>b.onclick=()=>{const item=cart.find(x=>x.id===b.dataset.inc); updateQty(item.id,item.qty+1)});
    list.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>{const item=cart.find(x=>x.id===b.dataset.dec); updateQty(item.id,item.qty-1)});
  }
}

export async function loadProducts(){
  if(!appwriteConfig.projectId.includes("PUT_")){
    try{
      const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.productsCollectionId, [Query.orderDesc("$createdAt")]);
      return result.documents.map(d => ({ id: d.$id, ...d }));
    }catch(e){ console.warn("Appwrite products not loaded, using seed data.", e); }
  }
  try{ const r = await fetch("data/seed-products.json"); return await r.json(); }catch(e){ return []; }
}

export function attachProductActions(products){
  document.querySelectorAll(".add-cart").forEach(btn=>btn.onclick=()=> { const p=products.find(x=>x.id===btn.dataset.id); if(p) window.dispatchEvent(new CustomEvent("product:add",{detail:p})); });
  document.querySelectorAll(".details").forEach(btn=>btn.onclick=()=> { const p=products.find(x=>x.id===btn.dataset.id); if(!p) return; alert(`${p.name}\n\n${p.description}\n\nالمواصفات: ${p.specs || "غير محدد"}\nالحالة: ${p.available !== false ? "متوفر" : "غير متوفر"}`); });
}
