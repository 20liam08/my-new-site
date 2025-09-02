// لیست محصولات شال و روسری
const products = [
    { id: 1, name: "شال حریر طرح دار", price: 850000, inStock: true, category: "تابستانی", image: "https://via.placeholder.com/200x200?text=Silk+Scarf" },
    { id: 2, name: "روسری پشمی مشکی", price: 1200000, inStock: true, category: "زمستانی", image: "https://via.placeholder.com/200x200?text=Wool+Scarf" },
    { id: 3, name: "شال کلاهی گرمایی", price: 950000, inStock: false, category: "زمستانی", image: "https://via.placeholder.com/200x200?text=Winter+Scarf" },
    { id: 4, name: "روسری کتان رنگی", price: 650000, inStock: true, category: "تابستانی", image: "https://via.placeholder.com/200x200?text=Cotton+Scarf" },
    { id: 5, name: "شال چهارخونه قدیمی", price: 750000, inStock: true, category: "طرح‌دار", image: "https://via.placeholder.com/200x200?text=Old+Fashioned" },
    { id: 6, name: "روسری ساتن براق", price: 900000, inStock: false, category: "مناسب عروسی", image: "https://via.placeholder.com/200x200?text=Bridal+Scarf" }
];

let cart = [];
let currentUser = null;

// ثبت‌نام کاربر
function registerUser(e) {
    e.preventDefault();
    const fullName = e.target[0].value.trim();
    const email = e.target[1].value.trim();
    const username = e.target[2].value.trim();
    const password = e.target[3].value.trim();

    if (!username || !password) {
        alert("نام کاربری و رمز الزامی است.");
        return;
    }

    const user = { fullName, email, username, password };
    localStorage.setItem('user', JSON.stringify(user));
    alert("ثبت نام موفق!");
    window.location.href = 'login.html';
}

// ورود کاربر
function loginUser(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser) {
        alert("حسابی وجود ندارد. ابتدا ثبت نام کنید.");
        return;
    }

    if (storedUser.username !== username || storedUser.password !== password) {
        alert("نام کاربری یا رمز اشتباه است.");
        return;
    }

    currentUser = storedUser;
    alert("ورود موفق!");
    window.location.href = 'index.html';
}

// ورود مدیر - admin / 1234
function adminLogin() {
    const username = document.getElementById('adminUser').value.trim();
    const password = document.getElementById('adminPass').value.trim();

    if (username === "admin" && password === "1234") {
        localStorage.setItem('isAdminLoggedIn', 'true');
        alert("ورود مدیر موفق!");
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('ordersSection').style.display = 'block';
        showOrders();
    } else {
        alert("نام کاربری یا رمز ادمین اشتباه است.");
    }
}

// تکمیل خرید + ذخیره سفارش
function completeCheckout(e) {
    e.preventDefault();

    const name = e.target[0].value.trim();
    const phone = e.target[1].value.trim();
    const address = e.target[2].value.trim();
    const payment = e.target[3].value;

    if (!name || !phone || !address || !payment) {
        alert("همه فیلدها الزامی هستند.");
        return;
    }

    // تولید کد پیگیری
    const trackingCode = generateTrackingCode();

    const order = {
        name,
        phone,
        address,
        payment,
        trackingCode,
        date: new Date().toLocaleString()
    };

    // ذخیره در localStorage
    saveOrderToLocalStorage(order);

    // هدایت به صفحه اصلی
    window.location.href = 'confirmation.html?tracking=' + trackingCode;
}

// تولید کد پیگیری 6 رقمی
function generateTrackingCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // عدد 6 رقمی
}

// ذخیره سفارش در localStorage
function saveOrderToLocalStorage(order) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    alert("سفارش با موفقیت ثبت شد!\nکد پیگیری: " + order.trackingCode);
}

// نمایش لیست سفارش‌ها در admin.html
function showOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tableBody = document.querySelector("#ordersTable tbody");

    tableBody.innerHTML = "";

    if (orders.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='6'>سفارشی وجود ندارد.</td></tr>";
        return;
    }

    orders.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.name}</td>
            <td>${order.phone}</td>
            <td>${order.address}</td>
            <td>${order.payment === 'online' ? 'آنلاین' : 'در محل'}</td>
            <td>${order.trackingCode}</td>
            <td>${order.date}</td>
        `;
        tableBody.appendChild(row);
    });
}

// دانلود سفارش‌ها بصورت Excel (CSV)
function exportToExcel() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orders.length === 0) {
        alert("سفارشی برای دانلود وجود ندارد.");
        return;
    }

    let csvContent = "نام,موبایل,آدرس,روش پرداخت,کد پیگیری,تاریخ\n";

    orders.forEach(order => {
        csvContent += `${order.name},${order.phone},"${order.address}",${order.payment === 'online' ? 'آنلاین' : 'در محل'},${order.trackingCode},${order.date}\n`;
    });

    const hiddenLink = document.createElement("a");
    hiddenLink.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    hiddenLink.download = "سفارشات.csv";
    document.body.appendChild(hiddenLink);
    hiddenLink.click();
    document.body.removeChild(hiddenLink);
}

// رندر محصولات
function renderProducts(containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    let filtered = [...products];

    if (filter === 'inStock') filtered = filtered.filter(p => p.inStock);
    if (filter === 'outOfStock') filtered = filtered.filter(p => !p.inStock);

    filtered.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="100%">
            <h3>${product.name}</h3>
            <p>دسته: ${product.category}</p>
            <p>${product.price.toLocaleString()} تومان</p>
            <a href="product-detail.html?id=${product.id}"><button>جزئیات</button></a>
        `;
        container.appendChild(div);
    });
}

