  const PRODUCTS = [
  {id:"proud", name:"Proud of You Intense", type:"clone", brand:"Fragrance World", prices:{10:4,100:25}, image:"images/proud.jpg", scent:"Warm vanilla, amber, fruity notes"},
  {id:"rebel", name:"9pm Rebel", type:"clone", brand:"Afnan", prices:{10:7,100:45}, image:"images/rebel.jpg", scent:"Spicy, woody, with red fruits"},
  {id:"nightout", name:"9pm Night Out", type:"clone", brand:"Afnan", prices:{10:6,100:45}, image:"images/nightout.jpg", scent:"Dark, smoky, citrus and spice"},
  {id:"afnan", name:"9pm AFNAN", type:"clone", brand:"Afnan", prices:{10:5,100:35}, image:"images/afnan.jpg", scent:"Fresh, sweet, long-lasting evening scent"},
  {id:"imaginari", name:"Imaginari", type:"clone", brand:"Fragrance World", prices:{10:4,100:25}, image:"images/imaginari.jpg", scent:"Citrus, floral, uplifting"},
  {id:"valentia", name:"Valentia", type:"clone", brand:"Fragrance World", prices:{10:4,100:25}, image:"images/valentia.jpg", scent:"Romantic, floral, fruity"},
  {id:"hawas", name:"Hawas Ice", type:"clone", brand:"Rasasi", prices:{10:6,100:45}, image:"images/hawas.jpg", scent:"Cool aquatic, fresh citrus"},
  {id:"optimistic-her", name:"Optimistic Her", type:"clone", brand:"Fragrance World", prices:{10:5,100:29}, image:"images/optimistic-her.jpg", scent:"Floral fruity, feminine"},
  {id:"optimistic-paradox", name:"Optimistic Paradox", type:"clone", brand:"Fragrance World", prices:{10:5,100:29}, image:"images/optimistic-paradox.jpg", scent:"Sweet floral, playful"},
  {id:"just-wardi", name:"FW Just Wardi", type:"clone", brand:"Fragrance World", prices:{10:5,100:29}, image:"images/just-wardi.jpg", scent:"Soft floral, powdery, elegant"}
];


let cart = JSON.parse(localStorage.getItem("perfume-cart") || "[]");
const $ = s => document.querySelector(s);

function money(n){ return "$" + n.toFixed(2); }
function save(){ localStorage.setItem("perfume-cart", JSON.stringify(cart)); renderCart(); }

