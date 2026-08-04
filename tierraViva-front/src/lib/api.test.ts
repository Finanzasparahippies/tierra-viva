import test from "node:test";
import assert from "node:assert";
import { getFrontendOrigin } from "./api";

test("getFrontendOrigin resolves default URL when window is undefined", () => {
    // Save original process.env
    const originalEnv = process.env.NEXT_PUBLIC_FRONTEND_URL;
    
    // Test default fallback
    delete process.env.NEXT_PUBLIC_FRONTEND_URL;
    assert.strictEqual(getFrontendOrigin(), "http://localhost:3000");
    
    // Test env value
    process.env.NEXT_PUBLIC_FRONTEND_URL = "https://tierraviva.com.mx";
    assert.strictEqual(getFrontendOrigin(), "https://tierraviva.com.mx");
    
    // Restore
    if (originalEnv) {
        process.env.NEXT_PUBLIC_FRONTEND_URL = originalEnv;
    } else {
        delete process.env.NEXT_PUBLIC_FRONTEND_URL;
    }
});

test("getFrontendOrigin resolves window.location.origin when window is defined", () => {
    // Simulate window environment
    const mockWindow = {
        location: {
            origin: "https://my-client-app.com"
        }
    };
    
    // Set global window
    (global as any).window = mockWindow;
    
    try {
        assert.strictEqual(getFrontendOrigin(), "https://my-client-app.com");
    } finally {
        // Clean up global window
        delete (global as any).window;
    }
});
