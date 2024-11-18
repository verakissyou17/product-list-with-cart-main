const url = './data.json';

let cart = [];

async function fetchData() {
  const response = await fetch(url);
  const dataJson = await response.json();
  return dataJson;
}

function displayData(desserts) {
  const productsContainer = document.querySelector('.products-container');
  let html = '';
  desserts.forEach((dessert) => {
    html += `
      <section class="product" data-product-id="${dessert.id}">
        <div class="product-image-container">
          <picture class="product-image-${dessert.id}">
            <source
            srcset="${dessert.image.desktop}"
            media="(min-width: 800px)"
          />
            <source
            srcset="${dessert.image.tablet}"
            media="(min-width: 500px)"
          />
            <source
            srcset="${dessert.image.mobile}"
            media="(min-width: 200px)"
          />
            <img
              src="${dessert.image.thumbnail}"
              alt="${dessert.name}"
            />
          </picture>
          <div class="product-add-to-cart-container js-add-to-cart-container-${dessert.id}">
            <img src="./assets/images/icon-add-to-cart.svg" alt="add to cart">
            <button class="add-to-cart">Add to Cart</button>
          </div>
        </div>
        <p class="message-${dessert.id}"></p>
        <div class="product-details">
          <p>${dessert.name}</p>
          <h2>${dessert.category}</h2>
          <span>$${dessert.price}</span>
        </div>
      </section>
      `;
  });
  productsContainer.innerHTML = html;
}

function addToCart(productId) {
  let quantity = calculateCartQuantity();
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += quantity;
  } else {
    cart.push({
      productId,
      quantity: 0,
    });
  }
}

function calculateCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((item) => {
    cartQuantity += item.quantity;
  });

  return cartQuantity;
}

function updateQuantity(productId, newQuantity) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (cartItem.productId === productId) {
      matchingItem = cartItem;
    }
  });
  matchingItem.quantity = newQuantity;
}

function findMatchingProduct(productId) {
  let matchingProduct;
  cart.filter((item) => {
    if (item.productId === productId) {
      matchingProduct = item;
    }
  });
  return matchingProduct;
}

function changeAddToCartBtn(productId, desserts) {
  const addBtn = document.querySelector(
    `.js-add-to-cart-container-${productId}`,
  );
  const productImage = document.querySelector(`.product-image-${productId}`);
  const message = document.querySelector(`.message-${productId}`);

  productImage.classList.add('bordered');
  message.classList.add('error-message');

  addBtn.classList.add('selected');
  addBtn.innerHTML = `
      <div class="icon-container minus-${productId}">
        <img src="./assets/images/icon-decrement-quantity.svg" alt="decrement icon">
      </div>
      <span class="span-${productId}">0</span>
      <div class="icon-container plus-${productId}">
        <img src="./assets//images/icon-increment-quantity.svg" alt="increment icon">
      </div>
    `;

  const span = document.querySelector(`.span-${productId}`);

  const plusBtn = document.querySelector(`.plus-${productId}`);
  plusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    add(productId, message, span, desserts);
  });

  const minusBtn = document.querySelector(`.minus-${productId}`);
  minusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    subtract(productId, message, span, desserts);
  });
}

function add(productId, message, span, desserts) {
  let matchingProduct = findMatchingProduct(productId);
  if (matchingProduct) {
    matchingProduct.quantity++;
    message.innerHTML = '';
    span.innerHTML = matchingProduct.quantity;
    updateQuantity(productId, matchingProduct.quantity);
    renderCart(cart, desserts);
    if (matchingProduct.quantity >= 10) {
      matchingProduct.quantity = 10;
      message.innerHTML = `Quantity cannot be more then ${matchingProduct.quantity}!!!`;
      message.classList.add('error-message');
      span.innerHTML = matchingProduct.quantity;
      updateQuantity(productId, matchingProduct.quantity);
      renderCart(cart, desserts);
    }
  } else {
    cart.push({
      productId,
      quantity: 0,
    });
  }
}

function subtract(productId, message, span, desserts) {
  let matchingProduct = findMatchingProduct(productId);
  if (matchingProduct) {
    matchingProduct.quantity--;
    message.innerHTML = '';
    span.innerHTML = matchingProduct.quantity;
    updateQuantity(productId, matchingProduct.quantity);
    renderCart(cart, desserts);
    if (matchingProduct.quantity <= 0) {
      matchingProduct.quantity = 0;
      message.innerHTML = `Quantity cannot be less then ${matchingProduct.quantity}!!!`;
      message.classList.add('error-message');
      span.innerHTML = matchingProduct.quantity;
      updateQuantity(productId, matchingProduct.quantity);
      renderCart(cart, desserts);
    }
  } else {
    cart.push({
      productId,
      quantity: 0,
    });
  }
}

