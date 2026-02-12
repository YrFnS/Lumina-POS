import { useEffect } from 'react';
import { Product, Order, HardwareConfig } from '../types';

/**
 * Hook to listen for Barcode Scanner HID input
 * Scanners usually act as keyboards, sending characters rapidly followed by Enter
 */
export const useBarcodeScanner = (
  products: Product[],
  onScan: (product: Product) => void,
  disabled: boolean = false
) => {
  useEffect(() => {
    if (disabled) return;

    let buffer = '';
    let lastKeyTime = Date.now();
    const SCAN_TIMEOUT = 50; // ms between keystrokes to be considered "machine speed"

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on an input field (search bar, etc)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const now = Date.now();
      
      // Reset buffer if typing is too slow (likely manual human input)
      if (now - lastKeyTime > SCAN_TIMEOUT) {
        buffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length > 2) {
          // Attempt to find product by SKU or ID
          // Note: In real app, you might have a dedicated 'barcode' field
          const product = products.find(p => 
            p.sku.toLowerCase() === buffer.toLowerCase() || 
            p.id === buffer || 
            (p.barcode && p.barcode === buffer)
          );

          if (product) {
            onScan(product);
            // Visual/Audio feedback could go here
          }
        }
        buffer = '';
      } else if (e.key.length === 1) {
        // Collect printable characters
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, onScan, disabled]);
};

/**
 * Generates a thermal receipt and triggers print dialog
 */
export const printReceipt = (order: Order, config: HardwareConfig, lang: 'en' | 'ar') => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const isRtl = lang === 'ar';
  const width = config.printerWidth === '58mm' ? '58mm' : '80mm';
  
  // Basic receipt template
  const html = `
    <!DOCTYPE html>
    <html dir="${isRtl ? 'rtl' : 'ltr'}">
    <head>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 0; width: ${width}; }
        .header { text-align: center; margin-bottom: 10px; }
        .title { font-size: 16px; font-weight: bold; }
        .divider { border-top: 1px dashed black; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; }
        .total { font-weight: bold; font-size: 14px; margin-top: 5px; }
        .footer { text-align: center; margin-top: 10px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">LUMINA POS</div>
        <div>Order #${order.id.slice(-6)}</div>
        <div>${new Date(order.createdAt).toLocaleString()}</div>
      </div>
      <div class="divider"></div>
      ${order.items.map(item => `
        <div class="row">
          <span>${item.quantity}x ${isRtl ? item.product.nameAr : item.product.name}</span>
          <span>${(item.product.price * item.quantity).toFixed(2)}</span>
        </div>
        ${item.selectedVariants.length ? `<div style="font-size:10px; opacity:0.7; margin-${isRtl?'right':'left'}:10px">${item.selectedVariants.map(v => v.name).join(', ')}</div>` : ''}
      `).join('')}
      <div class="divider"></div>
      <div class="row">
        <span>Subtotal</span>
        <span>${order.subtotal.toFixed(2)}</span>
      </div>
      ${order.discountAmount > 0 ? `
      <div class="row">
        <span>Discount</span>
        <span>-${order.discountAmount.toFixed(2)}</span>
      </div>` : ''}
      <div class="row total">
        <span>TOTAL</span>
        <span>${order.total.toFixed(2)}</span>
      </div>
      <div class="divider"></div>
      <div class="footer">
        Thank you for visiting!
      </div>
      <script>
        window.onload = () => {
          window.print();
          // Cleanup handled by parent usually, but we can't self-remove easily from inside
        }
      </script>
    </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  // Remove iframe after printing (approximate delay)
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
};
