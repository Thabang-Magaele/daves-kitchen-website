document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = document.querySelectorAll('.food-item');
    const totalDisplay = document.getElementById('totalPrice');
    const deliveryFeeDisplay = document.getElementById('deliveryFeeDisplay');
    const orderForm = document.getElementById('orderForm');
    
    // Delivery Elements
    const orderMethodRadios = document.querySelectorAll('input[name="orderMethod"]');
    const deliveryFields = document.getElementById('deliveryFields');
    const deliveryAddress = document.getElementById('deliveryAddress');
    const deliveryInstructions = document.getElementById('deliveryInstructions');

    // Toggle Delivery Fields Logic and Trigger Recalculation
    orderMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'delivery') {
                deliveryFields.classList.remove('hidden');
                deliveryAddress.required = true;
            } else {
                deliveryFields.classList.add('hidden');
                deliveryAddress.required = false;
                deliveryAddress.value = '';
                deliveryInstructions.value = '';
            }
            calculateTotal(); // Recalculate instantly when switching methods
        });
    });

    // Enable/Disable quantity inputs and calculate total
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const qtyInput = this.closest('.food-selection').querySelector('.qty');
            if(this.checked) {
                qtyInput.disabled = false;
            } else {
                qtyInput.disabled = true;
                qtyInput.value = 1; // reset quantity
            }
            calculateTotal();
        });
    });

    // Recalculate total when quantity changes
    const qtyInputs = document.querySelectorAll('.qty');
    qtyInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });

    function calculateTotal() {
        let subtotal = 0;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const price = parseFloat(checkbox.value);
                const qty = parseInt(checkbox.closest('.food-selection').querySelector('.qty').value);
                subtotal += price * qty;
            }
        });

        // Check if Delivery is selected
        const isDelivery = document.querySelector('input[name="orderMethod"]:checked').value === 'delivery';
        let deliveryFee = isDelivery ? 15 : 0;

        // Show or Hide the Delivery Fee text on screen
        if (isDelivery && subtotal > 0) {
            deliveryFeeDisplay.classList.remove('hidden');
        } else {
            deliveryFeeDisplay.classList.add('hidden');
        }

        // Calculate final amount
        const finalTotal = subtotal > 0 ? (subtotal + deliveryFee) : 0;
        totalDisplay.textContent = finalTotal.toFixed(2);
        
        return { subtotal, deliveryFee, finalTotal };
    }

    // Handle form submission and send to WhatsApp
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let hasItems = false;
        let orderItemsText = "";
        
        // Gather selected items
        checkboxes.forEach(cb => {
            if (cb.checked) {
                hasItems = true;
                const itemName = cb.parentElement.textContent.trim().split(' (')[0]; // Gets the name without the price in brackets
                const itemPrice = parseFloat(cb.value);
                const qty = parseInt(cb.closest('.food-selection').querySelector('.qty').value);
                const itemTotal = itemPrice * qty;
                
                orderItemsText += `\n - ${qty}x ${itemName} - R${itemTotal}\n`;
            }
        });

        if (!hasItems) {
            alert("Please select at least one item to order, ne!");
            return;
        }

        // Gather Customer Info
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        
        // Gather Order Method
        const orderMethod = document.querySelector('input[name="orderMethod"]:checked').value;
        
        // Gather Payment Method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const paymentText = paymentMethod === 'cash' ? 'Cash' : 'Card Machine';

        const totals = calculateTotal();

        // Build the WhatsApp Message
        let whatsappMessage = `*NEW ORDER - DAVE'S KITCHEN*\n\n`;
        whatsappMessage += `Customer: ${customerName}\n`;
        whatsappMessage += `Phone: ${customerPhone}\n`;
        whatsappMessage += `Order Method: ${orderMethod.toUpperCase()}\n`;
        whatsappMessage += `Payment: ${paymentText}\n\n`;

        if (orderMethod === 'delivery') {
            whatsappMessage += `Delivery Address:\n${deliveryAddress.value}\n`;
            if (deliveryInstructions.value) {
                whatsappMessage += `Delivery Notes: ${deliveryInstructions.value}\n`;
            }
            whatsappMessage += `\n`;
        }

        whatsappMessage += `ORDER DETAILS: `;
        whatsappMessage += orderItemsText;
        
        // Detailed Pricing Breakdown
        whatsappMessage += `\nSubtotal: R${totals.subtotal.toFixed(2)}\n`;
        if (totals.deliveryFee > 0) {
            whatsappMessage += `Delivery Fee: R${totals.deliveryFee.toFixed(2)}\n`;
        }
        whatsappMessage += `**TOTAL DUE: R${totals.finalTotal.toFixed(2)}**\n\n`;
        whatsappMessage += `*NEW ORDER - DAVE'S KITCHEN*`;


        // The exact WhatsApp number provided
        const whatsappNumber = "27824555036"; 
        
        // Encode the message for the URL
        const encodedMessage = encodeURIComponent(whatsappMessage);
        
        // Create the WhatsApp link
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Redirect the user to WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Optional: Reset form or show success on screen after redirecting
        orderForm.reset();
        calculateTotal();
        // Hide delivery fields just in case they were open
        deliveryFields.classList.add('hidden');
    });
});