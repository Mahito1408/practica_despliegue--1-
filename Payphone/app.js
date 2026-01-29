/**
 * Mahito Store - integración PayPhone
 * Gestión de carrito de compras y pasarela de pago
 */

// ============================================
// CONFIGURACIÓN DE PAYPHONE
// ============================================
const PAYPHONE_CONFIG = {
    token: 'Iq_lZ81dXVzBi3hRJONlrUC-XreoEEYKE-N19ZodnvwPtW-_o7tWHRx4Ny3lmfnFRcHN6K1LTGcJu2Zk8m5lSoZ_ExWez7YMmeuGSxRo5MCVJqwIDQj7rkl82SaANDQE3kQPxsiKFYaP94EepUunyo3ZF5hnKsBcyp5T0NthjYIStBM1fMqIiGetkNFbkwOWHddGbb3WmFLshQYdFt909Fp-oRifpgTCvKDix11LMRYqA4u0PYshPIYPER14sMv1h_Iv317jzmUHqekKvUvokdtZPAQtgl4kandQ6Pc5ubkQA2lLBjNBIL3njzR7__sBOBg6JA',
    storeId: '944ae923-3814-4870-98ca-8093704deeaf',
    currency: 'USD',
    lang: 'es',
    timeZone: -5,
    // Tasa de IVA en Ecuador (15%)
    taxRate: 0.15
};

// ============================================
// CATÁLOGO DE PRODUCTOS (8 Samsung)
// ============================================
const PRODUCTS = [
  {
    id: 0,
    name: 'Samsung Galaxy S24 Ultra',
    category: 'smartphones',
    price: 1299.99,
    description: 'Pantalla 6.8" QHD+, cámara 200MP, S Pen integrado, rendimiento premium para todo.',
    image: 'images/s24ultra.jpg',
    badge: 'Top'
  },
  {
    id: 1,
    name: 'Samsung Galaxy S24+',
    category: 'smartphones',
    price: 999.99,
    description: 'Pantalla grande AMOLED, fotos nítidas de día y noche, batería duradera y carga rápida.',
    image: 'images/s24plus.jpeg',
    badge: 'Nuevo'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    category: 'smartphones',
    price: 849.99,
    description: 'Compacto y potente: cámara avanzada, pantalla AMOLED fluida y gran rendimiento diario.',
    image: 'images/s24.jpg',
    badge: null
  },
  {
    id: 3,
    name: 'Samsung Galaxy S23 FE',
    category: 'smartphones',
    price: 599.99,
    description: 'Experiencia Galaxy equilibrada: cámara versátil, pantalla AMOLED y buen desempeño.',
    image: 'images/s23fe.jpg',
    badge: 'Recomendado'
  },
  {
    id: 4,
    name: 'Samsung Galaxy Z Flip5',
    category: 'smartphones',
    price: 999.99,
    description: 'Plegable estilo flip: pantalla externa útil, diseño compacto y fotos creativas.',
    image: 'images/zflip5.jpg',
    badge: 'Plegable'
  },
  {
    id: 5,
    name: 'Samsung Galaxy Z Fold5',
    category: 'smartphones',
    price: 1799.99,
    description: 'Productividad total: se abre tipo tablet, multitarea avanzada y experiencia premium.',
    image: 'images/zfold5.jpeg',
    badge: 'Premium'
  },
  {
    id: 6,
    name: 'Samsung Galaxy A55 5G',
    category: 'smartphones',
    price: 449.99,
    description: 'Gama media sólida: pantalla AMOLED, cámara confiable, 5G y buena batería.',
    image: 'images/a55.jpeg',
    badge: 'Mejor precio'
  },
  {
    id: 7,
    name: 'Samsung Galaxy A15 5G',
    category: 'smartphones',
    price: 219.99,
    description: 'Accesible y completo: 5G, batería de larga duración y pantalla amplia para el día a día.',
    image: 'images/a15.jpg',
    badge: 'Económico'
  }
];


