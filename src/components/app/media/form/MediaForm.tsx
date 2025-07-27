"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import { useError } from "@/context/ErrorContext";
import { useMessage } from "@/context/MessageContext";
import { createMedia, updateMedia } from "@/server/api/media";
import { getDataUserAuth } from "@/server/api/auth";
import { fetchUsers } from "@/server/api/users";
import config from "@/config/globalConfig";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import { ChevronDownIcon } from "@/icons";
import ComponentCard from "@/components/common/ComponentCard";
import PositionExample from "@/components/common/PositionExample";
import FileInput from "@/components/form/input/FileInput";
import {QRCodeCanvas} from "qrcode.react";
import handleDownloadQr from "@/utils/qrCode";
import mediaUrl from "@/utils/files";

const typeOptions = config.typeOptions;

interface MediaFormProps {
    media?: any;
}

const MediaForm: React.FC<MediaFormProps> = ({ media }) => {
    const [form, setForm] = useState({
        media_type: media?.media_type || "image",
        file_path: media?.file_path || "",
        owner_id: media?.owner_id || "",
    });
    
    const [file, setFile] = useState<File[] | File | null>(null);
    const [audio, setAudio] = useState<File | null>(null); // Keep for backward compatibility
    const [imagePreviewUrls, setImagePreviewUrls] = useState<Map<number, string>>(new Map());
    const [audioPreviewUrls, setAudioPreviewUrls] = useState<Map<number, string>>(new Map());
    const [fileError, setFileError] = useState("");
    const [audioError, setAudioError] = useState("");
    const [audioErrors, setAudioErrors] = useState<Map<number, string>>(new Map());
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const router = useRouter();
    
    // Initialize preview URLs for existing media when component mounts
    useEffect(() => {
        if (media) {
            if (media.media_type === "video" && media.file_path) {
                // Concatenate FTP_BASE_URL with file_path for video preview
                setVideoPreviewUrl(mediaUrl(media.file_path));
            } else if (media.media_type === "image" && media.file_path) {
                // For image, use a single image with FTP_BASE_URL + file_path
                const newImagePreviewUrls = new Map<number, string>();
                newImagePreviewUrls.set(0, mediaUrl(media.file_path));
                setImagePreviewUrls(newImagePreviewUrls);
            } else if (media.media_type === "audio" && media.file_path) {
                // For audio, use a single audio with FTP_BASE_URL + file_path
                const newAudioPreviewUrls = new Map<number, string>();
                newAudioPreviewUrls.set(0, mediaUrl(media.file_path));
                setAudioPreviewUrls(newAudioPreviewUrls);
            }
        }
    }, [media]);
    
    // Fetch users and determine if current user is admin
    useEffect(() => {
        const loadUsers = async () => {
            try {
                // Get current user from auth
                const userData = getDataUserAuth();
                setCurrentUser(userData);
                
                // Determine if user is admin (assuming role or isAdmin property exists)
                // This is an assumption - adjust based on actual user object structure
                setIsAdmin(userData?.role === 'admin' || userData?.isAdmin === true);
                
                // If user is admin, fetch all users for dropdown
                if (userData?.role === 'admin' || userData?.isAdmin === true) {
                    const response = await fetchUsers();
                    setUsers(response || []);
                }
                
                // If not editing and current user is not admin, set owner_id to current user's ID
                if (!media && userData && !(userData?.role === 'admin' || userData?.isAdmin === true)) {
                    setForm(prevForm => ({
                        ...prevForm,
                        owner_id: userData.id
                    }));
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Error fetching users");
            }
        };
        
        loadUsers();
    }, []);

    // Clean up video preview URL, image preview URLs, and audio preview URLs when component unmounts or when URLs change
    useEffect(() => {
        return () => {
            // Clean up video preview
            if (videoPreviewUrl && !videoPreviewUrl.startsWith('http')) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
            
            // Clean up image previews
            imagePreviewUrls.forEach(url => {
                if (!url.startsWith('http')) {
                    URL.revokeObjectURL(url);
                }
            });
            
            // Clean up audio previews
            audioPreviewUrls.forEach(url => {
                if (!url.startsWith('http')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [videoPreviewUrl, imagePreviewUrls, audioPreviewUrls]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (value) => {
        // Update both type and media_type fields for consistency
        setForm({ ...form, media_type: value });
        
        // Clean up video preview URL when switching from video
        if (value !== "video" && videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }
        
        // Clean up image preview URLs when switching from image
        if (value !== "image" && imagePreviewUrls.size > 0) {
            imagePreviewUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
            setImagePreviewUrls(new Map());
            setAudioErrors(new Map());
        }
        
        // Clean up audio preview URLs when switching from audio
        if (value !== "audio" && audioPreviewUrls.size > 0) {
            audioPreviewUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
            setAudioPreviewUrls(new Map());
        }
        
        // Reset file state when changing type
        setFile(null);
    };

    const handleFileChange = (e) => {
        setFileError("");
        const files = e.target.files;
        
        if (!files || files.length === 0) return;
        
        // Clean up previous preview URLs
        if (videoPreviewUrl && !videoPreviewUrl.startsWith('http')) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }
        
        // Clean up image preview URLs
        imagePreviewUrls.forEach(url => {
            if (!url.startsWith('http')) {
                URL.revokeObjectURL(url);
            }
        });
        setImagePreviewUrls(new Map());
        
        // Clean up audio preview URLs
        audioPreviewUrls.forEach(url => {
            if (!url.startsWith('http')) {
                URL.revokeObjectURL(url);
            }
        });
        setAudioPreviewUrls(new Map());
        
        // Clear audio files and errors when new files are selected
        setAudioErrors(new Map());
        
        const isEditing = !!media?.id;
        
        if (form.media_type === "image") {
            if (isEditing) {
                // When editing, only process the first file
                const imageFile = files[0];
                
                if (!imageFile.type.match("image/jpeg")) {
                    setFileError("Solo se permiten imágenes JPG");
                    return;
                }
                
                // Set a single file, not an array
                setFile(imageFile);
                
                // Create preview URL for the single image
                const newImagePreviewUrls = new Map<number, string>();
                const previewUrl = URL.createObjectURL(imageFile as Blob);
                newImagePreviewUrls.set(0, previewUrl);
                setImagePreviewUrls(newImagePreviewUrls);
            } else {
                // When creating, process all selected files
                for (let i = 0; i < files.length; i++) {
                    if (!files[i].type.match("image/jpeg")) {
                        setFileError("Solo se permiten imágenes JPG");
                        return;
                    }
                }
                
                // Convert FileList to array and store it
                const imageFiles = Array.from(files) as File[];
                setFile(imageFiles);
                
                // Create preview URLs for each image
                const newImagePreviewUrls = new Map<number, string>();
                imageFiles.forEach((imageFile, index) => {
                    const previewUrl = URL.createObjectURL(imageFile as Blob);
                    newImagePreviewUrls.set(index, previewUrl);
                });
                setImagePreviewUrls(newImagePreviewUrls);
            }
        } else if (form.media_type === "video") {
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
        } else if (form.media_type === "audio") {
            if (isEditing) {
                // When editing, only process the first file
                const audioFile = files[0];
                
                if (!audioFile.type.match("audio/mp3|audio/mpeg")) {
                    setFileError("Solo se permiten audios MP3");
                    return;
                }
                
                // Set a single file, not an array
                setFile(audioFile);
                
                // Create preview URL for the single audio
                const newAudioPreviewUrls = new Map<number, string>();
                const previewUrl = URL.createObjectURL(audioFile as Blob);
                newAudioPreviewUrls.set(0, previewUrl);
                setAudioPreviewUrls(newAudioPreviewUrls);
            } else {
                // When creating, process all selected files
                for (let i = 0; i < files.length; i++) {
                    if (!files[i].type.match("audio/mp3|audio/mpeg")) {
                        setFileError("Solo se permiten audios MP3");
                        return;
                    }
                }
                
                // Convert FileList to array and store it
                const audioFiles = Array.from(files) as File[];
                setFile(audioFiles);
                
                // Create preview URLs for each audio
                const newAudioPreviewUrls = new Map<number, string>();
                audioFiles.forEach((audioFile, index) => {
                    const previewUrl = URL.createObjectURL(audioFile as Blob);
                    newAudioPreviewUrls.set(index, previewUrl);
                });
                setAudioPreviewUrls(newAudioPreviewUrls);
            }
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
            
            // Ensure owner_id is set
            if (!form.owner_id && currentUser) {
                formData.append("owner_id", currentUser.id);
            }
            
            // Check if we're editing or creating
            const isEditing = !!media?.id;
            
            if (isEditing) {
                // When editing, only include files that have been changed
                if (form.media_type === "image") {
                    // For images, only include file if it has been selected
                    if (file && !Array.isArray(file)) {
                        // User has selected a new image file
                        formData.append("file", file as File);
                    } else {
                        // No new image file, keep existing file_path
                        formData.append("keep_file", "true");
                    }
                } else if (form.media_type === "video") {
                    // For video, only include file if it has been selected
                    if (file) {
                        // User has selected a new video file
                        formData.append("file", file as File);
                    } else {
                        // No new video file, keep existing file_path
                        formData.append("keep_file", "true");
                    }
                } else if (form.media_type === "audio") {
                    // For audio, only include file if it has been selected
                    if (file) {
                        // User has selected a new audio file
                        formData.append("file", file as File);
                    } else {
                        // No new audio file, keep existing file_path
                        formData.append("keep_file", "true");
                    }
                }
                
                // Update the media
                await updateMedia(media.id, formData);
                setMessage("Item actualizado correctamente");
            } else {
                // When creating, include all files
                if (form.media_type === "image") {
                    // For images, check if we have multiple files
                    if (file && Array.isArray(file)) {
                        // Add each file with its index
                        file.forEach((f, index) => {
                            formData.append(`file[${index}]`, f);
                        });
                    } else if (file) {
                        // Single file case (shouldn't happen when creating, but handle it anyway)
                        formData.append("file", file as File);
                    }
                } else if (form.media_type === "video") {
                    // For video, just add the single file
                    if (file) {
                        formData.append("file", file as File);
                    }
                } else if (form.media_type === "audio") {
                    // For audio, check if we have multiple files
                    if (file && Array.isArray(file)) {
                        // Add each file with its index
                        file.forEach((f, index) => {
                            formData.append(`file[${index}]`, f);
                        });
                    } else if (file) {
                        // Single file case (shouldn't happen when creating, but handle it anyway)
                        formData.append("file", file as File);
                    }
                }
                
                // Create the media
                await createMedia(formData);
                setMessage("Item creado correctamente");
            }
            
            router.push(`/media-library`);
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

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>Tipo *</Label>
                <div className="relative">
                    <Select
                        defaultValue={form.media_type}
                        onChange={handleTypeChange}
                        options={typeOptions}
                        className="w-full"
                        error={validationErrors['media_type']}
                        hint={validationErrors['media_type']}
                        disabled={media}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon/>
                    </span>
                </div>
            </div>
            
            {isAdmin && media && (
                <div className="mb-5">
                    <Label>Propietario *</Label>
                    <div className="relative">
                        <Select
                            defaultValue={form.owner_id}
                            onChange={(value) => setForm({ ...form, owner_id: value })}
                            options={users.map(user => ({ value: user.id, label: user.name || user.email }))}
                            className="w-full"
                            error={validationErrors.owner_id}
                            hint={validationErrors.owner_id}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                            <ChevronDownIcon/>
                        </span>
                    </div>
                </div>
            )}
            
            {!isAdmin && currentUser && (
                <div className="mb-5">
                    <Label>Propietario</Label>
                    <div className="p-2 border rounded bg-gray-50">
                        {currentUser.name || currentUser.email} (Tú)
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        Como no eres administrador, automáticamente serás el propietario del contenido.
                    </div>
                </div>
            )}
            
            <div className="mb-5">
                <Label>
                    {form.media_type === "image"
                        ? (media ? "Imagen JPG" : "Imágenes JPG") 
                        : form.media_type === "video"
                            ? "Video MP4" 
                            : "Audios MP3"} 
                    {!media && "*"}
                </Label>
                <FileInput
                    name="file"
                    accept={
                        form.media_type === "image"
                            ? ".jpg" 
                            : form.media_type === "video"
                                ? ".mp4" 
                                : ".mp3"
                    }
                    multiple={(form.media_type === "image" || form.media_type === "audio") && !media} // Multiple for images and audio when creating
                    onChange={handleFileChange}
                    error={fileError ? true : false}
                    hint={fileError}
                    required={!media} // Only required when creating new media
                />
                {media && (
                    <div className="mt-1 text-xs text-gray-500">
                        {form.media_type === "image"
                            ? "Deja este campo vacío si no deseas cambiar la imagen existente." 
                            : form.media_type === "video"
                                ? "Deja este campo vacío si no deseas cambiar el video existente."
                                : "Deja este campo vacío si no deseas cambiar el audio existente."}
                    </div>
                )}
            </div>
            
            {form.media_type === "video" && videoPreviewUrl && (
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
            
            {form.media_type === "audio" && audioPreviewUrls.size > 0 && (
                <div className="mb-5">
                    <Label>{media ? "Vista previa del audio" : "Vista previa de los audios"}</Label>
                    <div className="mt-2 space-y-4">
                        {Array.from(audioPreviewUrls.entries()).map(([index, previewUrl]) => (
                            <div key={index} className="p-3 border rounded-md">
                                <div className="flex flex-col gap-2">
                                    <div className="font-medium">Audio {index + 1}</div>
                                    <audio 
                                        src={previewUrl} 
                                        controls 
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        ))}
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
            
            {form.media_type === "image" && (file || imagePreviewUrls.size > 0) && (
                <div className="mb-5">
                    <Label>{media ? "Imagen" : "Imágenes"}</Label>
                    <div className="mt-3 space-y-4">
                        {media ? (
                            // Single image preview for editing
                            <div className="p-3 border rounded-md">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Image preview */}
                                    <div className="w-full">
                                        <div className="border rounded overflow-hidden">
                                            <img 
                                                src={imagePreviewUrls.get(0) || ''} 
                                                alt="Imagen" 
                                                className="w-full h-auto object-contain"
                                                style={{ maxHeight: '250px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Multiple image previews for creating
                            <div className="columns-3">
                                {Array.from(imagePreviewUrls.entries()).map(([index, previewUrl]) => (
                                <div key={index} className="p-3 border rounded-md">
                                    <div className="flex flex-row gap-4">
                                        {/* Image preview */}
                                        <div className="w-full">
                                            <div className="border rounded overflow-hidden">
                                                <img
                                                    src={previewUrl}
                                                    alt={`Imagen ${index + 1}`}
                                                    className="w-full h-auto object-contain"
                                                    style={{ maxHeight: '150px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push(`/media-library`)}>
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