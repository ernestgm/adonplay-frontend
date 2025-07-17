"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import { useError } from "@/context/ErrorContext";
import { useMessage } from "@/context/MessageContext";
import { createMedia } from "@/server/api/media";
import config from "@/config/globalConfig";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import { ChevronDownIcon } from "@/icons";
import ComponentCard from "@/components/common/ComponentCard";
import PositionExample from "@/components/common/PositionExample";
import FileInput from "@/components/form/input/FileInput";
import {QRCodeCanvas} from "qrcode.react";
import handleDownloadQr from "@/utils/qrCode";

const typeOptions = [
    { value: "image", label: "Imagen" },
    { value: "video", label: "Video" },
];

const descriptionPositions = config.positions;
const textSizes = config.text_sizes;
const qrPositions = descriptionPositions;

interface MediaFormProps {
    media?: any;
    slideId: any;
}

const MediaForm: React.FC<MediaFormProps> = ({ media, slideId }) => {
    const [form, setForm] = useState({
        slide_id: slideId || "",
        type: media.type || "image",
        description: media.description || "",
        description_position: media.description_position || "bc",
        description_size: media.description_size || "md",
        qr_info: media.qr_info || "",
        qr_position: media.qr_position || "bc",
        duration: media.duration || "5",
    });
    const [file, setFile] = useState<File[] | File | null>(null);
    const [audio, setAudio] = useState<File | null>(null); // Keep for backward compatibility
    const [imageAudioMap, setImageAudioMap] = useState<Map<number, File>>(new Map());
    const [imagePreviewUrls, setImagePreviewUrls] = useState<Map<number, string>>(new Map());
    const [fileError, setFileError] = useState("");
    const [audioError, setAudioError] = useState("");
    const [audioErrors, setAudioErrors] = useState<Map<number, string>>(new Map());
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const router = useRouter();
    
    // Clean up video preview URL and image preview URLs when component unmounts or when URLs change
    useEffect(() => {
        return () => {
            // Clean up video preview
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
            
            // Clean up image previews
            imagePreviewUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [videoPreviewUrl, imagePreviewUrls]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (value) => {
        setForm({ ...form, type: value });
        
        // Clean up video preview URL when switching from video to image
        if (value === "image" && videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }
        
        // Clean up image preview URLs when switching from image to video
        if (value === "video" && imagePreviewUrls.size > 0) {
            imagePreviewUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
            setImagePreviewUrls(new Map());
            setImageAudioMap(new Map());
            setAudioErrors(new Map());
        }
        
        // Reset file state when changing type
        setFile(null);
    };

    const handleDescriptionChange = (value) => {
        setForm({ ...form, description: value });
    };

    const handlePositionChange = (value) => {
        setForm({ ...form, description_position: value });
    };

    const handleTextSizeChange = (value) => {
        setForm({ ...form, description_size: value });
    };

    const handleQrPositionChange = (value) => {
        setForm({ ...form, qr_position: value });
    };

    const handleFileChange = (e) => {
        setFileError("");
        const files = e.target.files;
        
        // Clean up previous preview URLs
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }
        
        // Clean up image preview URLs
        imagePreviewUrls.forEach(url => {
            URL.revokeObjectURL(url);
        });
        setImagePreviewUrls(new Map());
        
        // Clear audio files and errors when new files are selected
        setImageAudioMap(new Map());
        setAudioErrors(new Map());
        
        if (form.type === "image") {
            for (let i = 0; i < files.length; i++) {
                if (!files[i].type.match("image/jpeg")) {
                    setFileError("Solo se permiten imágenes JPG");
                    return;
                }
            }
            
            const imageFiles = Array.from(files) as File[];
            setFile(imageFiles);
            
            // Create preview URLs for each image
            const newImagePreviewUrls = new Map<number, string>();
            imageFiles.forEach((imageFile, index) => {
                const previewUrl = URL.createObjectURL(imageFile as Blob);
                newImagePreviewUrls.set(index, previewUrl);
            });
            setImagePreviewUrls(newImagePreviewUrls);
            
        } else if (form.type === "video") {
            if (files.length > 1) {
                setFileError("Solo se puede subir un video");
                return;
            }
            if (!files[0].type.match("video/mp4")) {
                setFileError("Solo se permite video MP4");
                return;
            }
            const videoFile = files[0];
            setFile(videoFile);
            
            // Create preview URL for video
            const previewUrl = URL.createObjectURL(videoFile);
            setVideoPreviewUrl(previewUrl);
        }
    };

    // Legacy audio handler (kept for backward compatibility)
    const handleAudioChange = (e) => {
        setAudioError("");
        const file = e.target.files[0];
        if (file && !file.type.match("audio/mp3|audio/mpeg")) {
            setAudioError("Solo se permite audio MP3");
            return;
        }
        setAudio(file);
    };
    
    // Handle audio file selection for a specific image
    const handleImageAudioChange = (e, imageIndex) => {
        // Clear error for this image
        const newAudioErrors = new Map(audioErrors);
        newAudioErrors.delete(imageIndex);
        setAudioErrors(newAudioErrors);
        
        const file = e.target.files[0];
        
        // Validate audio file type
        if (file && !file.type.match("audio/mp3|audio/mpeg")) {
            const newErrors = new Map(audioErrors);
            newErrors.set(imageIndex, "Solo se permite audio MP3");
            setAudioErrors(newErrors);
            return;
        }
        
        // Store audio file for this image
        const newAudioMap = new Map(imageAudioMap);
        if (file) {
            newAudioMap.set(imageIndex, file);
        } else {
            newAudioMap.delete(imageIndex);
        }
        setImageAudioMap(newAudioMap);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({});
        setFileError("");
        setAudioError("");
        
        try {
            const formData = new FormData();
            
            // Add form fields
            Object.entries(form).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });
            
            // Add files based on type
            if (form.type === "image" && Array.isArray(file)) {
                // For images, add each file with its index
                file.forEach((f, index) => {
                    formData.append(`file[${index}]`, f);
                    
                    // If there's an audio file for this image, add it with the same index
                    if (imageAudioMap.has(index)) {
                        formData.append(`audio[${index}]`, imageAudioMap.get(index));
                    }
                });
                
                // Add legacy audio for backward compatibility
                if (audio) {
                    formData.append("audio", audio);
                }
            } else if (file) {
                // For video, just add the single file
                formData.append("file", file as File);
            }
            
            // Send the form data to the server
            await createMedia(slideId, formData);
            setMessage("Item creado correctamente");
            router.push(`/slides/edit/${slideId}`);
        } catch (err) {
            if (err.response && err.response.data) {
                setValidationErrors(err.response.data.errors || {});
            } else {
                setError("Error al guardar el item");
            }
        } finally {
            setLoading(false);
        }
    };

    function handleQrInfoChange(value) {
        setForm({ ...form, qr_info: value });
    }

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>Tipo *</Label>
                <div className="relative">
                    <Select
                        defaultValue={form.type}
                        onChange={handleTypeChange}
                        options={typeOptions}
                        className="w-full"
                        error={validationErrors['type']}
                        hint={validationErrors['type']}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon/>
                    </span>
                </div>
            </div>
            
            <div className="mb-5">
                <Label>{form.type === "image" ? "Imágenes JPG" : "Video MP4"} *</Label>
                <FileInput
                    name="file"
                    accept={form.type === "image" ? ".jpg" : ".mp4"}
                    multiple={form.type === "image"}
                    onChange={handleFileChange}
                    error={fileError ? true : false}
                    hint={fileError}
                    required
                />
            </div>
            
            {form.type === "video" && videoPreviewUrl && (
                <div className="mb-5">
                    <Label>Vista previa del video</Label>
                    <div className="mt-2 border rounded overflow-hidden">
                        <video 
                            src={videoPreviewUrl} 
                            controls 
                            className="w-full h-auto max-h-[300px]"
                        />
                    </div>
                </div>
            )}
            
            {/* Legacy audio input - hidden but kept for backward compatibility */}
            <div className="hidden">
                <FileInput
                    name="audio"
                    accept=".mp3,audio/mpeg"
                    onChange={handleAudioChange}
                    error={audioError ? true : false}
                    hint={audioError}
                />
            </div>
            
            {form.type === "image" && Array.isArray(file) && file.length > 0 && (
                <div className="mb-5">
                    <Label>Imágenes con Audio MP3 (opcional)</Label>
                    <div className="mt-3 space-y-4">
                        {Array.from(imagePreviewUrls.entries()).map(([index, previewUrl]) => (
                            <div key={index} className="p-3 border rounded-md">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Image preview */}
                                    <div className="w-full sm:w-1/3">
                                        <div className="border rounded overflow-hidden">
                                            <img 
                                                src={previewUrl} 
                                                alt={`Imagen ${index + 1}`} 
                                                className="w-full h-auto object-contain"
                                                style={{ maxHeight: '150px' }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Audio input for this image */}
                                    <div className="w-full sm:w-2/3">
                                        <div className="mb-1 font-medium">Imagen {index + 1}</div>
                                        <div className="mb-1 text-xs">Select Audio</div>
                                        <FileInput
                                            name={`audio-${index}`}
                                            accept=".mp3,audio/mpeg"
                                            onChange={(e) => handleImageAudioChange(e, index)}
                                            error={audioErrors.has(index)}
                                            hint={audioErrors.get(index) || ''}
                                        />
                                        {imageAudioMap.has(index) && (
                                            <div className="mt-1 text-sm text-green-600">
                                                Audio seleccionado: {imageAudioMap.get(index)?.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {form.type === "image" && (
                <>
                    {form.type === "image" && (
                        <div className="mb-5">
                            <Label>Duración (segundos)</Label>
                            <Label className="text-xs">Si la imagen no posee un audio se le aplicara la siguiente duracion.</Label>
                            <Input
                                name="duration"
                                type="number"
                                min="1"
                                value={form.duration}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div className="mb-5">
                        <Label>Descripción</Label>
                        <TextArea
                            value={form.description}
                            onChange={handleDescriptionChange}
                        />
                    </div>

                    { form.description !== "" && (
                        <div className="mb-5">
                            <ComponentCard title="Description Settings">
                                <div className="flex flex-wrap items-center gap-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                                        <div className="flex-1 min-w-0">
                                            <Label>Description Position</Label>
                                            <div className="relative mb-5">
                                                <Select
                                                    defaultValue={form.description_position}
                                                    onChange={handlePositionChange}
                                                    options={descriptionPositions.map(u => ({value: u.value, label: u.label}))}
                                                    className="w-full"
                                                />
                                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon/>
                                            </span>
                                            </div>
                                            <Label>Text Size</Label>
                                            <div className="relative">
                                                <Select
                                                    defaultValue={form.description_size}
                                                    onChange={handleTextSizeChange}
                                                    options={textSizes.map(u => ({value: u.value, label: u.label}))}
                                                    className="w-full"
                                                />
                                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon/>
                                            </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center flex-shrink-0 mt-4 sm:mt-0">
                                            <span className="font-medium mb-2">Example</span>
                                            <PositionExample position={form.description_position}/>
                                        </div>
                                    </div>
                                </div>
                            </ComponentCard>
                        </div>
                    ) }
                </>
            )}

            <div className="mb-8">
                <Label>Qr Info</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1">
                        <TextArea
                            value={form.qr_info}
                            onChange={handleQrInfoChange}
                            rows={6}
                        />
                    </div>
                    {form.qr_info !== "" && (
                        <div className="flex flex-col items-center gap-2">
                            <QRCodeCanvas
                                id="qrcode-canvas"
                                value={form.qr_info || []}
                                size={120}
                                level="H"
                                marginSize={1}
                            />
                            <Button type="button" variant="outline" onClick={handleDownloadQr} className="mt-2 w-full">
                                Descargar QR
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            { form.qr_info !== "" && (
                <div className="mb-5">
                    <ComponentCard title="QR Settings">
                        <div className="flex flex-wrap items-center gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                                <div className="flex-1 min-w-0">
                                    <div className="mt-4">
                                        <Label>QR Position</Label>
                                        <div className="relative">
                                            <Select
                                                defaultValue={form.qr_position}
                                                onChange={handleQrPositionChange}
                                                options={qrPositions.map(u => ({value: u.value, label: u.label}))}
                                                className="w-full"
                                            />
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <ChevronDownIcon/>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center flex-shrink-0 mt-4 sm:mt-0">
                                    <span className="font-medium mb-2">Example</span>
                                    <PositionExample position={form.qr_position}/>
                                </div>
                            </div>
                        </div>
                    </ComponentCard>
                </div>
            )}

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push(`/slides/edit/${slideId}`)}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                    { media ? "Guardar Cambios" : "Crear" }
                </Button>
            </div>
        </Form>
    );
};

export default MediaForm;