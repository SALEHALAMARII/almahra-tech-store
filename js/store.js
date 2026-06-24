
export const STORE_PHONE = "967778055100";
const CART_KEY = "almahra_cart";

export function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
export function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); window.dispatchEvent(new Event("cart:change")); }
export function addToCart(product, qty=1){
  const cart = getCart();
  const item = cart.find(x => x.id === product.id);
  if(item) item.qty += qty; else cart.push({...product, qty});
  saveCart(cart);
}
export function removeFromCart(id){ saveCart(getCart().filter(x=>x.id!==id)); }
export function updateQty(id, qty){ const cart=getCart().map(x=>x.id===id?{...x, qty:Math.max(1,qty)}:x); saveCart(cart); }
export function cartTotal(){ return getCart().reduce((s,x)=>s+((Number(x.price)||0)*x.qty),0); }
export function checkoutWhatsApp(){
  const cart=getCart();
  if(!cart.length){ alert("السلة فارغة"); return; }
  let msg="السلام عليكم، أريد طلب المنتجات التالية من شركة المهره تك:%0A%0A";
  cart.forEach((x,i)=>{
    const lineTotal=(Number(x.price)||0)*x.qty;
    msg+=`${i+1}- اسم المنتج: ${x.name}%0Aالكمية: ${x.qty}%0Aالسعر: ${x.price ? x.price + " $" : "غير محدد"}%0Aالإجمالي: ${x.price ? lineTotal + " $" : "غير محدد"}%0A%0A`;
  });
  msg+=`الإجمالي الكلي: ${cartTotal()} $%0A`;
  window.open(`https://wa.me/${STORE_PHONE}?text=${msg}`,"_blank");
}
