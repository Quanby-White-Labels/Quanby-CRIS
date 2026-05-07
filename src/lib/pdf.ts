import { jsPDF } from "jspdf"
import { CertifiedCopy } from "@prisma/client"
import path from "path"
import fs from "fs"

type CertifiedCopyData = CertifiedCopy & {
    form?: {
        formType: 'FORM_1A' | 'FORM_2A' | 'FORM_3A'
        preparedByName: string
        preparedByPosition: string
        verifiedByName: string
        verifiedByPosition: string
        civilRegistrar: string
        civilRegistrarPosition: string
        specificForm?:
        | {
            nameOfChild: string
            sex: string | null
            dateOfBirth: Date
            placeOfBirth: string
            nameOfMother: string
            citizenshipMother?: string | null
            nameOfFather: string
            citizenshipFather?: string | null
            dateMarriageParents?: Date | null
            placeMarriageParents?: string | null
        }
        | {
            nameOfDeceased: string
            sex: string | null
            age?: number | null
            civilStatus?: string | null
            citizenship?: string | null
            dateOfDeath: Date
            placeOfDeath: string
            causeOfDeath?: string | null
        }
        | {
            husbandName: string
            husbandDateOfBirthAge?: string | null
            husbandCitizenship?: string | null
            husbandCivilStatus?: string | null
            husbandMother?: string | null
            husbandFather?: string | null
            wifeName: string
            wifeDateOfBirthAge?: string | null
            wifeCitizenship?: string | null
            wifeCivilStatus?: string | null
            wifeMother?: string | null
            wifeFather?: string | null
            dateOfMarriage: Date
            placeOfMarriage: string
        }
    }
    // Added for image options
    logoUrl?: string
    newLogoUrl?: string
}

/**
 * Creates a 3-column signature block in the PDF
 */
const createSignatureBlock = (
    doc: jsPDF,
    data: {
        preparedByName: string;
        preparedByPosition: string;
        verifiedByName: string;
        verifiedByPosition: string;
        civilRegistrar: string;
        civilRegistrarPosition: string;
    },
    startY: number,
    leftMargin: number = 25,
    lineHeight: number = 8
): number => {
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (leftMargin * 2);
    const colWidth = contentWidth / 3;

    let y = startY;

    // Calculate column positions
    const col1X = leftMargin;
    const col2X = leftMargin + colWidth;
    const col3X = leftMargin + (colWidth * 2);

    // Save current font settings
    const currentFontStyle = doc.getFont().fontStyle;

    // Add column headers
    doc.setFont("helvetica", "bold");
    doc.text("Prepared by:", col1X, y);
    doc.text("Verified by:", col2X, y);
    doc.text("Civil Registrar:", col3X, y);

    y += lineHeight;

    // Add names
    doc.setFont("helvetica", "normal");
    doc.text(data.preparedByName, col1X, y);
    doc.text(data.verifiedByName, col2X, y);
    doc.text(data.civilRegistrar, col3X, y);

    y += lineHeight;

    // Add positions
    doc.text(data.preparedByPosition, col1X, y);
    doc.text(data.verifiedByPosition, col2X, y);
    doc.text(data.civilRegistrarPosition, col3X, y);

    // Add signature lines
    y += lineHeight * 2;
    const lineWidth = colWidth - 10;

    doc.line(col1X, y, col1X + lineWidth, y);
    doc.line(col2X, y, col2X + lineWidth, y);
    doc.line(col3X, y, col3X + lineWidth, y);

    // Restore original font settings
    doc.setFont("helvetica", currentFontStyle);

    // Return the new Y position
    return y + lineHeight;
};

// Helper function to load images for the PDF
async function loadImage(url: string): Promise<string | null> {
    try {
        // For Node.js server environment
        if (typeof window === 'undefined') {
            // Try to load image from public directory
            const publicPath = path.join(process.cwd(), 'public', url);

            if (fs.existsSync(publicPath)) {
                // Convert image to base64
                const data = fs.readFileSync(publicPath);
                const base64 = Buffer.from(data).toString('base64');
                const ext = path.extname(url).substring(1).toLowerCase();
                return `data:image/${ext};base64,${base64}`;
            }
        } else {
            // For browser environment
            return url;
        }
    } catch (error) {
        console.error(`Error loading image ${url}:`, error);
    }
    return null;
}

