"use client";

import React from "react";
import Button from "@/components/ui/button/Button";
import { MdArrowBack, MdAudioFile, MdVideoFile } from "react-icons/md";
import { QRCodeCanvas } from "qrcode.react";
import config from "@/config/globalConfig";

// Base URL for media files
const FTP_BASE_URL = process.env.FTP_BASE_URL || "http://adonplayftp.geniusdevelops.com/";

interface MediaDetailsProps {
    media: any;
    onBack: () => void;
}

const MediaDetails: React.FC<MediaDetailsProps> = ({ media, onBack }) => {
    if (!media) return null;

    const formatDate = (dateString) => {
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
            <div className="flex items-center mb-6">
                <Button 
                    onClick={onBack} 
                    variant="outline" 
                    size="sm"
                    className="mr-4"
                >
                    <MdArrowBack size={18} className="mr-1" /> Volver
                </Button>
                <h1 className="text-2xl font-bold">Detalles de Media</h1>
            </div>

            {/* Media Preview */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
                <div className="border rounded-lg p-4 bg-gray-50">
                    {media.type === "image" ? (
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-md border rounded overflow-hidden mb-4 relative">
                                {/* Description overlay for image */}
                                {media.description && (
                                    <div 
                                        style={getPositionStyle(media.description_position)}
                                        className={`p-2 bg-black bg-opacity-70 text-white rounded ${getTextSizeClass(media.description_size)} max-w-[80%]`}
                                    >
                                        {media.description}
                                    </div>
                                )}
                                
                                {/* QR code overlay for image */}
                                {media.qr_info && (
                                    <div style={getPositionStyle(media.qr_position)}>
                                        <QRCodeCanvas
                                            value={media.qr_info}
                                            size={100}
                                            level="H"
                                            bgColor="#FFFFFF"
                                            fgColor="#000000"
                                        />
                                    </div>
                                )}
                                
                                <img 
                                    src={FTP_BASE_URL + media.file_path} 
                                    alt="Image preview" 
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                            {media.audio_path && (
                                <div className="w-full max-w-md">
                                    <div className="flex items-center mb-2">
                                        <MdAudioFile size={24} className="text-green-500 mr-2" />
                                        <span className="font-medium">Audio</span>
                                    </div>
                                    <audio 
                                        src={FTP_BASE_URL + media.audio_path} 
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
                                {media.description && (
                                    <div 
                                        style={getPositionStyle(media.description_position)}
                                        className={`p-2 bg-black bg-opacity-70 text-white rounded ${getTextSizeClass(media.description_size)} max-w-[80%] z-20`}
                                    >
                                        {media.description}
                                    </div>
                                )}
                                
                                {/* QR code overlay for video */}
                                {media.qr_info && (
                                    <div style={getPositionStyle(media.qr_position)} className="z-20">
                                        <QRCodeCanvas
                                            value={media.qr_info}
                                            size={100}
                                            level="H"
                                            bgColor="#FFFFFF"
                                            fgColor="#000000"
                                        />
                                    </div>
                                )}
                                
                                <video 
                                    src={FTP_BASE_URL + media.file_path} 
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
                        <h3 className="font-medium text-gray-700 mb-2">Slide Name</h3>
                        <p>{media.slide.name}</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium text-gray-700 mb-2">Duration</h3>
                        <p>{media.duration} segundos</p>
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