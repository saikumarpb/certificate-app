'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface FormData {
    certificateId: string;
}

const schema = z.string().uuid();

export default function Home() {
    const { register, handleSubmit, formState } = useForm<FormData>();
    const { errors } = formState;

    const validateUUID = (value: string) => {
        return schema.safeParse(value).success;
    };

    const onSubmit = (data: FormData) => {
        console.log('submit clicked');

        if (schema.safeParse(data.certificateId).success) {
            console.log('UUID is valid.');
        } else {
            console.log('UUID is NOT valid.');
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
                            validate: validateUUID,
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
        </div>
    );
}
