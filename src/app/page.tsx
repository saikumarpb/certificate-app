'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
    certificateId: string;
}

const schema = z.string().uuid();

export default function Home() {
    const [certificateData, setCertificateData] = useState<string | null>('');
    const [certificateId, setCertificateId] = useState<string | null>('');

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const onPreviewClick = () => {
        if (certificateData) {
            window.open(certificateData);
        }
    };

    const onDownloadClick = () => {
        if (certificateData) {
            const a = document.createElement('a');
            a.href = certificateData;
            const fileName = `certificate-${certificateId}.pdf`;
            a.download = fileName;
            a.click();
        }
    };

    const generateCertificate = async () => {
        try {
            const response = await fetch('/api/certificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const pdfData = await response.blob();
                setCertificateData(URL.createObjectURL(pdfData));
                setCertificateId('example-certificate-id');
            } else {
                console.error(
                    'Certificate generation failed:',
                    response.statusText
                );

                alert(await response.json());
            }
        } catch (error) {
            console.error('Error generating certificate:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-semibold mb-4">Create Certificate</h1>
            <form className="w-full max-w-md">
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-white font-medium"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none"
                        style={{ color: 'black' }}
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="firstName"
                        className="block text-white font-medium"
                    >
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none"
                        style={{ color: 'black' }}
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="lastName"
                        className="block text-white font-medium"
                    >
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none"
                        style={{ color: 'black' }}
                    />
                </div>
                <button
                    type="button"
                    onClick={generateCertificate}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition duration-150"
                >
                    Generate Certificate
                </button>
            </form>
            {certificateData && (
                <div className="mt-4">
                    <button
                        onClick={onPreviewClick}
                        className="mr-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-150"
                    >
                        Preview
                    </button>
                    <button
                        onClick={onDownloadClick}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-150"
                    >
                        Download
                    </button>
                </div>
            )}
            <div className="mt-4">
                <Link href="/search">Search certificate</Link>
            </div>
        </div>
    );
}