// ============================================
// ESTADO DEL CARRITO
// ============================================
let cart = [];

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const elements = {
    productsGrid: document.getElementById('products-grid'),
    cartButton: document.getElementById('cart-button'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartSidebar: document.getElementById('cart-sidebar'),
    cartClose: document.getElementById('cart-close'),
    cartItems: document.getElementById('cart-items'),
    cartCount: document.getElementById('cart-count'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartTax: document.getElementById('cart-tax'),
    cartTotal: document.getElementById('cart-total'),
    checkoutBtn: document.getElementById('checkout-btn'),
    paymentModal: document.getElementById('payment-modal'),
    modalClose: document.getElementById('modal-close'),
    orderItems: document.getElementById('order-items'),
    orderSubtotal: document.getElementById('order-subtotal'),
    orderTax: document.getElementById('order-tax'),
    orderTotal: document.getElementById('order-total'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    contactForm: document.getElementById('contact-form')
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromStorage();
    setupEventListeners();
    updateCartUI();
});

// ============================================
// RENDERIZADO DE PRODUCTOS
// ============================================
function loadProducts(filter = 'all') {
    const filteredProducts = filter === 'all'
        ? PRODUCTS
        : PRODUCTS.filter(p => p.category === filter);

    elements.productsGrid.innerHTML = filteredProducts.map(product => `
        <article class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${getCategoryName(product.category)}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">
                        $${Math.floor(product.price)}<span class="cents">.${(product.price % 1).toFixed(2).slice(2)}</span>
                    </span>
                    <button class="add-to-cart-btn" data-product-id="${product.id}" aria-label="Agregar ${product.name} al carrito">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    // Agregar event listeners a los botones de agregar al carrito
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
}

function getCategoryName(category) {
    const names = {
        audio: 'Audio',
        smartphones: 'Smartphones',
        laptops: 'Laptops',
        accesorios: 'Accesorios'
    };
    return names[category] || category;
}

// ============================================
// GESTIÓN DEL CARRITO
// ============================================
function handleAddToCart(e) {
    const productId = parseInt(e.currentTarget.dataset.productId);
    const product = PRODUCTS.find(p => p.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartUI();
    showToast(`${product.name} agregado al carrito`);

    // Animación del botón
    const btn = e.currentTarget;
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 200);
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCartToStorage();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
    showToast('Producto eliminado del carrito');
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartUI();
}

// ============================================
// CÁLCULOS DE TOTALES
// ============================================
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * PAYPHONE_CONFIG.taxRate;
    const total = subtotal + tax;

    return {
        subtotal: subtotal,
        tax: tax,
        total: total,
        // PayPhone requiere los montos en centavos (enteros)
        subtotalCents: Math.round(subtotal * 100),
        taxCents: Math.round(tax * 100),
        totalCents: Math.round(total * 100)
    };
}

// ============================================
// ACTUALIZACIÓN DE UI DEL CARRITO
// ============================================
// Límite máximo de PayPhone en modo pruebas: $1000 USD
// Puedes cambiar esto a un valor alto para desactivar la restricción
const PAYPHONE_MAX_AMOUNT = 999999; // Sin restricción

function updateCartUI() {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totals = calculateTotals();
    const exceedsLimit = totals.total > PAYPHONE_MAX_AMOUNT;

    // Actualizar contador del carrito
    elements.cartCount.textContent = itemCount;

    // Actualizar lista de items en el carrito
    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Tu carrito está vacío</p>
                <p>¡Agrega algunos productos increíbles!</p>
            </div>
        `;
        elements.checkoutBtn.disabled = true;
    } else {
        elements.cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})" aria-label="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Deshabilitar checkout si excede el límite
        elements.checkoutBtn.disabled = exceedsLimit;
    }

    // Actualizar totales
    elements.cartSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
    elements.cartTax.textContent = `$${totals.tax.toFixed(2)}`;
    elements.cartTotal.textContent = `$${totals.total.toFixed(2)}`;

    // Mostrar/ocultar advertencia de límite
    const warningEl = document.getElementById('cart-warning');
    if (warningEl) {
        if (exceedsLimit) {
            warningEl.style.display = 'block';
            warningEl.innerHTML = `⚠️ <strong>Límite excedido:</strong> PayPhone permite máximo <strong>$${PAYPHONE_MAX_AMOUNT} USD</strong> por transacción. Tu total es $${totals.total.toFixed(2)}. Por favor reduce la cantidad de productos.`;
            warningEl.style.background = '#fef2f2';
            warningEl.style.color = '#dc2626';
            warningEl.style.border = '1px solid #dc2626';
        } else if (cart.length > 0) {
            warningEl.style.display = 'block';
            warningEl.innerHTML = `ℹ️ Modo prueba: Máximo $${PAYPHONE_MAX_AMOUNT} USD`;
            warningEl.style.background = '#fef3c7';
            warningEl.style.color = '#92400e';
            warningEl.style.border = 'none';
        } else {
            warningEl.style.display = 'none';
        }
    }
}

