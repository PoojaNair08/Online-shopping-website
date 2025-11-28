// Place in script.js at the top
let products = JSON.parse(localStorage.getItem('products')) || [];

if(products.length === 0){
    products = [
        {id: 1, name: "Classic Watch", price: 1499, description: "Leather strap watch", imagename: "watch.jpg"},
        {id: 2, name: "Running Shoes", price: 2999, description: "Comfort shoes", imagename: "shoes.jpg"},
        {id: 3, name: "Headphones", price: 1099, description: "Noise-cancelling", imagename: "headphones.jpg"},
        {id: 4, name: "Sunglasses", price: 899, description: "Stylish sunglasses", imagename: "sunglasses.jpg"}
    ];
    localStorage.setItem('products', JSON.stringify(products));
}


// ========== Registration ==========

if(document.getElementById('registerForm')){
    document.getElementById('registerForm').addEventListener('submit', function(e){
        e.preventDefault();
        let name = document.getElementById('name').value;
        let email = document.getElementById('email').value;
        let password = document.getElementById('password').value;
        let confirmPassword = document.getElementById('confirmPassword').value;

        if(password.length < 6){ alert("Password ≥ 6 chars"); return; }
        if(password !== confirmPassword){ alert("Passwords do not match"); return; }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if(users.some(u=>u.email===email)){ alert("Email exists"); return; }

        users.push({id:Date.now(), name, email, password});
        localStorage.setItem('users', JSON.stringify(users));
        alert("Registered!");
        window.location.href = "login.html";
    });
}

// ========== Login ==========
if(document.getElementById('loginForm')){
    // Ensure admin exists
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if(!users.some(u=>u.email==="admin@gmail.com")){
        users.push({id:Date.now(), name:"Admin", email:"admin@gmail.com", password:"admin123"});
        localStorage.setItem('users', JSON.stringify(users));
    }

    document.getElementById('loginForm').addEventListener('submit', function(e){
        e.preventDefault();
        let email = document.getElementById('loginEmail').value;
        let password = document.getElementById('loginPassword').value;

        let users = JSON.parse(localStorage.getItem('users')) || [];
        let user = users.find(u=>u.email===email && u.password===password);
        if(user){
            localStorage.setItem('loggedInUser', email);
            window.location.href="index.html";
        } else alert("Invalid credentials");
    });
}

// ========== Common: Navbar & Logout ==========
let loggedInUser = localStorage.getItem('loggedInUser');
if(document.getElementById('logoutBtn')){
    if(!loggedInUser){ window.location.href="login.html"; }
    if(loggedInUser!=="admin@gmail.com" && document.getElementById('addProductLink')){
        document.getElementById('addProductLink').style.display='none';
    }
    document.getElementById('logoutBtn').addEventListener('click', function(){
        localStorage.removeItem('loggedInUser');
        window.location.href="login.html";
    });
}

function renderProducts(){
    if(!document.getElementById('productList')) return;
    let productList = document.getElementById('productList'); productList.innerHTML='';
    products.forEach((p,i)=>{
        let adminButtons='';
        if(loggedInUser==="admin@gmail.com"){
            adminButtons=`<button class="btn btn-warning btn-sm" onclick="editProduct(${i})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${i})">Delete</button>`;
        }
        productList.innerHTML+=`
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm">
            <img src="assets/img/${p.imagename}" class="card-img-top">
            <div class="card-body">
              <h5 class="card-title">${p.name}</h5>
              <p class="card-text">${p.description}</p>
              <p><strong>₹${p.price}</strong></p>
              <button class="btn btn-primary" onclick="addToCart(${i})">Add to Cart</button>
              ${adminButtons}
            </div>
          </div>
        </div>`;
    });
}
renderProducts();

function editProduct(index){
    localStorage.setItem('editProductIndex', index);
    window.location.href='edit-product.html';
}
function deleteProduct(index){
    if(confirm("Delete product?")){
        products.splice(index,1);
        localStorage.setItem('products',JSON.stringify(products));
        renderProducts();
    }
}

// ========== Add/Edit Product ==========
if(document.getElementById('addProductForm')){
    let index = localStorage.getItem('editProductIndex');
    if(index!==null){
        let p = products[index];
        document.getElementById('productName').value = p.name;
        document.getElementById('productPrice').value = p.price;
        document.getElementById('productDescription').value = p.description;
        document.getElementById('productImage').value = p.imagename;
    }
    document.getElementById('addProductForm').addEventListener('submit', function(e){
        e.preventDefault();
        let name = document.getElementById('productName').value;
        let price = document.getElementById('productPrice').value;
        let description = document.getElementById('productDescription').value;
        let imagename = document.getElementById('productImage').value;
        if(index!==null){
            products[index]={...products[index], name, price, description, imagename};
            localStorage.removeItem('editProductIndex');
            alert("Updated!");
        } else {
            products.push({id:Date.now(), name, price, description, imagename});
            alert("Added!");
        }
        localStorage.setItem('products', JSON.stringify(products));
        window.location.href='shop.html';
    });
}

// ========== Cart ==========
function addToCart(index){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let p = products[index];
    let existing = cart.find(c=>c.id===p.id);
    if(existing){ existing.qty+=1; } else { cart.push({...p, qty:1}); }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Added to cart!");
}

if(document.getElementById('cartContainer')){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    function renderCart(){
        let container = document.getElementById('cartContainer'); container.innerHTML='';
        cart.forEach((item,i)=>{
            container.innerHTML+=`
            <div class="card mb-3"><div class="card-body">
            <h5>${item.name}</h5>
            <p>₹${item.price}</p>
            <input type="number" value="${item.qty}" min="1" onchange="updateQty(${i},this.value)">
            <button class="btn btn-danger" onclick="removeFromCart(${i})">Remove</button>
            </div></div>`;
        });
    }
    function updateQty(i,qty){ cart[i].qty=parseInt(qty); localStorage.setItem('cart',JSON.stringify(cart)); renderCart(); }
    function removeFromCart(i){ cart.splice(i,1); localStorage.setItem('cart',JSON.stringify(cart)); renderCart(); }
    renderCart();
}

if(document.getElementById('checkoutBtn')){
    document.getElementById('checkoutBtn').addEventListener('click', function(){
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if(cart.length === 0){
            alert("Your cart is empty!");
            return;
        }
        alert("Thank you for your purchase!"); // You can customize this
        localStorage.removeItem('cart'); // Clear the cart
        renderCart(); // Refresh cart display
        updateCartCount(); // Update cart count in navbar
    });
}

