import PDFDocument from 'pdfkit';
import fs from 'fs';

export class PDFGenerator {
  constructor(outputFile) {
    this.doc = new PDFDocument({ margin: 50 });
    this.outputFile = outputFile;
    this.doc.pipe(fs.createWriteStream(outputFile));

    this.pageWidth = this.doc.page.width;
    this.pageHeight = this.doc.page.height;
    this.currentY = 20; // Keeps track of the current Y position
    
  }

  addBorderWithMargin(margin = 20) {
    const width = this.pageWidth - 2 * margin;
    const height = this.pageHeight - 2 * margin;
    this.doc.rect(margin, margin, width, height).stroke();
  }


  
  addImage(imagePath, position, margin = 20, imgSize = 100) {
    let x, y;

    switch (position) {
        case "top-left":
            x = margin;
            y = margin; // Ensure it starts from the very top
            break;
        case "top-center":
            x = (this.pageWidth - imgSize) / 2;
            y = margin; // Keep it fixed at the margin
            break;
        case "top-right":
            x = this.pageWidth - imgSize - margin;
            y = margin; // Fixed at the margin
            break;
        case "center":
            x = (this.pageWidth - imgSize) / 2;
            y = (this.pageHeight - imgSize) / 2;
            break;
        case "bottom-left":
            x = margin;
            y = this.pageHeight - imgSize - margin;
            break;
        case "bottom-center":
            x = (this.pageWidth - imgSize) / 2;
            y = this.pageHeight - imgSize - margin;
            break;
        case "bottom-right":
            x = this.pageWidth - imgSize - margin;
            y = this.pageHeight - imgSize - margin;
            break;
        default:
            console.error("Invalid position! Use: top-left, top-center, top-right, center, bottom-left, bottom-center, bottom-right.");
            return;
    }

    this.doc.image(imagePath, x, y, { width: imgSize, height: imgSize });

    // Move current Y position down to avoid overlapping
    this.currentY = y + imgSize + 10; // Only update if needed
}

  addLine(length, direction = "horizontal", lineWidth = 1, margin = 10) {
    let x = 50; // Default start position
    let y = this.currentY;

    if (direction === "horizontal") {
      this.doc.moveTo(x, y).lineTo(x + length, y);
    } else if (direction === "vertical") {
      this.doc.moveTo(x, y).lineTo(x, y + length);
      this.currentY += length;
    } else {
      console.error("Invalid direction! Use 'horizontal' or 'vertical'.");
      return;
    }

    this.doc.lineWidth(lineWidth).stroke();
    this.currentY += margin; // Add spacing after the line
  }