// افزودن به سبد خرید
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    cart.push(product);
    updateCartLocalStorage();
    alert("افزوده شد!");
}

// افزودن از داخل جزئیات
function addToCartFromDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);
    if (!product) return;

    cart.push(product);
    updateCartLocalStorage();
    alert("افزوده شد!");
}

// ذخیره سبد در localStorage
function updateCartLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// نمایش سبد
function showCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    cart = JSON.parse(localStorage.getItem('cart')) || [];

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p>سبد خالی است.</p>';
        document.querySelector('[onclick="proceedToCheckout()"]').disabled = true;
        return;
    } else {
        document.querySelector('[onclick="proceedToCheckout()"]').disabled = false;
    }

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `${item.name} - ${item.price.toLocaleString()} <button onclick="removeFromCart(${index})">لغو</button>`;
        container.appendChild(div);
    });
}


// حذف از سبد
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartLocalStorage();
    showCart();
}

// فیلتر موجودی
function filterProducts() {
    const filter = document.getElementById('stockFilter').value;
    renderProducts('productList', filter);
}

// سورت قیمت
function sortProducts() {
    const sortBy = document.getElementById('sortFilter').value;
    let sorted = [...products];
    if (sortBy === 'lowToHigh') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'highToLow') sorted.sort((a, b) => b.price - a.price);

    const container = document.getElementById('productList');
    container.innerHTML = '';
    sorted.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="100%">
            <h3>${product.name}</h3>
            <p>دسته: ${product.category}</p>
            <p>${product.price.toLocaleString()}</p>
            <a href="product-detail.html?id=${product.id}"><button>جزئیات</button></a>
        `;
        container.appendChild(div);
    });
}

// جستجوی صوتی
function startVoiceSearch() {
    const searchInput = document.getElementById('searchInput');

    if (!('webkitSpeechRecognition' in window)) {
        alert("جستجوی صوتی پشتیبانی نمیشه.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'fa-IR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        filterProductsBySearch(transcript);
    };

    recognition.onerror = function(event) {
        alert("خطا در تشخیص صدا: " + event.error);
    };
}

// فیلتر بر اساس جستجو
function filterProductsBySearch(query) {
    const container = document.getElementById('productList');
    container.innerHTML = '';
    const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

    if (filtered.length === 0) {
        container.innerHTML = '<p>محصولی یافت نشد.</p>';
        return;
    }

    filtered.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="100%">
            <h3>${product.name}</h3>
            <p>دسته: ${product.category}</p>
            <p>${product.price.toLocaleString()}</p>
            <a href="product-detail.html?id=${product.id}"><button>جزئیات</button></a>
        `;
        container.appendChild(div);
    });
}

// نمایش جزئیات محصول
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (!product) {
        document.getElementById('productTitle').textContent = "محصولی یافت نشد.";
        return;
    }

    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productPriceText').textContent = product.price.toLocaleString();
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productStock').textContent = product.inStock ? "موجود" : "ناموجود";
    document.getElementById('productImage').src = product.image;
}

// منوی دسته‌بندی
function filterByCategory(category) {
    const container = document.getElementById("productList");
    if (!container) return;

    container.innerHTML = "";
    if (category === 'all') {
        renderProducts("productList");
        return;
    }

    const filtered = products.filter(p => p.category === category);

    if (filtered.length === 0) {
        container.innerHTML = "<p>محصولی وجود ندارد.</p>";
        return;
    }

    filtered.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="100%">
            <h3>${product.name}</h3>
            <p>دسته: ${product.category}</p>
            <p>${product.price.toLocaleString()} تومان</p>
            <a href="product-detail.html?id=${product.id}"><button>جزئیات</button></a>
        `;
        container.appendChild(div);
    });
}

// جستجوی خودکار توی input
function autoSearch() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const container = document.getElementById("productList");
    if (!container) return;

    container.innerHTML = "";
    const results = products.filter(p => p.name.toLowerCase().includes(query));

    if (results.length === 0) {
        container.innerHTML = "<p>محصولی یافت نشد.</p>";
        return;
    }

    results.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="100%">
            <h3>${product.name}</h3>
            <p>دسته: ${product.category}</p>
            <p>${product.price.toLocaleString()} تومان</p>
            <a href="product-detail.html?id=${product.id}"><button>جزئیات</button></a>
        `;
        container.appendChild(div);
    });
}

