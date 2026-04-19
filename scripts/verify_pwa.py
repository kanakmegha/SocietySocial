import os
import json

def verify():
    print("--- PWA Verification Audit ---")
    
    # 1. Manifest Check
    manifest_path = "frontend/public/manifest.json"
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
            print(f"✅ Manifest found: {manifest.get('name')}")
            if 'icons' in manifest and len(manifest['icons']) >= 2:
                print("✅ Icons configured correctly")
    else:
        print("❌ Manifest missing")

    # 2. Service Worker Check (Build output)
    sw_path = "frontend/public/sw.js"
    if os.path.exists(sw_path):
        print("✅ Service Worker (sw.js) exists in public directory")
    else:
        print("❌ Service Worker missing. Run 'npm run build' first.")

    # 3. Next.js Config Check
    config_path = "frontend/next.config.ts"
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            content = f.read()
            if "next-pwa" in content:
                print("✅ next-pwa integrated in config")
    
    print("--- Audit Complete ---")

if __name__ == "__main__":
    verify()