function renderProducts(filter="all"){
  const list = PRODUCTS.filter(p => filter==="all" || p.type===filter);
  $("#productGrid").innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-visual">
        <span class="tag">${p.type==="original" ? "Original" : "Inspired / Clone"}</span>
      </div>
      <h3>${p.name}</h3>
      <p class="meta">${p.brand}</p>
      <div class="prices">
        <div class="price-pill">100ml <b>${money(p.prices[100])}</b></div>
        <div class="price-pill">10ml <b>${money(p.prices[10])}</b></div>
      </div>
      <button class="add-btn" onclick="chooseSize('${p.id}')">Choose size</button>
    </article>`).join("");
}

function chooseSize(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  const card = document.querySelector(`[data-product-id="${id}"]`);

  if (card) {
    const existing = card.querySelector(".size-options");
    if (existing) {
      existing.remove();
      return;
    }

    const sizeBox = document.createElement("div");
    sizeBox.className = "size-options";

    sizeBox.innerHTML = `
      <button onclick="addToCart('${id}', 100)">
        100ml — $${product.prices[100]}
      </button>

      <button onclick="addToCart('${id}', 10)">
        10ml — $${product.prices[10]}
      </button>
    `;

    card.appendChild(sizeBox);
  }
}

function addToCart(p, ml){
  const key = `${p.id}-${ml}`;
  const found = cart.find(x=>x.key===key);
  if(found) found.qty++;
  else cart.push({key,id:p.id,name:p.name,type:p.type,ml,price:p.prices[ml],qty:1});
  save();
  toast(`${p.name} ${ml}ml added to cart`);
}

function renderCart(){
  $("#cartCount").textContent = cart.reduce((a,x)=>a+x.qty,0);
  if(!cart.length){
    $("#cartItems").innerHTML = `<div style="padding:50px 0;text-align:center;color:#817a70">Your cart is empty.<br>Choose a fragrance to get started.</div>`;
  } else {
    $("#cartItems").innerHTML = cart.map((x,i)=>`
      <div class="cart-row">
        <div>
          <div class="cart-name">${x.name}</div>
          <div class="cart-size">${x.type==="original"?"Original":"Inspired / Clone"} · ${x.ml}ml · ${money(x.price)}</div>
          <div class="cart-actions">
            <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
            <b>${x.qty}</b>
            <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
            <button class="remove" onclick="removeItem(${i})">Remove</button>
          </div>
        </div>
        <strong>${money(x.price*x.qty)}</strong>
      </div>`).join("");
  }
  $("#cartTotal").textContent = money(total());
  $("#checkoutTotal").textContent = money(total());
  $("#checkoutSummary").innerHTML = cart.map(x=>`
    <div class="summary-row"><span>${x.name} · ${x.ml}ml × ${x.qty}</span><b>${money(x.price*x.qty)}</b></div>`).join("");
}
function total(){ return cart.reduce((a,x)=>a+x.price*x.qty,0); }
function changeQty(i,d){ cart[i].qty+=d; if(cart[i].qty<=0) cart.splice(i,1); save(); }
function removeItem(i){ cart.splice(i,1); save(); }

function openCart(){ $("#cartDrawer").classList.add("open"); $("#overlay").classList.add("show"); }
function closeCart(){ $("#cartDrawer").classList.remove("open"); $("#overlay").classList.remove("show"); }
function openCheckout(){
  if(!cart.length){ toast("Your cart is empty"); return; }
  closeCart(); $("#checkoutModal").classList.add("open"); $("#checkoutModal").setAttribute("aria-hidden","false"); renderCart();
}
function closeCheckout(){ $("#checkoutModal").classList.remove("open"); $("#checkoutModal").setAttribute("aria-hidden","true"); }

function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2200);
}

$("#openCart").onclick=openCart;
$("#closeCart").onclick=closeCart;
$("#overlay").onclick=closeCart;
$("#checkoutBtn").onclick=openCheckout;
$("#closeCheckout").onclick=closeCheckout;

document.querySelectorAll(".filter").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active"); renderProducts(btn.dataset.filter);
  };
});

$("#useLocation").onclick=()=>{
  if(!navigator.geolocation){ toast("Location is not supported by this browser"); return; }
  toast("Requesting your location…");
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude,longitude}=pos.coords;
    const link=`https://www.google.com/maps?q=${latitude},${longitude}`;
    document.querySelector('[name="location"]').value=link;
    toast("Location link added");
  },()=>toast("Could not get location. You can paste a map link instead."));
};

$("#checkoutForm").addEventListener("submit", async e=>{
  e.preventDefault();
  if(!cart.length) return;
  const btn=$("#placeOrder"); btn.disabled=true; btn.textContent="Sending order…";
  const data=Object.fromEntries(new FormData(e.target).entries());
  const payload={customer:data,items:cart,total:total(),currency:"USD"};
  try{
    const res=await fetch("/api/order",{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
    });
    const out=await res.json();
    if(!res.ok || !out.ok) throw new Error(out.error || "Order could not be sent");
    $("#orderStatus").textContent="✓ Order received. The shop has been notified on Telegram.";
    $("#orderStatus").style.color="#4c7754";
    cart=[]; save(); e.target.reset();
    toast("Order placed successfully");
    setTimeout(closeCheckout,1800);
  }catch(err){
    $("#orderStatus").textContent="Could not send the order. Please try again.";
    $("#orderStatus").style.color="#a34e43";
    console.error(err);
  }finally{
    btn.disabled=false; btn.textContent="Place order";
  }
});

renderProducts();
renderCart();
