import test from "node:test";
import assert from "node:assert";
import { formatCurrency, optimizeImage, stripHtml, getEmbedUrl } from "./utils";

test("formatCurrency formats correctly", () => {
    const formatted = formatCurrency(100);
    assert.ok(formatted.includes("100.00"));
});

test("stripHtml removes html tags", () => {
    assert.strictEqual(stripHtml("<p>Hello <b>World</b></p>"), "Hello World");
    assert.strictEqual(stripHtml(""), "");
});

test("optimizeImage handles Cloudinary and normal URLs", () => {
    assert.strictEqual(optimizeImage(""), "");
    assert.strictEqual(
        optimizeImage("https://res.cloudinary.com/demo/image/upload/sample.jpg"),
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg"
    );
    assert.strictEqual(optimizeImage("https://example.com/image.png"), "https://example.com/image.png");
});

test("getEmbedUrl converts YouTube URLs", () => {
    assert.strictEqual(
        getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    assert.strictEqual(
        getEmbedUrl("https://youtu.be/dQw4w9WgXcQ"),
        "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    assert.strictEqual(getEmbedUrl("https://example.com"), "https://example.com");
});
