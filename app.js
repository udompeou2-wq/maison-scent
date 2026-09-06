const PRODUCTS = [
  {id:"sauvage", name:"Sauvage", type:"original", brand:"Dior", prices:{100:145,10:19}},
  {id:"aventus", name:"Aventus", type:"original", brand:"Creed", prices:{100:320,10:38}},
  {id:"bleu", name:"Bleu de Chanel", type:"original", brand:"Chanel", prices:{100:155,10:20}},
  {id:"tobacco", name:"Tobacco Vanille", type:"original", brand:"Tom Ford", prices:{100:280,10:34}},
  {id:"club", name:"Club Intense", type:"clone", brand:"Inspired fragrance", prices:{100:28,10:6}},
  {id:"aventus-clone", name:"Aventus Style", type:"clone", brand:"Inspired fragrance", prices:{100:25,10:5}},
  {id:"oud", name:"Oud Wood Style", type:"clone", brand:"Inspired fragrance", prices:{100:30,10:6}},
  {id:"sauvage-clone", name:"Fresh Sauvage Style", type:"clone", brand:"Inspired fragrance", prices:{100:24,10:5}}
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

function chooseSize(id){
  const p = PRODUCTS.find(x=>x.id===id);
  const choice = prompt(`Choose size for ${p.name}:\n1 = 100ml (${money(p.prices[100])})\n2 = 10ml (${money(p.prices[10])})`, "1");
  const ml = choice==="2" ? 10 : choice==="1" ? 100 : null;
  if(!ml) return;
  addToCart(p, ml);
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