// نمایش محصولات ویژه در index.html
function renderFeaturedProducts() {
    const container = document.getElementById("featuredList");
    if (!container) return;

    const featured = products.filter(p => 
        p.category.includes("طرح") || 
        p.category.includes("مناسب عروسی")
    );

    featured.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" width="100%">
            <h3>${product.name}</h3>
            <p>دسته: ${product.category}</p>
            <p>${product.price.toLocaleString()} تومان</p>
            <a href="product-detail.html?id=${product.id}"><button>جزئیات</button></a>
        `;
        container.appendChild(div);
    });
}

// دکمه AI
function toggleAIChat() {
    const chatBox = document.getElementById('aiChatBox');
    chatBox.style.display = chatBox.style.display === 'flex' ? 'none' : 'flex';
}

// ارسال سوال کاربر
function sendUserQuestion() {
    const input = document.getElementById('userQuestion');
    const question = input.value.trim();
    if (!question) return;

    addMessage('شما:', question, 'user-message');
    let answer = getFakeAnswer(question);
    addMessage('ربات:', answer, 'bot-message');

    input.value = '';
}

// ارسال خودکار سوالات متداول
function autoAsk(button) {
    const question = button.getAttribute('data-question');
    addMessage('شما:', question, 'user-message');
    let answer = getFakeAnswer(question);
    addMessage('ربات:', answer, 'bot-message');
}

// افزودن پیام به چت
function addMessage(sender, message, className) {
    const chatBox = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<strong>${sender}</strong><br>${message}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// جواب‌های شبیه‌سازی شده
function getFakeAnswer(question) {
    question = question.toLowerCase();

    if (question.includes("اندازه") || question.includes("طول")) {
        return "شال‌های مستطیلی بین 150 تا 200 سانتی‌متر مناسب هستند.";
    } else if (question.includes("تابستان") || question.includes("کتان") || question.includes("حریر")) {
        return "شال‌های کتانی یا حریری بهترین گزینه برای تابستان هستند.";
    } else if (question.includes("تمیز") || question.includes("شویی")) {
        return "شال‌های پشمی را خشک‌شویی کنید و کتانی‌ها را با دست بشویید.";
    } else if (question.includes("تعویض") || question.includes("بازگشت")) {
        return "بله، در صورت عدم استفاده قابل تعویض هستند.";
    } else if (question.includes("رنگ") || question.includes("طرح")) {
        return "رنگ‌های طبیعی مثل خاکستری، بژ و سفید زیبا هستند.";
    } else if (question.includes("سلام") || question.includes("درود")) {
        return "سلام! چطور میتونم کمکت کنم؟";
    } else if (question.includes("قیمت")) {
        return "قیمت‌ها در صفحه محصولات مشخص شده. میتونی جستجو کنی یا فیلتر کنی.";
    } else if (question.includes("خرید") || question.includes("سفارش")) {
        return "شما میتونی از صفحه سبد خرید، فرآیند خریدت رو ادامه بدی.";
    } else if (question.includes("دوره کنم") || question.includes("گره") || question.includes("پوشیدن")) {
        return "میتونی شال رو دور بزنی، گره بزنی یا به سبک‌های مختلف بپوشی.";
    } else if (question.includes("موقعیت") || question.includes("استفاده")) {
        return "شال رو میتونی توی موقعیت‌های غیررسمی، رسمی و حتی تابستان استفاده کنی.";
    } else if (question.includes("عروسی") || question.includes("مراسم")) {
        return "شال‌های ساتن یا حریری براحتی مناسب مراسم عروسی هستند.";
    } else if (question.includes("روسری")) {
        return "روسری‌ها معمولاً برای استفاده با حجاب مناسب هستند.";
    } else {
        return "متاسفانه الان نمیتونم به این سوال جواب دقیق بدم، ولی میتونی با پشتیبانی چت کنی.";
    }
}

// فرم درخواست نقل‌قول
function submitQuote(e) {
    e.preventDefault();
    const name = e.target[0].value.trim();
    const email = e.target[1].value.trim();
    const phone = e.target[2].value.trim();
    const message = e.target[3].value.trim();

    if (!name || !email || !phone || !message) {
        alert("همه فیلدها الزامی هستند.");
        return;
    }

    alert("پیام شما با موفقیت ارسال شد.\nدر اسرع وقت با شما تماس میگیریم.");
}

// نمایش محصولات + سبد خرید + جزئیات
window.onload = () => {
    renderProducts("productList"); // نمایش محصولات
    showCart(); // نمایش سبد خرید
    if (window.location.pathname.endsWith('product-detail.html')) {
        loadProductDetails(); // بارگذاری جزئیات
    }
};

// 🔁 رفتن به checkout.html
function proceedToCheckout() {
    window.location.href = 'checkout.html';
}