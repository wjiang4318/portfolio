from PIL import Image, ImageOps
import os, json
SRC = os.path.expanduser("~/mnt/portfolio/photos/travel")
OUT = os.path.join(SRC, "optimized")
M = {
 "Apparentely, its dromedaries, not camels.jpg": "morocco",
 "baguette, nom nom! (It was pretty dry .-.).jpg": "paris",
 "Cliffs of Moher, Ireland!.jpg": "moher",
 "Prague, from the castle steps.jpg": "prague",
 "Lake Como. Ruined the Hudson for me.jpg": "como",
 "Say Cheese! At the Acropolis in Greece.jpg": "athens",
 "The phone booth didn't work.jpg": "london",
 "When in Rome, do as the Romans do!.jpg": "rome",
}
info = {}
for fn, slug in M.items():
    p = os.path.join(SRC, fn)
    im = Image.open(p)
    im = ImageOps.exif_transpose(im).convert("RGB")
    info[slug] = {"w": im.width, "h": im.height, "ratio": round(im.width/im.height, 3)}
    for tag, maxw in (("sm", 900), ("lg", 1800)):
        c = im.copy()
        c.thumbnail((maxw, maxw), Image.LANCZOS)
        c.save(os.path.join(OUT, f"{slug}-{tag}.jpg"), "JPEG", quality=82, optimize=True, progressive=True)
        c.save(os.path.join(OUT, f"{slug}-{tag}.webp"), "WEBP", quality=80, method=6)
print(json.dumps(info, indent=1))