function renderCart(cart, desserts) {
  const cartContainer = document.querySelector('.cart-products-container');
  const emptyCart = document.querySelector('.product-cart');
  const cartWithProducts = document.querySelector('.cart');
  emptyCart.style.display = 'none';
  cartWithProducts.classList.add('visible');
  let html = '';
  cart.forEach((cartItem) => {
    const dessert = desserts.find(
      (dessert) => dessert.id === parseInt(cartItem.productId),
    );
    html += `
          <article class="cart-product-container cart-product-container-${
            dessert.id
          }">
            <div class="cart-product-details">
              <h4>${dessert.name}</h4>
              <div class="cart-product-quantity">
                <span class="cart-quantity">${cartItem.quantity}x</span>
                <span class="cart-product-price">@ $${dessert.price}</span>
                <span class="cart-product-total-price">$${
                  cartItem.quantity * dessert.price
                }</span>
              </div>
            </div>
            <button class="delete-btn" data-product-id="${
              dessert.id
            }">x</button>
          </article>
    `;

    calculateCartTotal(desserts);
    calculateTotalQuantity();
  });
  cartContainer.innerHTML = html;

  const deleteBtns = document.querySelectorAll('.delete-btn');
  deleteBtns.forEach((deleteBtn) =>
    deleteBtn.addEventListener('click', () => {
      const productId = deleteBtn.dataset.productId;
      removeFromCart(productId);
      const container = document.querySelector(
        `.cart-product-container-${productId}`,
      );
      container.remove();
      changeAddToCartBtn(productId, desserts);
      calculateCartTotal(desserts);
    })
  );
}

function removeFromCart(productId) {
  const newCart = [];

  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });

  cart = newCart;
}

function calculateCartTotal(desserts) {
  let total = 0;
  cart.forEach((cartItem) => {
    const dessert = desserts.filter(
      (dessert) => dessert.id === parseInt(cartItem.productId),
    );
    total += cartItem.quantity * dessert[0].price;
  });
  document.querySelector('.cart-total-price').innerHTML = `$${total}`;
}

function calculateTotalQuantity() {
  const cartQuantity = calculateCartQuantity();
  document.querySelector(
    '.total-quantity',
  ).innerHTML = `Your Cart ( ${cartQuantity} )`;
}

function calculateOrdersTotal(desserts) {
  let total = 0;
  cart.forEach((cartItem) => {
    const dessert = desserts.filter(
      (dessert) => dessert.id === parseInt(cartItem.productId),
    );
    total += cartItem.quantity * dessert[0].price;
  });
  document.querySelector('.total-price').innerHTML = `$${total}`;
}

function renderOrderPage(cart, desserts) {
  const confirmedOrderPage = document.querySelector('.order-confirmed-page');
  const ordersContainer = document.querySelector('.ordered-products-container')
  confirmedOrderPage.classList.add('confirmed');
  document.querySelector('.products-container').style.filter = 'brightness(40%)';
  document.querySelector('header').style.filter = 'brightness(40%)';
  document.querySelector('.cart').style.filter = 'brightness(40%)';
  confirmedOrderPage.style.filter = 'brightness(100%)';

  let html = '';

  cart.forEach((cartItem) => {
    const dessert = desserts.filter(
      (dessert) => dessert.id === parseInt(cartItem.productId),
    );
    html += `
          <article class="ordered-product">
        <div class="ordered-product-image">
          <img src="${dessert[0].image.thumbnail}" alt="${dessert[0].name}" />
        </div>
        <div class="ordered-product-details">
          <h3>${dessert[0].name}</h3>
          <div class="oredered-product-quantity">
            <span class="quantity">${cartItem.quantity}x</span>
            <span class="product-price">@ $${dessert[0].price}</span>
          </div>
        </div>
        <div class="ordered-product-total-price">
          <span class="total-price">$${dessert[0].price * cartItem.quantity}</span>
        </div>
      </article>
    `
  });
  calculateOrdersTotal(desserts);
  ordersContainer.innerHTML = html;
}

async function renderPage() {
  const desserts = await fetchData();
  displayData(desserts);

  document.querySelectorAll('.product').forEach((product) =>
    product.addEventListener('click', () => {
      const productId = product.dataset.productId;
      changeAddToCartBtn(productId, desserts);
      addToCart(productId);
    }),
  );

  const confirmOrderBtn = document.querySelector('.confirm-order');
  confirmOrderBtn.addEventListener('click', () => {
    renderOrderPage(cart, desserts);
  });

  const startNewOrder = document.querySelector('.new-order');
  startNewOrder.addEventListener('click', () => {
    window.location.reload();
  });
}

renderPage();