// Modified function for underlinePageBookText that simplifies it to handle only one label with value
const simplifiedUnderline = (
    doc: jsPDF,
    label: string,
    value: string | number | null | undefined,
    y: number,
    leftMargin: number = 25
): number => {
    doc.text(label, leftMargin, y);

    // Calculate starting position for value
    const labelWidth = doc.getTextWidth(label + " ");
    const valueX = leftMargin + labelWidth;

    // Handle the value
    const valueStr = value !== null && value !== undefined ? value.toString() : '';
    doc.text(valueStr, valueX, y);

    // Draw underline for value
    const valueWidth = valueStr ? doc.getTextWidth(valueStr) : 50;
    doc.line(valueX, y + 1, valueX + valueWidth, y + 1);

    return y;
};

export async function generateCertifiedCopy(data: CertifiedCopyData): Promise<Buffer> {
    try {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "LEGAL"
        })

        // Add the two logos to the PDF
        try {
            // Set default image paths if not provided
            const logoPath = data.logoUrl || '/images/REGISTRY.png';
            const newLogoPath = data.newLogoUrl || '/images/new.png';

            // Left logo
            const leftLogoData = await loadImage(logoPath);
            if (leftLogoData) {
                doc.addImage(leftLogoData, "PNG", 50, 10, 25, 25);
            }

            // Right logo
            const rightLogoData = await loadImage(newLogoPath);
            if (rightLogoData) {
                doc.addImage(rightLogoData, "PNG", doc.internal.pageSize.width - 75, 10, 25, 25);
            }
        } catch (error) {
            console.error("Error loading images:", error)
            // Continue without images if they fail to load
        }

        // Add form type in top-left corner if needed
        doc.setFontSize(9)
        if (data.form?.formType === 'FORM_1A') {
            doc.text("Civil Registry Form No. 1A", 10, 10)
            doc.text("Birth- Available", 10, 15)
        } else if (data.form?.formType === 'FORM_2A') {
            doc.text("Civil Registry Form No. 2A", 10, 10)
            doc.text("Death- Available", 10, 15)
        } else if (data.form?.formType === 'FORM_3A') {
            doc.text("Civil Registry Form No. 3A", 10, 10)
            doc.text("Marriage- Available", 10, 15)
        }

        // Set up header text
        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        doc.text("Republic of the Philippines", doc.internal.pageSize.width / 2, 15, { align: "center" })

        doc.setFont("helvetica", "bold")
        doc.text("CITY CIVIL REGISTRY OFFICE", doc.internal.pageSize.width / 2, 22, { align: "center" })

        doc.setFont("helvetica", "normal")
        doc.text("City of Legazpi", doc.internal.pageSize.width / 2, 29, { align: "center" })

        // Date aligned to the right
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
        doc.setFontSize(11)
        doc.text(currentDate, doc.internal.pageSize.width - 20, 45, { align: "right" })

        doc.text("TO WHOM IT MAY CONCERN:", 20, 60)

        let y = 70
        const leftMargin = 25
        const lineHeight = 8
        const labelWidth = 70
        const valueWidth = 100
        const underlineOffset = 1.5

        const spaceY = (space: number) => {
            y += space
        }

        const concat = (label: string, value: string, label2: string, value2: string) => {
            let currentX = leftMargin

            // Render the first label
            doc.text(label, currentX, y)
            currentX += doc.getTextWidth(label) + 2 // Move X after label

            // Render the first underlined value
            if (value) {
                doc.text(value, currentX, y)
                const valueWidth = doc.getTextWidth(value)
                doc.line(currentX, y + 2, currentX + valueWidth, y + 2) // Underline
                currentX += valueWidth + 10 // Move X after value (extra spacing)
            }

            // Render the second label
            doc.text(label2, currentX, y)
            currentX += doc.getTextWidth(label2) + 2 // Move X after second label

            // Render the second underlined value
            if (value2) {
                doc.text(value2, currentX, y)
                const value2Width = doc.getTextWidth(value2)
                doc.line(currentX, y + 2, currentX + value2Width, y + 2) // Underline
            }

            y += lineHeight + 1 // Move to the next line
        }

        // Helper function for field rendering
        const renderField = (label?: string, value?: any) => {
            doc.text(label || '', leftMargin, y)
            doc.text(":", leftMargin + labelWidth - 5, y)
            const valueX = leftMargin + labelWidth + 5
            if (value) {
                const valueStr = value.toString()
                doc.text(valueStr, valueX, y)
                doc.line(valueX, y + underlineOffset, valueX + valueWidth, y + underlineOffset)
            } else {
                doc.line(valueX, y + underlineOffset, valueX + valueWidth, y + underlineOffset)
            }
            y += lineHeight
        }

        if (data.form) {
            // Update type checks to use specificForm
            if (data.form.formType === 'FORM_1A' && data.form.specificForm && 'nameOfChild' in data.form.specificForm) {
                // First line - registry statement
                doc.text('We certify that, among others, the following facts of birth appear in our Register of Birth on', leftMargin, y);
                y += lineHeight;

                // Second line - page number (on its own line)
                simplifiedUnderline(doc, 'page number', data.pageNo, y, leftMargin);
                y += lineHeight;

                // Third line - book number (on its own line)
                simplifiedUnderline(doc, 'book number', data.bookNo, y, leftMargin);
                y += lineHeight;

                spaceY(10)

                renderField("Registry Number:", data.lcrNo)
                renderField("Date of Registration:", data.form.specificForm.dateOfBirth.toLocaleDateString())
                renderField("Name of Child:", data.form.specificForm.nameOfChild)
                renderField("Sex:", data.form.specificForm.sex || '')
                renderField("Date of Birth:", data.form.specificForm.dateOfBirth.toLocaleDateString())
                renderField("Place of Birth:", data.form.specificForm.placeOfBirth)
                renderField("Name of Mother:", data.form.specificForm.nameOfMother)
                renderField("Citizenship of Mother:", data.form.specificForm.citizenshipMother || '')
                renderField("Name of Father:", data.form.specificForm.nameOfFather)
                renderField("Citizenship of Father:", data.form.specificForm.citizenshipFather || '')

                if (data.form.specificForm.dateMarriageParents) {
                    renderField("Date of Marriage of Parents:", data.form.specificForm.dateMarriageParents.toLocaleDateString())
                    renderField("Place of Marriage of Parents:", data.form.specificForm.placeMarriageParents || '')
                } else {
                    renderField("Date of Marriage of Parents:", undefined)
                    renderField("Place of Marriage of Parents:", undefined)
                }
            }
            else if (data.form.formType === 'FORM_2A' && data.form.specificForm && 'nameOfDeceased' in data.form.specificForm) {
                // First line - registry statement
                doc.text('We certify that, among others, the following facts of death appear in our Register of Death on', leftMargin, y);
                y += lineHeight;

                // Second line - page number (on its own line)
                simplifiedUnderline(doc, 'page number', data.pageNo, y, leftMargin);
                y += lineHeight;

                // Third line - book number (on its own line)
                simplifiedUnderline(doc, 'book number', data.bookNo, y, leftMargin);
                y += lineHeight;

                spaceY(10)

                renderField("Registry Number:", data.lcrNo)
                renderField("Date of Registration:", data.date?.toLocaleDateString())
                renderField("Name of Deceased:", data.form.specificForm.nameOfDeceased)
                renderField("Sex:", data.form.specificForm.sex || '')
                renderField("Age:", data.form.specificForm.age?.toString() || '')
                renderField("Civil Status:", data.form.specificForm.civilStatus || '')
                renderField("Citizenship:", data.form.specificForm.citizenship || '')
                renderField("Date of Death:", data.form.specificForm.dateOfDeath.toLocaleDateString())
                renderField("Place of Death:", data.form.specificForm.placeOfDeath)
                renderField("Cause of Death:", data.form.specificForm.causeOfDeath || '')
            }
            else if (data.form.formType === 'FORM_3A' && data.form.specificForm && 'husbandName' in data.form.specificForm) {
                // First line - registry statement
                doc.text('We certify that, among others, the following facts of marriage appear in our Register of Marriage on', leftMargin, y);
                y += lineHeight;

                // Second line - page number (on its own line)
                simplifiedUnderline(doc, 'page number', data.pageNo, y, leftMargin);
                y += lineHeight;

                // Third line - book number (on its own line)
                simplifiedUnderline(doc, 'book number', data.bookNo, y, leftMargin);
                y += lineHeight;

                spaceY(10)

                doc.setFont("helvetica", "bold")
                doc.text("HUSBAND", leftMargin + 40, y)
                doc.text("WIFE", leftMargin + 120, y)
                y += lineHeight

                doc.setFont("helvetica", "normal")
                const marriageFields = [
                    ["Name:", data.form.specificForm.husbandName, data.form.specificForm.wifeName],
                    ["Date of Birth/Age:", data.form.specificForm.husbandDateOfBirthAge || '', data.form.specificForm.wifeDateOfBirthAge || ''],
                    ["Citizenship:", data.form.specificForm.husbandCitizenship || '', data.form.specificForm.wifeCitizenship || ''],
                    ["Civil Status:", data.form.specificForm.husbandCivilStatus || '', data.form.specificForm.wifeCivilStatus || ''],
                    ["Father:", data.form.specificForm.husbandFather || '', data.form.specificForm.wifeFather || ''],
                    ["Mother:", data.form.specificForm.husbandMother || '', data.form.specificForm.wifeMother || '']
                ]

                marriageFields.forEach(([label, husbandValue, wifeValue]) => {
                    doc.text(label, leftMargin, y)
                    const husbandWidth = doc.getTextWidth(husbandValue)
                    const wifeWidth = doc.getTextWidth(wifeValue)

                    if (husbandValue) {
                        doc.text(husbandValue, leftMargin + 40, y)
                        doc.line(leftMargin + 40, y + 1, leftMargin + 40 + husbandWidth, y + 1)
                    } else {
                        doc.line(leftMargin + 40, y + 1, leftMargin + 80, y + 1)
                    }

                    if (wifeValue) {
                        doc.text(wifeValue, leftMargin + 120, y)
                        doc.line(leftMargin + 120, y + 1, leftMargin + 120 + wifeWidth, y + 1)
                    } else {
                        doc.line(leftMargin + 120, y + 1, leftMargin + 160, y + 1)
                    }
                    y += lineHeight
                })

                y += lineHeight
                renderField("Date of Marriage:", data.form.specificForm.dateOfMarriage.toLocaleDateString())
                renderField("Place of Marriage:", data.form.specificForm.placeOfMarriage)
            }

            // Example usage
            spaceY(10)
            concat("This certification is issued to ", data.requesterName, " upon his/her request for ", data.purpose)

            // Add spacing before signature block
            y += lineHeight + 10;

            // Use the signature block function
            y = createSignatureBlock(
                doc,
                {
                    preparedByName: data.form.preparedByName,
                    preparedByPosition: data.form.preparedByPosition,
                    verifiedByName: data.form.verifiedByName,
                    verifiedByPosition: data.form.verifiedByPosition,
                    civilRegistrar: data.form.civilRegistrar,
                    civilRegistrarPosition: data.form.civilRegistrarPosition,
                },
                y,
                leftMargin
            );

            // this is the footer
            y += lineHeight + 5;
            renderField("Amount Paid:", data.amountPaid && data.amountPaid > 0 ? `₱${data.amountPaid.toFixed(2)}` : undefined)
            renderField("O.R. Number:", data.orNumber || undefined)
            renderField("Date Paid:", data.datePaid?.toLocaleDateString() || undefined)

            // Add note at the bottom 
            y += lineHeight + 5;
            doc.setFont("helvetica", "italic");
            doc.text("Note: A mark, erasure or alteration of any entry invalidates this certification.", leftMargin, y);
            doc.setDrawColor(0);
            doc.line(leftMargin, y + 2, doc.internal.pageSize.width - leftMargin, y + 2);
        }

        return Buffer.from(doc.output("arraybuffer"))
    } catch (error) {
        console.error("Error generating PDF:", error)
        throw new Error("Failed to generate PDF")
    }
}