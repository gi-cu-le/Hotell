// --- Mobile menu functionality ---
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger');
    mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger');
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// --- Testimonials carousel ---
let currentSlide = 0;
const totalSlides = 5;

function showSlide(index) {
    const carousel = document.getElementById('carousel');
    const dots = document.querySelectorAll('.nav-dot');
    
    if (index >= totalSlides) currentSlide = 0;
    else if (index < 0) currentSlide = totalSlides - 1;
    else currentSlide = index;
    
    carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

function nextSlide() { showSlide(currentSlide + 1); }
function previousSlide() { showSlide(currentSlide - 1); }
function currentSlideNav(index) { showSlide(index - 1); }
setInterval(nextSlide, 5000);

// --- Helper: UTC date parsing ---
function getUTCDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

// --- Price calculation ---
function calculatePrice() {
    const checkinDate = document.getElementById('checkin').value;
    const checkoutDate = document.getElementById('checkout').value;
    const selectedRoom = document.querySelector('input[name="rooms"]:checked');
    const guestsSelect = document.querySelector('select[required]');
    const guests = guestsSelect ? parseInt(guestsSelect.value) || 2 : 2;
    const priceDetails = document.getElementById('priceDetails');

    if (!checkinDate || !checkoutDate || !selectedRoom) {
        priceDetails.innerHTML = '<p>Välj datum och antal rum för att se pris</p>';
        return null;
    }

    const checkin = getUTCDate(checkinDate);
    const checkout = getUTCDate(checkoutDate);
    const nights = Math.floor((checkout - checkin) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
        priceDetails.innerHTML = '<p class="error">Utcheckningsdatum måste vara efter incheckningsdatum</p>';
        return null;
    }

    const roomPrices = { '1': 1200, '2': 2200, '3': 3000 };
    const roomPricePerNight = roomPrices[selectedRoom.value];
    const basePrice = roomPricePerNight * nights;

    let servicesTotal = 0;
    let servicesDetails = [];

    const checkboxes = document.querySelectorAll('.service-checkbox input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        if (cb.value === 'spa') {
            servicesTotal += 500;
            servicesDetails.push({ name: 'Spa-behandling', cost: 500 });
        }
        if (cb.value === 'viking-dinner') {
            const cost = 350 * guests;
            servicesTotal += cost;
            servicesDetails.push({ name: `Vikingamiddag (350 kr × ${guests} gäster)`, cost });
        }
        if (cb.value === 'breakfast') {
            const cost = 150 * guests * nights;
            servicesTotal += cost;
            servicesDetails.push({ name: `Frukost (150 kr × ${guests} gäster × ${nights} nätter)`, cost });
        }
        if (cb.value === 'transfer') {
            servicesTotal += 400;
            servicesDetails.push({ name: 'Transfer från flygplats', cost: 400 });
        }
    });

    const totalPrice = basePrice + servicesTotal;

    // --- Update price display on page ---
    let html = `
        <div class="price-breakdown">
            <h4>Bokningsdetaljer:</h4>
            <p><strong>${nights} ${nights === 1 ? 'natt' : 'nätter'}</strong> för ${guests} gäster</p>
            <p>${roomPricePerNight} kr/natt × ${nights} nätter = ${basePrice.toLocaleString()} kr</p>
    `;

    if (servicesDetails.length > 0) {
        html += `<h5>Tilläggstjänster:</h5>`;
        servicesDetails.forEach(s => {
            html += `<p>${s.name}: ${s.cost.toLocaleString()} kr</p>`;
        });
    }

    html += `<h3>Totalt: ${totalPrice.toLocaleString()} kr</h3></div>`;
    priceDetails.innerHTML = html;

    // Return all details for booking confirmation
    return {
        checkinDate,
        checkoutDate,
        nights,
        guests,
        roomType: selectedRoom.value,
        roomPricePerNight,
        basePrice,
        servicesDetails,
        servicesTotal,
        totalPrice
    };
}

// --- Event listeners ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('priceDetails').innerHTML = '<p>Välj datum och antal rum för att se pris</p>';

    const inputs = [
        document.getElementById('checkin'),
        document.getElementById('checkout'),
        ...document.querySelectorAll('input[name="rooms"]'),
        document.querySelector('select[required]'),
        ...document.querySelectorAll('.service-checkbox input[type="checkbox"]')
    ].filter(Boolean);

    inputs.forEach(input => input.addEventListener('change', calculatePrice));

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();

            const name = document.querySelector('input[type="text"]').value;
            const email = document.querySelector('input[type="email"]').value;
            if (!name || !email) {
                alert('Vänligen fyll i namn och e-postadress');
                return;
            }

            const booking = calculatePrice();
            if (!booking) {
                alert('Vänligen fyll i bokningsdetaljer innan du skickar.');
                return;
            }

            showBookingConfirmation(name, booking);
            contactForm.reset();
            document.getElementById('priceDetails').innerHTML = '<p>Välj datum och antal rum för att se pris</p>';
        });
    }
});

// --- Booking confirmation ---
function showBookingConfirmation(name, booking) {
    let message = `✅ BOKNINGSFÖRFRÅGAN SKICKAD\n\n`;
    message += `Tack ${name}!\n`;
    message += `Incheckning: ${formatDate(booking.checkinDate)}\n`;
    message += `Utcheckning: ${formatDate(booking.checkoutDate)}\n`;
    message += `Antal nätter: ${booking.nights}\n`;
    message += `Antal gäster: ${booking.guests}\n`;
    message += `Rum: ${booking.roomPricePerNight} kr/natt × ${booking.nights} nätter = ${booking.basePrice.toLocaleString()} kr\n\n`;

    if (booking.servicesDetails.length > 0) {
        message += `Tillägg:\n`;
        booking.servicesDetails.forEach(s => {
            message += `• ${s.name}: ${s.cost.toLocaleString()} kr\n`;
        });
        message += `\n`;
    }

    message += `Totalt pris: ${booking.totalPrice.toLocaleString()} kr\n\n`;
    message += `📧 Vi skickar bekräftelse till din email inom 24 timmar.\n📞 Vid frågor, ring oss på 0123-456 789.\n\n`;
    message += `Välkommen till Country House - där tiden stannar!`;

    alert(message);
}

// --- Date formatting ---
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
}
