import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text(docx_path):
    try:
        z = zipfile.ZipFile(docx_path)
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        # Define the namespace
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        # Find all text elements
        text_elements = root.findall('.//w:t', namespace)
        text = ' '.join(t.text for t in text_elements if t.text)
        return text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    if len(sys.argv) > 1:
        print(extract_text(sys.argv[1]))
