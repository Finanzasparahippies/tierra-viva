import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Sanitizer function logic under test
 */
function sanitizeHtml(rawHtml: string): string {
    if (!rawHtml) return "";

    return rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/on\w+='[^']*'/gi, "")
        .replace(/on\w+=\w+/gi, "")
        .replace(/href="javascript:[^"]*"/gi, 'href="#"')
        .replace(/href='javascript:[^']*'/gi, 'href="#"');
}

test('Sanitizer removes dangerous <script> tags', () => {
    const maliciousInput = '<h1>Título</h1><script>alert("xss")</script><p>Párrafo</p>';
    const cleaned = sanitizeHtml(maliciousInput);
    assert.strictEqual(cleaned.includes('<script>'), false);
    assert.strictEqual(cleaned.includes('alert("xss")'), false);
    assert.strictEqual(cleaned.includes('<h1>Título</h1>'), true);
});

test('Sanitizer removes inline event handlers like onerror and onload', () => {
    const inputWithError = '<img src="invalid.jpg" onerror="alert(1)" onload="console.log(2)" />';
    const cleaned = sanitizeHtml(inputWithError);
    assert.strictEqual(cleaned.includes('onerror='), false);
    assert.strictEqual(cleaned.includes('onload='), false);
});

test('Sanitizer neutralizes javascript: URIs', () => {
    const inputWithJsUri = '<a href="javascript:alert(\'hack\')">Haz clic aquí</a>';
    const cleaned = sanitizeHtml(inputWithJsUri);
    assert.strictEqual(cleaned.includes('javascript:'), false);
    assert.strictEqual(cleaned.includes('href="#"'), true);
});

test('Sanitizer preserves valid HTML structuring tags (H1, H2, blockquote, ul, li, img)', () => {
    const validHtml = '<h1>Bitácora</h1><h2>Subtítulo</h2><blockquote>Cita especial</blockquote><ul><li>Elemento 1</li></ul><img src="https://example.com/bee.jpg" />';
    const cleaned = sanitizeHtml(validHtml);
    assert.strictEqual(cleaned, validHtml);
});

test('Sanitizer handles empty or undefined inputs safely', () => {
    assert.strictEqual(sanitizeHtml(''), '');
    assert.strictEqual(sanitizeHtml(null as any), '');
});
