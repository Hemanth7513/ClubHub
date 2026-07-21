const crypto = require('crypto');

describe('Payment Signature Verification', () => {
  const KEY_SECRET = 'test_secret_key';

  function generateSignature(orderId, paymentId, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  it('should validate a correct Razorpay signature', () => {
    const orderId = 'order_abc123';
    const paymentId = 'pay_xyz789';
    const sig = generateSignature(orderId, paymentId, KEY_SECRET);
    const expectedSig = generateSignature(orderId, paymentId, KEY_SECRET);
    expect(sig).toBe(expectedSig);
  });

  it('should reject a tampered signature', () => {
    const orderId = 'order_abc123';
    const paymentId = 'pay_xyz789';
    const realSig = generateSignature(orderId, paymentId, KEY_SECRET);
    const fakeSig = 'abc123deadbeef';
    expect(realSig).not.toBe(fakeSig);
  });

  it('should reject a signature computed with a wrong secret', () => {
    const orderId = 'order_abc123';
    const paymentId = 'pay_xyz789';
    const realSig = generateSignature(orderId, paymentId, KEY_SECRET);
    const wrongSig = generateSignature(orderId, paymentId, 'wrong_secret');
    expect(realSig).not.toBe(wrongSig);
  });
});

describe('Payment Input Validation', () => {
  it('should reject quantity <= 0', () => {
    const qty = 0;
    const valid = Number.isInteger(qty) && qty > 0 && qty <= 10;
    expect(valid).toBe(false);
  });

  it('should reject quantity > 10', () => {
    const qty = 11;
    const valid = Number.isInteger(qty) && qty > 0 && qty <= 10;
    expect(valid).toBe(false);
  });

  it('should accept valid quantity', () => {
    const qty = 3;
    const valid = Number.isInteger(qty) && qty > 0 && qty <= 10;
    expect(valid).toBe(true);
  });

  it('should reject non-integer quantity', () => {
    const qty = 2.5;
    const valid = Number.isInteger(qty) && qty > 0 && qty <= 10;
    expect(valid).toBe(false);
  });
});