  addText(text, fontSize = 10, font = 'Helvetica', margin = 10, align = "left") {
    const pageWidth = this.doc.page.width;
    const effectiveMaxWidth = pageWidth - 100; // Subtract margins (50px on both sides)

    this.doc.font(font).fontSize(fontSize);
    this.doc.text(text, 50, this.currentY, { width: effectiveMaxWidth, align: align });

    this.currentY += fontSize + margin; // Move down after text
}

addRow(
  row_content,
  rowHeight = 15,
  fontSize = 8,
  font = 'Helvetica',
  margin = 10,
  align = "left",
  leftMargin = 20,   // default to 0 for full width if not passed
  rightMargin = 20   // default to 0 for full width if not passed
) {
  // Start from the top of the document if currentY isn't defined.
  if (this.currentY === undefined || this.currentY === null) {
    // Use the document's top margin if available, otherwise start at 0.
    this.currentY = (this.doc.page.margins && this.doc.page.margins.top) || 0;
  }

  const x = leftMargin;
  const pageWidth = this.doc.page.width;
  const width = pageWidth - leftMargin - rightMargin; // Full width row if no margins provided
  const y = this.currentY;

  // Define inner padding so text remains 10px away from the borders
  const contentPadding = 10;
  const textWidth = width - 2 * contentPadding;

  // Set font and size before measuring text height
  this.doc.font(font).fontSize(fontSize);

  // Measure the height needed for the text given the available width
  const measuredTextHeight = this.doc.heightOfString(row_content, {
    width: textWidth,
    align
  });

  // Adjust the row height to fit the text (with padding) if needed.
  const adjustedRowHeight = Math.max(rowHeight, measuredTextHeight + 2 * contentPadding);

  // Draw row border
  this.doc.rect(x, y, width, adjustedRowHeight).stroke();

  // Calculate y to vertically center the text within the row
  const textY = y + (adjustedRowHeight - measuredTextHeight) / 2;

  // Draw text using the padded bounding box and built-in alignment option
  this.doc.text(row_content, x + contentPadding, textY, {
    width: textWidth,
    align
  });

  // Move down for the next row
  this.currentY += adjustedRowHeight + margin;
}


addImageBlock(imagePath, options = {}) {
  // Set default options
  const leftMargin  = options.leftMargin  !== undefined ? options.leftMargin  : 20;
  const rightMargin = options.rightMargin !== undefined ? options.rightMargin : 20;
  const margin      = options.margin      !== undefined ? options.margin      : 10;
  
  // Initialize currentX if not already set (for horizontal positioning)
  if (this.currentX === undefined || this.currentX === null) {
    this.currentX = leftMargin;
  }
  
  // Initialize currentY if not already set (for vertical positioning)
  if (this.currentY === undefined || this.currentY === null) {
    this.currentY = (this.doc.page.margins && this.doc.page.margins.top) || 0;
  }
  
  // Initialize currentRowMaxHeight if not already set (to track the max height in the current row)
  if (this.currentRowMaxHeight === undefined || this.currentRowMaxHeight === null) {
    this.currentRowMaxHeight = 0;
  }
  
  // Calculate the total available page width and the remaining width on the current line
  const pageWidth = this.doc.page.width;
  const availableLineWidth = pageWidth - rightMargin - this.currentX;
  
  // Determine image dimensions: use provided width or default to full available width;
  // determine height or default to a 4:3 aspect ratio.
  const imageWidth = options.width || (pageWidth - leftMargin - rightMargin);
  const imageHeight = options.height; // Optional; if not provided, will assume default aspect ratio.
  const usedHeight = imageHeight || (imageWidth * 0.75);
  
  // Check if the image fits on the current line; if not, move to a new line.
  if (imageWidth > availableLineWidth) {
    // Move down by the max height of the current row plus the margin.
    this.currentY += this.currentRowMaxHeight + margin;
    // Reset horizontal position back to left margin.
    this.currentX = leftMargin;
    // Reset the current row's max height for the new line.
    this.currentRowMaxHeight = 0;
  }
  
  // Draw the image at the current position.
  if (imageHeight) {
    this.doc.image(imagePath, this.currentX, this.currentY, { width: imageWidth, height: imageHeight });
  } else {
    this.doc.image(imagePath, this.currentX, this.currentY, { width: imageWidth });
  }
  
  // Update the maximum height for the current row if needed.
  if (usedHeight > this.currentRowMaxHeight) {
    this.currentRowMaxHeight = usedHeight;
  }
  
  // Move the horizontal pointer to the right for the next image, including the margin.
  this.currentX += imageWidth + margin;
}

addImageAtPosition( imageSource, x, y, width, height) {
  this.doc.image(imageSource, x, y, { width, height });
}

addTextBlock(text, position, options = {}) {
  // Set default options
  const margin = options.margin !== undefined ? options.margin : 20;
  const blockWidth = options.width !== undefined ? options.width : 200;
  const font = options.font || 'Helvetica';
  const fontSize = options.fontSize || 10;
  const textAlign = options.align || 'left'; // Alignment of text within the block

  // Set font settings for measuring and drawing the text
  this.doc.font(font).fontSize(fontSize);

  // Measure the height of the text block given the width and alignment.
  const textHeight = this.doc.heightOfString(text, { width: blockWidth, align: textAlign });
  const blockHeight = textHeight; // For a simple block, block height equals the measured text height

  let x, y;

  // For positions that use absolute coordinates:
  if (position.startsWith("bottom")) {
    // For bottom positions, calculate y so that the block sits above the bottom margin.
    y = this.pageHeight - blockHeight - margin;
    if (position === "bottom-left") {
      x = margin;
    } else if (position === "bottom-center") {
      x = (this.pageWidth - blockWidth) / 2;
    } else if (position === "bottom-right") {
      x = this.pageWidth - blockWidth - margin;
    } else {
      // Default to bottom-center if just "bottom" is provided
      x = (this.pageWidth - blockWidth) / 2;
    }
  }
  else if (position.startsWith("top")) {
    // For top positions, we base y on the margin.
    y = margin;
    if (position === "top-left") {
      x = margin;
    } else if (position === "top-center") {
      x = (this.pageWidth - blockWidth) / 2;
    } else if (position === "top-right") {
      x = this.pageWidth - blockWidth - margin;
    } else {
      // Default to top-center if just "top" is provided
      x = (this.pageWidth - blockWidth) / 2;
    }
    // Optionally, check if there’s enough space on the current page.
    // (This check is optional because for absolute top positioning you might always want it at the top.)
    if (this.currentY + blockHeight > this.pageHeight - margin) {
      this.doc.addPage();
      // Reset currentY if you rely on it.
      this.currentY = margin;
      y = margin;
    }
  }
  // For positions that are centered vertically (or left/right):
  else if (position === "left") {
    x = margin;
    y = (this.pageHeight - blockHeight) / 2;
  } else if (position === "center") {
    x = (this.pageWidth - blockWidth) / 2;
    y = (this.pageHeight - blockHeight) / 2;
  } else if (position === "right") {
    x = this.pageWidth - blockWidth - margin;
    y = (this.pageHeight - blockHeight) / 2;
  } else {
    console.error("Invalid position! Use 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'top', 'bottom', 'left', 'center', or 'right'.");
    return;
  }

  // (Optional) Draw a border around the text block.
  if (options.drawBorder) {
    this.doc.rect(x, y, blockWidth, blockHeight).stroke();
  }

  // Draw the text block at the computed position.
  this.doc.text(text, x, y, { width: blockWidth, align: textAlign });
}



addNewPage() {
  this.doc.addPage();
  // Reset the vertical position for the new page (adjust top margin as needed)
  this.currentY = 20;
}



addSplitRow(row_content, rowHeight = 15, widths, colors, margin = 5) {
  const leftMargin = 20;
  const rightMargin = 20;
  const totalWidth = this.doc.page.width - leftMargin - rightMargin; // Dynamic total width
  let x = leftMargin;
  
  // Assume `widths` is an array of percentages (e.g., [0.5, 0.3, 0.2])
  const normalizedWidths = widths.map(percentage => percentage * totalWidth);
  
  row_content.forEach((content, index) => {
    const partWidth = normalizedWidths[index];
    const textFontSize = content.fontSize || 8;
    // Calculate y to vertically center text within the row
    const yPos = this.currentY + (rowHeight - textFontSize) / 2;
    
    // Draw cell background (if a color is provided) and border
    if (colors && colors[index]) {
      this.doc
        .rect(x, this.currentY, partWidth, rowHeight)
        .fillAndStroke(colors[index], 'black');
    } else {
      this.doc.rect(x, this.currentY, partWidth, rowHeight).stroke();
    }
    
    // Define inner padding for the text inside the cell
    const cellPadding = 10;
    
    // Set font and add text with inner padding
    this.doc
      .font(content.font || 'Helvetica')
      .fontSize(textFontSize)
      .fillColor('black')
      .text(content.text, x + cellPadding, yPos, {
        width: partWidth - cellPadding * 2,
        align: content.align || 'left'
      });
    
    x += partWidth; // Move to the next cell's x position
  });
  
  this.currentY += rowHeight + margin;
}


addSplitRow(row_content, rowHeight = 15, widths, colors, margin = 5) {
  const leftMargin = 20;
  const rightMargin = 20;
  const totalWidth = this.doc.page.width - leftMargin - rightMargin;
  const cellPadding = 10;
  
  // Calculate each cell's width based on percentage values
  const normalizedWidths = widths.map(percentage => percentage * totalWidth);
  
  // Measure each cell's required text height
  let maxTextHeight = 0;
  row_content.forEach((content, index) => {
    const textFontSize = content.fontSize || 8;
    this.doc.font(content.font || 'Helvetica').fontSize(textFontSize);
    const availableWidth = normalizedWidths[index] - cellPadding * 2;
    const height = this.doc.heightOfString(content.text, {
      width: availableWidth,
      align: content.align || 'left'
    });
    maxTextHeight = Math.max(maxTextHeight, height);
  });
  
  // Adjust the row height if any cell requires more vertical space
  const adjustedRowHeight = Math.max(rowHeight, maxTextHeight + cellPadding * 2);
  
  // Draw each cell's background (if a color is provided) without strokes
  let x = leftMargin;
  row_content.forEach((content, index) => {
    const partWidth = normalizedWidths[index];
    if (colors && colors[index]) {
      this.doc
        .rect(x, this.currentY, partWidth, adjustedRowHeight)
        .fill(colors[index]);
    }
    x += partWidth;
  });
  
  // Add text for each cell (aligning at the top with padding)
  x = leftMargin;
  row_content.forEach((content, index) => {
    const partWidth = normalizedWidths[index];
    const textFontSize = content.fontSize || 8;
    const yPos = this.currentY + cellPadding;
    this.doc
      .font(content.font || 'Helvetica')
      .fontSize(textFontSize)
      .fillColor('black')
      .text(content.text, x + cellPadding, yPos, {
        width: partWidth - cellPadding * 2,
        align: content.align || 'left'
      });
    x += partWidth;
  });
  
  // Draw a single outer border across the full row width
  this.doc.rect(leftMargin, this.currentY, totalWidth, adjustedRowHeight).stroke();

  // Draw vertical splitter lines between cells
  let splitterX = leftMargin;
  for (let i = 0; i < row_content.length - 1; i++) {
    splitterX += normalizedWidths[i];
    this.doc
      .moveTo(splitterX, this.currentY)
      .lineTo(splitterX, this.currentY + adjustedRowHeight)
      .stroke();
  }
  
  // Update currentY for the next row
  this.currentY += adjustedRowHeight + margin;
}





addTable(tableData, options = {}) {
  const leftMargin = options.leftMargin || 50;
  const rightMargin = options.rightMargin || 50;
  const startY = options.startY !== undefined ? options.startY : this.currentY;
  const cellHeight = options.cellHeight || 20;
  const padding = options.padding || 5;
  const textAlign = options.align || 'left'; // default text alignment
  const defaultFontSize = options.fontSize || 10;
  const defaultFont = options.font || 'Helvetica';

  // Determine the maximum number of columns in the table data
  let numColumns = 0;
  tableData.forEach(row => {
    if (row.length > numColumns) numColumns = row.length;
  });

  // Calculate available width and each cell's width
  const availableWidth = this.pageWidth - leftMargin - rightMargin;
  const cellWidth = availableWidth / numColumns;

  let y = startY;
  // Loop over each row in the table data
  for (let i = 0; i < tableData.length; i++) {
    const row = tableData[i];
    let x = leftMargin;
    
    // For each cell in the row (or fill missing cells with an empty string)
    for (let j = 0; j < numColumns; j++) {
      // Default cell content and styling
      let cellText = '';
      let cellFontSize = defaultFontSize;
      let cellFont = defaultFont;
      
      // Check if cell data is provided
      if (row[j] !== undefined) {
        // If cell is an object, expect it to have text and optionally a fontSize/font
        if (typeof row[j] === 'object' && row[j] !== null) {
          cellText = row[j].text || '';
          cellFontSize = row[j].fontSize || defaultFontSize;
          cellFont = row[j].font || defaultFont;
        } else {
          // Otherwise, treat the cell data as plain text
          cellText = row[j];
        }
      }
      
      // Draw cell border
      this.doc.rect(x, y, cellWidth, cellHeight).stroke();
      
      // Set cell font and size
      this.doc.font(cellFont).fontSize(cellFontSize);
      
      // Add the text with padding and specified alignment
      this.doc.text(cellText, x + padding, y + padding, {
        width: cellWidth - 2 * padding,
        align: textAlign
      });
      
      x += cellWidth;
    }
    y += cellHeight;
  }
  
  // Update the current Y position after the table, with optional extra margin
  this.currentY = y + (options.marginAfter || 10);
}

addNewLine(lines = 1) {
  // Define a default line height (this can be customized or calculated).
  const defaultLineHeight = 12;
  this.currentY += defaultLineHeight * lines;
}


  savePDF() {
    this.doc.end();
  }
}