// ============================================
// MODAL DE PAGO Y PAYPHONE
// ============================================
function openPaymentModal() {
    const totals = calculateTotals();

    // Actualizar resumen del pedido en el modal
    elements.orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-image"><img src="${item.image}" alt="${item.name}"></div>
            <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-qty">Cantidad: ${item.quantity}</div>
            </div>
            <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    elements.orderSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
    elements.orderTax.textContent = `$${totals.tax.toFixed(2)}`;
    elements.orderTotal.textContent = `$${totals.total.toFixed(2)}`;

    // Cerrar el sidebar del carrito
    closeCart();

    // Abrir modal
    elements.paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Inicializar PayPhone después de un pequeño delay para asegurar que el DOM está listo
    setTimeout(() => {
        initializePayPhone(totals);
    }, 300);
}

function closePaymentModal() {
    elements.paymentModal.classList.remove('active');
    document.body.style.overflow = '';

    // Limpiar el contenedor del botón de PayPhone
    const ppButton = document.getElementById('pp-button');
    if (ppButton) {
        ppButton.innerHTML = '';
    }
}

/**
 * INICIALIZACIÓN DE PAYPHONE - CAJITA DE PAGOS
 * 
 * Esta función configura e inicializa el SDK de PayPhone para procesar pagos.
 * 
 * REQUEST (Solicitud):
 * - token: Credencial de autenticación obtenida desde PayPhone Developer
 * - amount: Monto total en centavos (suma de todos los conceptos)
 * - amountWithTax: Monto base gravable en centavos (antes de impuestos)
 * - tax: Monto del impuesto en centavos
 * - clientTransactionId: Identificador único de la transacción generado por el comercio
 * - storeId: Identificador de la tienda en PayPhone
 * - reference: Descripción/motivo del pago
 * - currency: Moneda (USD para Ecuador)
 * - lang: Idioma del formulario
 * - timeZone: Zona horaria (-5 para Ecuador)
 * 
 * El SDK renderiza un formulario de pago seguro que acepta:
 * - Tarjetas de crédito/débito (Visa, Mastercard, Diners, Discover)
 * - Saldo PayPhone
 * 
 * @param {Object} totals - Objeto con los totales calculados
 */
function initializePayPhone(totals) {
    // Limpiar cualquier instancia anterior
    const ppButton = document.getElementById('pp-button');
    if (ppButton) {
        ppButton.innerHTML = '';
    }

    // Generar ID único de transacción para el comercio
    // Este ID permite rastrear la transacción en nuestro sistema
    const clientTransactionId = generateTransactionId();

    // Guardar el ID de transacción para referencia posterior
    localStorage.setItem('lastTransactionId', clientTransactionId);

    // Crear referencia descriptiva del pedido
    const reference = `Compra en Mahito Store - ${cart.length} producto(s)`;

    console.log('=== PAYPHONE REQUEST ===');
    console.log('Iniciando transacción PayPhone');
    console.log('Client Transaction ID:', clientTransactionId);
    console.log('Subtotal (centavos):', totals.subtotalCents);
    console.log('IVA (centavos):', totals.taxCents);
    console.log('Total (centavos):', totals.totalCents);
    console.log('Referencia:', reference);
    console.log('=======================');

    try {
        // Verificar que el SDK de PayPhone esté cargado
        if (typeof PPaymentButtonBox === 'undefined') {
            console.error('PayPhone SDK no está cargado');
            showToast('Error: No se pudo cargar el sistema de pagos');
            return;
        }

        // Configuración completa de la Cajita de Pagos PayPhone
        // Los montos deben estar en CENTAVOS (multiplicar dólares por 100)
        const ppb = new PPaymentButtonBox({
            // === CREDENCIALES DE AUTENTICACIÓN ===
            token: PAYPHONE_CONFIG.token,
            storeId: PAYPHONE_CONFIG.storeId,

            // === MONTOS DE LA TRANSACCIÓN (en centavos) ===
            // amount = amountWithTax + tax (total a cobrar)
            amount: totals.totalCents,
            // Monto base gravable (antes del impuesto)
            amountWithTax: totals.subtotalCents,
            // Monto del IVA
            tax: totals.taxCents,
            // Propina (opcional)
            tip: 0,
            // Cargo por servicio (opcional)
            service: 0,

            // === IDENTIFICACIÓN DE LA TRANSACCIÓN ===
            // ID único generado por nuestro sistema para rastrear la transacción
            clientTransactionId: clientTransactionId,
            // Descripción/motivo del pago
            reference: reference,

            // === CONFIGURACIÓN REGIONAL ===
            currency: PAYPHONE_CONFIG.currency,
            lang: PAYPHONE_CONFIG.lang,
            timeZone: PAYPHONE_CONFIG.timeZone,

            // === MÉTODO DE PAGO POR DEFECTO ===
            // "card" = Tarjeta de crédito/débito
            // "payphone" = Saldo PayPhone
            defaultMethod: 'card'

        }).render('pp-button');

        console.log('PayPhone: Cajita de pagos renderizada exitosamente');

    } catch (error) {
        console.error('Error al inicializar PayPhone:', error);
        showToast('Error al cargar el formulario de pago');
    }
}

