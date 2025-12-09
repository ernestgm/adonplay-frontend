"use client";

import React from "react";
import { MdAudioFile } from "react-icons/md";
import mediaUrl from "@/utils/files";
import Image from "next/image";


interface MediaDetailsProps {
    media: any;
}

const MediaDetails: React.FC<MediaDetailsProps> = ({ media }) => {
    if (!media) return null;

    const formatDate = (dateString: string | number | Date) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            {/* Media Preview */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
                <div className="border rounded-lg p-4 bg-gray-50">
                    {media.media_type === "image" ? (
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-md border rounded overflow-hidden mb-4 relative">
                                <Image
                                    src={mediaUrl(media.file_path)}
                                    alt="Image preview"
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        </div>
                    ) : media.media_type === "audio" ? (
                            <div className="w-full max-w-md">
                                <div className="flex items-center mb-2">
                                    <MdAudioFile size={24} className="text-green-500 mr-2" />
                                    <span className="font-medium">Audio</span>
                                </div>
                                <audio
                                    src={mediaUrl(media.file_path)}
                                    controls
                                    className="w-full"
                                />
                            </div>
                        )
                        : (
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-md border rounded overflow-hidden mb-4 relative">
                                <video 
                                    src={mediaUrl(media.file_path)}
                                    controls 
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Details */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Información</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium text-gray-700 mb-2">Owner</h3>
                        <p>{media.owner.name}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium text-gray-700 mb-2">Created At</h3>
                        <p>{formatDate(media.created_at)}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium text-gray-700 mb-2">Updated At</h3>
                        <p>{formatDate(media.updated_at)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaDetails;