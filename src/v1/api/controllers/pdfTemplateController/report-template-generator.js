export const generateReportTemplate = (reportData, reportName, organizationInfo = {}) => {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const currentTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Helper function to format verification status
  const getStatusBadge = (hasError) => {
    return hasError
      ? '<span class="status-badge error">❌ Failed</span>'
      : '<span class="status-badge success">✅ Verified</span>'
  }

  // Helper function to render PAN verification details
  const renderPanVerification = (data) => {
    if (data.error) {
      return `
        <div class="verification-section">
          <h3>🏛️ PAN Documentation</h3>
          <div class="error-message">
            <strong>Error:</strong> ${data.error}
          </div>
        </div>
      `
    }

    const panData = data.pan_data || {}
    return `
      <div class="verification-section">
        <h3>🏛️ PAN Documentation ${getStatusBadge(false)}</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">PAN Number:</span>
            <span class="value">${panData.document_id || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Full Name:</span>
            <span class="value">${panData.name || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">First Name:</span>
            <span class="value">${panData.first_name || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Last Name:</span>
            <span class="value">${panData.last_name || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Date of Birth:</span>
            <span class="value">${panData.date_of_birth || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Gender:</span>
            <span class="value">${panData.gender || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Category:</span>
            <span class="value">${panData.category || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Aadhaar Linked:</span>
            <span class="value">${panData.aadhaar_linked ? "Yes" : "No"}</span>
          </div>
          ${
            panData.masked_aadhaar_number
              ? `
          <div class="detail-item">
            <span class="label">Masked Aadhaar:</span>
            <span class="value">${panData.masked_aadhaar_number}</span>
          </div>
          `
              : ""
          }
        </div>
        <div class="verification-status">
          <strong>Status:</strong> ${data.message || "Verified Successfully"}
        </div>
      </div>
    `
  }

  // Helper function to render Bank verification details
  // Updated Helper function to render Bank verification details
  const renderBankVerification = (data) => {
    if (data.error) {
      return `
        <div class="verification-section">
          <h3>🏦 Bank Account Documentation</h3>
          <div class="error-message">
            <strong>Error:</strong> ${data.error}
          </div>
        </div>
      `
    }

    const bankData = data.bank_account_data || {}
    return `
      <div class="verification-section">
        <h3>🏦 Bank Account Documentation ${getStatusBadge(false)}</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Account Holder Name:</span>
            <span class="value">${bankData.name || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Bank Name:</span>
            <span class="value">${bankData.bank_name || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Branch:</span>
            <span class="value">${bankData.branch || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">City:</span>
            <span class="value">${bankData.city || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">MICR Code:</span>
            <span class="value">${bankData.micr || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Reference ID:</span>
            <span class="value">${bankData.reference_id || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">UTR Number:</span>
            <span class="value">${bankData.utr || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Verification Code:</span>
            <span class="value">${data.code || "N/A"}</span>
          </div>
        </div>
        <div class="verification-status">
          <strong>Status:</strong> ${data.message || "Verified Successfully"}
        </div>
      </div>
    `
  }

  // Helper function to render Driving License verification details
  const renderDrivingLicenseVerification = (data) => {
    if (data.error) {
      return `
        <div class="verification-section">
          <h3>🚗 Driving License Documentation</h3>
          <div class="error-message">
            <strong>Error:</strong> ${data.error}
          </div>
        </div>
      `
    }

    return `
      <div class="verification-section">
        <h3>🚗 Driving License Documentation ${getStatusBadge(false)}</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">License Number:</span>
            <span class="value">${data.license_number || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Holder Name:</span>
            <span class="value">${data.holder_name || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Date of Birth:</span>
            <span class="value">${data.date_of_birth || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Issue Date:</span>
            <span class="value">${data.issue_date || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Expiry Date:</span>
            <span class="value">${data.expiry_date || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="label">Vehicle Classes:</span>
            <span class="value">${data.vehicle_classes || "N/A"}</span>
          </div>
        </div>
        <div class="verification-status">
          <strong>Status:</strong> ${data.message || "Verified Successfully"}
        </div>
      </div>
    `
  }

  // Generate verification sections based on available data
  let verificationsHtml = ""

  if (reportData.verifypanServices) {
    verificationsHtml += renderPanVerification(reportData.verifypanServices)
  }

  if (reportData.bankVerification) {
    verificationsHtml += renderBankVerification(reportData.bankVerification)
  }

  if (reportData.drivingLicense) {
    verificationsHtml += renderDrivingLicenseVerification(reportData.drivingLicense)
  }

  // Count successful and failed verifications
  const totalVerifications = Object.keys(reportData).length
  const failedVerifications = Object.values(reportData).filter((item) => item.error).length
  const successfulVerifications = totalVerifications - failedVerifications

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documents Report - ${reportName}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8f9fa;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                min-height: 100vh;
            }

            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                text-align: center;
                position: relative;
            }

            .header::after {
                content: '';
                position: absolute;
                bottom: -10px;
                left: 0;
                right: 0;
                height: 10px;
                background: linear-gradient(90deg, #667eea, #764ba2);
                clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
            }

            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
                font-weight: 700;
            }

            .header p {
                font-size: 1.1rem;
                opacity: 0.9;
            }

            .report-info {
                background: #f8f9fa;
                padding: 1.5rem;
                border-left: 4px solid #667eea;
                margin: 2rem;
                border-radius: 0 8px 8px 0;
            }

            .report-info h2 {
                color: #667eea;
                margin-bottom: 1rem;
                font-size: 1.3rem;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }

            .info-item {
                display: flex;
                flex-direction: column;
            }

            .info-label {
                font-weight: 600;
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 0.25rem;
            }

            .info-value {
                color: #333;
                font-size: 1rem;
            }

            .summary-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin: 2rem;
            }

            .stat-card {
                background: white;
                padding: 5px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border-top: 4px solid;
            }

            .stat-card.total {
                border-top-color: #667eea;
            }

            .stat-card.success {
                border-top-color: #28a745;
            }

            .stat-card.failed {
                border-top-color: #dc3545;
            }

            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }

            .stat-label {
                color: #666;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .content {
                padding: 0 2rem 2rem;
            }

            .verification-section {
                background: white;
                margin-bottom: 2rem;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border: 1px solid #e9ecef;
            }

            .verification-section h3 {
                background: #f8f9fa;
                padding: 1rem 1.5rem;
                margin: 0;
                color: #495057;
                font-size: 1.2rem;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                padding: 1.5rem;
            }

            .detail-item {
                display: flex;
                flex-direction: column;
                padding: 0.75rem;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 3px solid #667eea;
            }

            .label {
                font-weight: 600;
                color: #666;
                font-size: 0.85rem;
                margin-bottom: 0.25rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .value {
                color: #333;
                font-size: 1rem;
                font-weight: 500;
            }

            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
            }

            .status-badge.success {
                background: #d4edda;
                color: #155724;
            }

            .status-badge.error {
                background: #f8d7da;
                color: #721c24;
            }

            .verification-status {
                padding: 1rem 1.5rem;
                background: #e8f5e8;
                border-top: 1px solid #e9ecef;
                color: #155724;
                font-weight: 500;
            }

            .error-message {
                padding: 1.5rem;
                background: #f8d7da;
                color: #721c24;
                border-left: 4px solid #dc3545;
                margin: 1rem 1.5rem;
                border-radius: 0 8px 8px 0;
            }

            .footer {
                background: #f8f9fa;
                padding: 2rem;
                text-align: center;
                border-top: 1px solid #e9ecef;
                margin-top: 2rem;
            }

            .footer p {
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }

            .disclaimer {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 1rem;
                margin: 2rem;
                color: #856404;
            }

            .disclaimer h4 {
                margin-bottom: 0.5rem;
                color: #856404;
            }

            @media print {
                body {
                    background: white;
                }
                
                .container {
                    box-shadow: none;
                }
                
                .verification-section {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Documents Report</h1>
                <p>Comprehensive Identity & Document Details</p>
            </div>

            <div class="report-info">
                <h2>📊 Report Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Report Name</span>
                        <span class="info-value">${reportName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Generated On</span>
                        <span class="info-value">${currentDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Generated At</span>
                        <span class="info-value">${currentTime}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Organization</span>
                        <span class="info-value">${organizationInfo.name || "N/A"}</span>
                    </div>
                </div>
            </div>

            <div class="summary-stats">
                <div class="stat-card total">
                    <div class="stat-number">${totalVerifications}</div>
                    <div class="stat-label">Total Documents</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-number">${successfulVerifications}</div>
                    <div class="stat-label">Successful</div>
                </div>
                <div class="stat-card failed">
                    <div class="stat-number">${failedVerifications}</div>
                    <div class="stat-label">Failed</div>
                </div>
            </div>

            <div class="content">
                ${verificationsHtml}
            <div class="disclaimer">
                <h4>⚠️ Important Disclaimer</h4>
                <p>This report is generated based on third-party verification services. The accuracy of the information depends on the data provided by respective government and financial institutions. This report should be used for verification purposes only and not as a legal document.</p>
            </div>

            <div class="footer">
                <p><strong>Report ID:</strong> ${Date.now()}</p>
                <p>Confidential Document</p>
                <p style="margin-top: 1rem; font-size: 0.8rem;">This is an automated report. Please verify the authenticity before making any decisions.</p>
            </div>
        </div>
    </body>
    </html>
  `
}
