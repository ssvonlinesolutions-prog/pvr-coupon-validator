class PVRCouponValidator {
  // ...existing methods...

  getBookingInputs() {
    return {
      bookingId: document.getElementById('bookingId')?.value?.trim(),
      transId: document.getElementById('transId')?.value?.trim(),
      ccode: document.getElementById('ccode')?.value?.trim(),
      city: document.getElementById('city')?.value?.trim(),
    };
  }

  async testCoupon(couponCode) {
    const bookingData = this.getBookingInputs();

    if (!bookingData.bookingId || !bookingData.transId || !bookingData.ccode || !bookingData.city) {
      this.addLog('❌ ERROR: Please fill all booking fields.', 'error');
      return { error: true, message: 'Missing booking info' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);

    const response = await fetch('/api/test-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        coupon: couponCode,
        ...bookingData
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const result = await response.json();
    // ...existing processing...
  }
  // ...remaining methods...
}
// Call new PVRCouponValidator() on DOMContentLoaded...
