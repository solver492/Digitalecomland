import fitz
from pathlib import Path

src = Path('attached_assets/Notes_260903_024350_1788399933608.pdf')
out = Path('.agents/outputs/prompt-pdf')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(src)
print(f'pages={doc.page_count}')
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    path = out / f'page-{i+1:02d}.png'
    pix.save(path)
    print(path)
