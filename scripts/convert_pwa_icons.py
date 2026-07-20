from PIL import Image

original_path = r"C:\Users\hslsp\.gemini\antigravity\brain\10e61afd-0d98-4362-8d6d-7f5b7a7cd18f\pwa_game_icon_1784571835622.png"

# Load image
img = Image.open(original_path)

# Convert to PNG and resize
img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save(r"c:\Pokemon\public\icon-192.png", "PNG")

img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save(r"c:\Pokemon\public\icon-512.png", "PNG")
img_512.save(r"c:\Pokemon\public\icon-512-maskable.png", "PNG")

print("Icons converted successfully to real PNGs!")
