import os
import shutil

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_icon = os.path.join(root, "public", "favicon.png")
    assets_dir = os.path.join(root, "mobile-app", "assets")
    
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)
        
    if os.path.exists(src_icon):
        for name in ["icon.png", "splash.png", "adaptive-icon.png", "favicon.png"]:
            shutil.copy(src_icon, os.path.join(assets_dir, name))
        print("Copied icon assets to mobile-app/assets")

if __name__ == "__main__":
    main()
