import os
import json
import csv
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import pandas as pd
from docx import Document

def export_to_file(format, data):
    file_path = f'../storage/export.{format}'
    if format == 'csv':
        with open(file_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerows(data)
    elif format == 'txt':
        with open(file_path, 'w') as f:
            f.write(str(data))
    elif format == 'json':
        with open(file_path, 'w') as f:
            json.dump(data, f)
    elif format == 'pdf':
        c = canvas.Canvas(file_path, pagesize=letter)
        c.drawString(100, 750, str(data))
        c.save()
    elif format == 'xlsx':
        df = pd.DataFrame(data)
        df.to_excel(file_path, index=False)
    elif format == 'docx':
        doc = Document()
        doc.add_paragraph(str(data))
        doc.save(file_path)
    else:
        raise ValueError(f'Unsupported format: {format}')
    return file_path