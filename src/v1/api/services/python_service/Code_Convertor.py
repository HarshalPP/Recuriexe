import json
import dicttoxml
import lxml.html
from lxml import etree
import lxml.etree as ET
import pdfkit
import argparse
import os

def convert_json_to_pdf(output_pdf_file):
    # Default JSON and XSLT file paths

    input_file = os.path.join(os.path.dirname(__file__), "cibilScore_response.txt") 
    xslt_file = os.path.join(os.path.dirname(__file__), "python_cir_JSONConverter_v2.xslt")
    
    # Read JSON data from file
    with open(input_file, "r") as u:
        json_data = json.load(u)
    
    # Convert JSON data to XML
    xml_data = dicttoxml.dicttoxml(json_data)
    
    # Create XML tree with root element
    root = ET.fromstring(xml_data)
    newroot = ET.Element("Root")
    newroot.insert(0, root)
    tree = ET.ElementTree(newroot)
    
    # Write XML data to a file
    final_xml_path =os.path.join(os.path.dirname(__file__), "Final1.xml")
    final_xml = ET.tostring(tree.getroot(), encoding="utf-8", xml_declaration=True, method="xml", pretty_print=True)
    with open(final_xml_path, "wb") as f:
        f.write(final_xml)
    
    # Apply XSLT transformation
    xslt_doc = etree.parse(xslt_file)
    xslt_transform = etree.XSLT(xslt_doc)
    
    # Load XML for transformation
    source_doc = ET.fromstring(final_xml)
    output_doc = xslt_transform(source_doc)
    
    # Write transformed HTML to file
    html_output_path = os.path.join(os.path.dirname(__file__),"final2.html")
    output_doc.write(html_output_path, pretty_print=True)
    
    # Convert HTML to PDF
    path_to_wkhtmltopdf = r'/usr/bin/wkhtmltopdf'  # Update this path as needed
    # path_to_wkhtmltopdf = r'C:/Program Files/wkhtmltopdf/bin/wkhtmltopdf.exe'  # Update this path as needed
    config = pdfkit.configuration(wkhtmltopdf=path_to_wkhtmltopdf)
    
    pdf_output_path = os.path.join(os.path.dirname(__file__),"..","..","..","..","..","uploads",output_pdf_file)
    pdfkit.from_file(html_output_path, pdf_output_path, configuration=config)
    
    return pdf_output_path

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Convert JSON to PDF report.")
    parser.add_argument("output_pdf_file", type=str, help="Name of the output PDF file")
    args = parser.parse_args()
    
    # Convert JSON to PDF and get output file path
    output_path = convert_json_to_pdf(args.output_pdf_file)
    print(f"{output_path}")

if __name__ == "__main__":
    main()
