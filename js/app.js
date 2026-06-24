import { addToCart } from "./store.js";
import { categories, productCard, setupShell, loadProducts, attachProductActions } from "./ui.js";

const products = await loadProducts();
setupShell(products);
window.addEventListener("product:add", e => addToCart(e.detail));

const catGrid=document.getElementById("categoriesGrid");
if(catGrid) catGrid.innerHTML = categories.map(c=>`<a class="card category-card" href="products.html?category=${encodeURIComponent(c.name)}"><div><div class="category-icon">${c.icon}</div><h3>${c.name}</h3><p>${c.desc}</p></div></a>`).join("");

const featured=document.getElementById("featuredProducts");
if(featured){ featured.innerHTML = products.filter(p=>p.featured).map(productCard).join(""); attachProductActions(products); }