/**
 * Genera un ID único de transacción
 * Formato: TS-YYYYMMDD-HHMMSS-RANDOM
 */
function generateTransactionId() {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TS-${dateStr}-${random}`;
}

// ============================================
// GESTIÓN DE APERTURA/CIERRE DEL CARRITO
// ============================================
function openCart() {
    elements.cartSidebar.classList.add('active');
    elements.cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    elements.cartSidebar.classList.remove('active');
    elements.cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// ALMACENAMIENTO LOCAL
// ============================================
function saveCartToStorage() {
    localStorage.setItem('techstore_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('techstore_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
}

// ============================================
// NOTIFICACIONES TOAST
// ============================================
function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Carrito
    elements.cartButton.addEventListener('click', openCart);
    elements.cartClose.addEventListener('click', closeCart);
    elements.cartOverlay.addEventListener('click', closeCart);

    // Checkout
    elements.checkoutBtn.addEventListener('click', openPaymentModal);

    // Modal de pago
    elements.modalClose.addEventListener('click', closePaymentModal);
    elements.paymentModal.addEventListener('click', (e) => {
        if (e.target === elements.paymentModal) {
            closePaymentModal();
        }
    });

    // Filtros de productos
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProducts(btn.dataset.filter);
        });
    });

    // Formulario de contacto
    if (elements.contactForm) {
        elements.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('¡Mensaje enviado! Te contactaremos pronto.');
            e.target.reset();
        });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closePaymentModal();
        }
    });

    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// FUNCIONES GLOBALES (para onclick en HTML)
// ============================================
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

// ============================================
// VERIFICAR RESPUESTA DE PAYPHONE
// ============================================
// Esta función se ejecuta al cargar la página para verificar si 
// hay una respuesta de PayPhone en los parámetros de la URL
(function checkPayPhoneResponse() {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');
    const clientTransactionId = urlParams.get('clientTransactionId');

    console.log('Verificando parámetros de PayPhone...');
    console.log('URL actual:', window.location.href);
    console.log('Transaction ID:', transactionId);
    console.log('Client Transaction ID:', clientTransactionId);

    if (transactionId && clientTransactionId) {
        console.log('=== PAYPHONE RESPONSE DETECTADO ===');
        console.log('Transaction ID (PayPhone):', transactionId);
        console.log('Client Transaction ID:', clientTransactionId);
        console.log('Redirigiendo a respuesta.html...');
        console.log('===================================');

        // Redirigir inmediatamente a la página de respuesta
        // NO limpiar la URL antes porque eso puede causar problemas
        const redirectUrl = `respuesta.html?id=${encodeURIComponent(transactionId)}&clientTransactionId=${encodeURIComponent(clientTransactionId)}`;
        console.log('Redirect URL:', redirectUrl);

        // Usar replace para que no quede en el historial
        window.location.replace(redirectUrl);
    }
})();

