document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // Xử lý Modal Đăng Nhập
    // ==========================================
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeLogin = document.getElementById('closeLogin');
    const loginForm = document.getElementById('loginForm');

    // Mở modal đăng nhập
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    // Đóng modal đăng nhập
    closeLogin.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });

    // Xử lý submit form đăng nhập
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Đăng nhập thành công! (Chức năng mô phỏng)');
        loginModal.style.display = 'none';
        loginForm.reset();
    });

    // ==========================================
    // Xử lý Modal Giỏ Hàng & Chức năng Thêm vào giỏ
    // ==========================================
    const cartModal = document.getElementById('cartModal');
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.getElementById('cartCount');
    const cartCountBadge = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Mảng lưu trữ giỏ hàng
    let cart = JSON.parse(localStorage.getItem('caycanh_cart')) || [];

    // Cập nhật hiển thị số lượng trên icon giỏ hàng ngay khi tải trang
    updateCartCount();

    // Mở modal giỏ hàng
    cartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        renderCart();
        cartModal.style.display = 'block';
    });

    // Đóng modal giỏ hàng
    closeCart.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });

    // Đóng modal khi click ra ngoài (áp dụng cho cả 2 modal)
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Bắt sự kiện click vào nút "Mua" hoặc icon "Thêm vào giỏ"
    const addCartButtons = document.querySelectorAll('.buy-btn, .add-cart-icon');
    
    addCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = {
                id: this.getAttribute('data-id'),
                name: this.getAttribute('data-name'),
                price: parseInt(this.getAttribute('data-price')),
                img: this.getAttribute('data-img'),
                quantity: 1
            };

            addToCart(product);
        });
    });

    // Hàm thêm sản phẩm vào giỏ hàng
    function addToCart(product) {
        // Kiểm tra xem sản phẩm đã có trong giỏ chưa
        const existingProductIndex = cart.findIndex(item => item.id === product.id);

        if (existingProductIndex !== -1) {
            // Nếu có rồi thì tăng số lượng
            cart[existingProductIndex].quantity += 1;
        } else {
            // Nếu chưa có thì thêm mới
            cart.push(product);
        }

        // Lưu vào localStorage
        saveCart();
        // Cập nhật số lượng trên icon
        updateCartCount();
        
        // Thông báo cho người dùng
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }

    // Hàm lưu giỏ hàng vào localStorage
    function saveCart() {
        localStorage.setItem('caycanh_cart', JSON.stringify(cart));
    }

    // Hàm cập nhật số lượng hiển thị trên icon giỏ hàng
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountBadge.textContent = totalItems;
    }

    // Hàm render các sản phẩm trong Modal Giỏ hàng
    function renderCart() {
        cartItemsContainer.innerHTML = ''; // Xóa nội dung cũ
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Giỏ hàng đang trống.</p>';
            cartTotalElement.textContent = '0đ';
            return;
        }

        cart.forEach((item, index) => {
            totalPrice += item.price * item.quantity;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            
            // Định dạng tiền tệ VNĐ
            const formattedPrice = item.price.toLocaleString('vi-VN') + 'đ';

            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${formattedPrice}</p>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" data-index="${index}">
                    <button class="remove-item" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemDiv);
        });

        // Cập nhật tổng tiền
        cartTotalElement.textContent = totalPrice.toLocaleString('vi-VN') + 'đ';

        // Gắn sự kiện cho các nút Xóa và input Số lượng mới được tạo ra
        attachCartEvents();
    }

    // Hàm gắn sự kiện thay đổi số lượng và xóa sản phẩm trong giỏ hàng
    function attachCartEvents() {
        // Sự kiện thay đổi số lượng
        const qtyInputs = document.querySelectorAll('.qty-input');
        qtyInputs.forEach(input => {
            input.addEventListener('change', function() {
                const index = this.getAttribute('data-index');
                const newQty = parseInt(this.value);
                
                if (newQty > 0) {
                    cart[index].quantity = newQty;
                    saveCart();
                    updateCartCount();
                    renderCart(); // Render lại để cập nhật tổng tiền
                } else {
                    this.value = 1; // Không cho phép nhập số < 1, nếu muốn xóa thì bấm nút xóa
                }
            });
        });

        // Sự kiện xóa sản phẩm
        const removeBtns = document.querySelectorAll('.remove-item');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                if(confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                    cart.splice(index, 1); // Xóa phần tử tại vị trí index
                    saveCart();
                    updateCartCount();
                    renderCart(); // Render lại giỏ hàng
                }
            });
        });
    }

    // Xử lý nút Thanh Toán
    checkoutBtn.addEventListener('click', function() {
        if(cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }
        alert('Chuyển hướng đến trang Thanh Toán thành công!\n(Tính năng đang được phát triển)');
        // Trong thực tế, ở đây sẽ chuyển hướng (window.location.href = '/checkout')
        // Tạm thời clear giỏ hàng sau khi thanh toán giả lập
        cart = [];
        saveCart();
        updateCartCount();
        cartModal.style.display = 'none';
    });

    // ==========================================
    // Xử lý click Danh Mục Sản Phẩm
    // ==========================================
    const categoryLinks = document.querySelectorAll('.category-list a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Ngăn chặn chuyển trang
            alert('Chưa có dữ liệu');
        });
    });

});
