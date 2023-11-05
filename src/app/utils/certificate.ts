export function generateUniqueCertificateId(length: number) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        id += charset.charAt(randomIndex);
    }

    return id;
}

export function getCertificate(
    email: string,
    firstName: string,
    lastName: string,
    certificateId: string
) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MERN Stack Cohort Certificate of Completion</title>
        <style>
            body {
                background-color: #fff;
                font-family: 'Merriweather', serif;
            }
    
            .certificate {
                max-width: 800px;
                margin: 0 auto;
                background-color: #FFFAFA;
                padding: 20px;
                border: 2px solid #FFA500;
                border-radius: 10px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
            }
    
            h1 {
                text-align: center;
                color: #FFA500;
                font-size: 32px;
                margin-bottom: 20px;
            }
    
            p {
                margin: 10px 0;
                font-size: 18px;
                text-align: center;
            }
    
            .certificate-info {
                text-align: center;
                padding: 20px;
                margin-bottom: 20px;
            }
    
            .footer {
                text-align: center;
                font-size: 18px;
                color: #FFA500;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <h1>MERN Stack Cohort Certificate of Completion</h1>
            <div class="certificate-info">
                <p>This is to certify that</p>
                <p><strong>${firstName} ${lastName}</strong></p>
                <p>has successfully completed the MERN Stack Cohort.</p>
                <p>Certificate ID: <strong>${certificateId}</strong></p>
                <p>Email: ${email}</p>
            </div>
            <p class="footer">Issue Date: November 2023</p>
        </div>
    </body>
    </html>
    
`;
}
