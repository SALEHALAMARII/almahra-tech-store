import { addToCart } from "./store.js";
import { productCard, setupShell, loadProducts, attachProductActions } from "./ui.js";

const products = await loadProducts();
setupShell(products);
window.addEventListener("product:add", e => addToCart(e.detail));

const grid=document.getElementById("productsGrid");
const filter=document.getElementById("categoryFilter");
const search=document.getElementById("searchInput");
const params=new URLSearchParams(location.search);
if(params.get("category")) filter.value=params.get("category");

function render(){
  const q=(search.value||"").trim();
  const cat=filter.value;
  const rows=products.filter(p => (cat==="all" || p.category===cat) && (!q || p.name.includes(q) || p.description.includes(q)));
  grid.innerHTML = rows.map(productCard).join("") || "<p>لا توجد منتجات مطابقة.</p>";
  attachProductActions(products);
}
filter.onchange=render; search.oninput=render; render();
