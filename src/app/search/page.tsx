'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CertificateIdSchema } from '../utils/zod';

interface FormData {
    certificateId: string;
}



export default function SearchPage() {
    const [certificateData, setCertificateData] = useState<string | null>(''); 
    const [certificateId, setCertificateId] = useState<string | null>('');

    const { register, handleSubmit, formState } = useForm<FormData>();
    const { errors } = formState;

    const validateCertificateId = (value: string) => {
        return CertificateIdSchema.safeParse(value).success;
    };

    const onPreviewClick = () => {
        if (certificateData) {
            // Open the PDF in a new tab for preview
            window.open(certificateData);
        }
    };

    const onDownloadClick = () => {
        if (certificateData) {
            // Trigger a download of the PDF
            const a = document.createElement('a');
            a.href = certificateData;
            const fileName = `certificate-${certificateId}.pdf`;
            a.download = fileName
            a.click();
        }
    };

    const onSubmit = async (data: FormData) => {
        console.log('submit clicked');

        if (CertificateIdSchema.safeParse(data.certificateId).success) {
            try {
                const response = await fetch(`/api/certificate/${data.certificateId}`);
                if (response.ok) {
                    const pdfData = await response.blob();
                    const url = window.URL.createObjectURL(pdfData);
                    setCertificateData(url);
                    setCertificateId(data.certificateId);
                   
                } else {
                    console.log('Error fetching certificate:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching certificate:', error);
            }        } else {
            console.log('Certificate ID is not valid.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-semibold mb-4">
                Search for a Certificate
            </h1>
            <form className="w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label
                        htmlFor="certificateId"
                        className="block text-black font-medium"
                    >
                        Certificate ID
                    </label>
                    <input
                        type="text"
                        id="certificateId"
                        {...register('certificateId', {
                            required: true,
                            validate: validateCertificateId,
                        })}
                        className={`w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none ${
                            errors.certificateId
                                ? 'border-red-500'
                                : 'border-gray-300'
                        }`}
                        style={{ color: 'black' }}
                    />
                    {errors.certificateId && (
                        <p className="text-red-500 text-sm">
                            Invalid Certificate ID
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover-bg-blue-600 text-white font-medium py-2 rounded-md transition duration-150"
                >
                    Search
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
                <Link href="/">Generate certificate</Link>
            </div>
        </div>
    );
}
