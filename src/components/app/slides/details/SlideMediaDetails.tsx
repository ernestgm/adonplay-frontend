"use client";

import React, {useState} from "react";
import { MdAudioFile } from "react-icons/md";
import { QRCodeCanvas } from "qrcode.react";
import mediaUrl from "@/utils/files";
import Image from "next/image";
import {useT} from "@/i18n/I18nProvider";

// Base URL for media files

interface MediaDetailsProps {
    slideMedia: any;
}

const SlideMediaDetails: React.FC<MediaDetailsProps> = ({ slideMedia }) => {
    const tHeaders = useT("common.table.headers");
    const [media] = useState(slideMedia?.media || null);
    if (!slideMedia) return null;

    const formatDate = (dateString: any) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Function to get position styles for elements
    const getPositionStyle = (position: string): React.CSSProperties => {
        const base: React.CSSProperties = {
            position: 'absolute',
            zIndex: 10,
        };
        
        switch (position) {
            case 'tl': // top left
                return { ...base, top: 10, left: 10 };
            case 'tc': // top center
                return { ...base, top: 10, left: '50%', transform: 'translateX(-50%)' };
            case 'tr': // top right
                return { ...base, top: 10, right: 10 };
            case 'ml': // middle left
                return { ...base, top: '50%', left: 10, transform: 'translateY(-50%)' };
            case 'mc': // middle center
                return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
            case 'mr': // middle right
                return { ...base, top: '50%', right: 10, transform: 'translateY(-50%)' };
            case 'bl': // bottom left
                return { ...base, bottom: 10, left: 10 };
            case 'bc': // bottom center
                return { ...base, bottom: 10, left: '50%', transform: 'translateX(-50%)' };
            case 'br': // bottom right
                return { ...base, bottom: 10, right: 10 };
            default:
                return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    };

    // Function to get text size class
    const getTextSizeClass = (size: string): string => {
        switch (size) {
            case 'xs': return 'text-xs';
            case 'sm': return 'text-sm';
            case 'md': return 'text-base';
            case 'lg': return 'text-lg';
            case 'xl': return 'text-xl';
            default: return 'text-base';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            {/* Media Preview */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{tHeaders("preview")}</h2>
                <div className="border rounded-lg p-4 bg-gray-50">
                    {media?.media_type === "image" ? (
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-md border rounded overflow-hidden mb-4 relative">
                                {/* Description overlay for image */}
                                {slideMedia?.description && (
                                    <div 
                                        style={getPositionStyle(slideMedia?.description_position)}
                                        className={`p-2 bg-black bg-opacity-70 text-white rounded ${getTextSizeClass(slideMedia?.description_size)} max-w-[80%]`}
                                    >
                                        {slideMedia?.description}
                                    </div>
                                )}
                                
                                {/* QR code overlay for image */}
                                {slideMedia?.qr && (
                                    <div style={getPositionStyle(slideMedia?.qr.position)}>
                                        <QRCodeCanvas
                                            value={slideMedia?.qr.info}
                                            size={100}
                                            level="H"
                                            bgColor="#FFFFFF"
                                            fgColor="#000000"
                                        />
                                    </div>
                                )}

                                <Image
                                    src={mediaUrl(media?.file_path)}
                                    alt="Image preview"
                                    className="w-full h-auto object-contain"
                                    width={1024}
                                    height={720}
                                />

                            </div>
                            {slideMedia?.audio_media?.file_path && (
                                <div className="w-full max-w-md">
                                    <div className="flex items-center mb-2">
                                        <MdAudioFile size={24} className="text-green-500 mr-2" />
                                        <span className="font-medium">{tHeaders("audio")}</span>
                                    </div>
                                    <audio 
                                        src={mediaUrl(slideMedia?.audio_media?.file_path)}
                                        controls 
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-md border rounded overflow-hidden mb-4 relative">
                                {/* Description overlay for video */}
                                {slideMedia?.description && (
                                    <div
                                        style={getPositionStyle(slideMedia?.description_position)}
                                        className={`p-2 bg-black bg-opacity-70 text-white rounded ${getTextSizeClass(slideMedia?.description_size)} max-w-[80%]`}
                                    >
                                        {slideMedia?.description}
                                    </div>
                                )}

                                {/* QR code overlay for image */}
                                {slideMedia?.qr && (
                                    <div style={getPositionStyle(slideMedia?.qr.position)}>
                                        <QRCodeCanvas
                                            value={slideMedia?.qr.info}
                                            size={100}
                                            level="H"
                                            bgColor="#FFFFFF"
                                            fgColor="#000000"
                                        />
                                    </div>
                                )}
                                
                                <video 
                                    src={mediaUrl(media?.file_path)}
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
                <h2 className="text-xl font-semibold mb-4">{tHeaders("information")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium text-gray-700 mb-2">{tHeaders("slideName")}</h3>
                        <p>{slideMedia.slide.name}</p>
                    </div>

                    {media?.media_type === "image" && !slideMedia?.audio_media && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-medium text-gray-700 mb-2">{tHeaders("duration")}</h3>
                            <p>{slideMedia?.duration} s</p>
                        </div>
                    )}

                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium text-gray-700 mb-2">{tHeaders("createdAt")}</h3>
                        <p>{formatDate(slideMedia?.created_at)}</p>
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium text-gray-700 mb-2">{tHeaders("updatedAt")}</h3>
                        <p>{formatDate(slideMedia?.updated_at)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideMediaDetails;