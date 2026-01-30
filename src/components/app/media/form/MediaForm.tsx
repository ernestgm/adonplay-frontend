"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import { useError } from "@/context/ErrorContext";
import { useMessage } from "@/context/MessageContext";
import { createMedia, updateMedia } from "@/server/api/media";
import { getStoragePathFromDownloadURL, deleteFileByDownloadURL, uploadFileToStorageWithProgress, uploadFileToExactPathWithProgress } from "@/utils/firebaseStorage";
import { getDataUserAuth } from "@/server/api/auth";
import { fetchUsers } from "@/server/api/users";
import config from "@/config/globalConfig";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import { ChevronDownIcon } from "@/icons";
import FileInput from "@/components/form/input/FileInput";
import Switch from "@/components/form/switch/Switch";
import mediaUrl from "@/utils/files";
import Image from "@/components/ui/images/ExpandableImage";
import { getVideoDuration, transcodeToH264Compatible } from "@/utils/videoTranscode";
import { useT } from "@/i18n/I18nProvider";
import { PsdJsonRenderer } from "@/lib/PsdJsonRenderer";

const typeOptions = config.typeOptions;

interface MediaFormProps {
    media?: any;
}

const MediaForm: React.FC<MediaFormProps> = ({ media }) => {
    const [form, setForm] = useState({
        media_type: media?.media_type || "image",
        file_path: media?.file_path || "",
        owner_id: media?.owner_id || "",
        is_editable: media?.is_editable || false,
        json_path: media?.json_path || "",
    });
    const t = useT("forms.mediaForm");
    const tCommon = useT("common.buttons");
    const tSelect = useT("common.select");
    
    const [file, setFile] = useState<File[] | File | null>(null);
    const [jsonFile, setJsonFile] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null); // Keep for backward compatibility
    const [imagePreviewUrls, setImagePreviewUrls] = useState<Map<number, string>>(new Map());
    const [audioPreviewUrls, setAudioPreviewUrls] = useState<Map<number, string>>(new Map());
    const [fileError, setFileError] = useState("");
    const [audioError, setAudioError] = useState("");
    const [audioErrors, setAudioErrors] = useState<Map<number, string>>(new Map());
    const [loading, setLoading] = useState(false);
    const [convertProgress, setConvertProgress] = useState<number>(0);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadImgProgress, setUploadImgProgress] = useState<number>(0);
    const [uploadJsonProgress, setUploadJsonProgress] = useState<number>(0);
    const [convertStatus, setConvertStatus] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState({
        media_type: "",
        owner_id: "",
        json_path: ""
    });
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const router = useRouter();

    const generateImageFromJson = async (jsonFile: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const jsonContent = JSON.parse(e.target?.result as string);
                    const canvas = document.createElement("canvas");
                    const renderer = new PsdJsonRenderer();
                    console.log(jsonContent);
                    await renderer.render(canvas, jsonContent);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Failed to create blob from canvas"));
                    }, "image/jpeg", 0.9);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Failed to read JSON file"));
            reader.readAsText(jsonFile);
        });
    };

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
                setError(t("errors.fetchUsers"));
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

    // const handleChange = (e) => {
    //     setForm({ ...form, [e.target.name]: e.target.value });
    // };

    const handleTypeChange = (value: string) => {
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

    const handleIsEditableChange = (checked: boolean) => {
        setForm({ ...form, is_editable: checked });
        setImagePreviewUrls(new Map());
        setAudioErrors(new Map());
    }

    const handleFileChange = async (e: { target: { name?: string; files: any; }; }) => {
        setFileError("");
        const files = e.target.files;
        
        if (!files || files.length === 0) return;
        
        // Handle JSON file for editable images
        if (e.target.name === "jsonFile") {
            const file = files[0];
            if (file && !file.name.endsWith(".json") && file.type !== "application/json") {
                setValidationErrors(prev => ({ ...prev, json_path: t("errors.jsonOnlyJson") }));
                return;
            }
            setJsonFile(file);
            setValidationErrors(prev => ({ ...prev, json_path: "" }));
            return;
        }

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
                    setFileError(t("errors.imageOnlyJpg"));
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
                        setFileError(t("errors.imageOnlyJpg"));
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
                setFileError(t("errors.singleVideoOnly"));
                return;
            }
            if (!files[0].type.match("video/mp4")) {
                setFileError(t("errors.videoOnlyMp4"));
                return;
            }
            const videoFile = files[0];
            // Validate duration <= 60s
            try {
                const duration = await getVideoDuration(videoFile);
                if (duration > 60) {
                    setFileError(t("errors.videoDurationMax"));
                    return;
                }
            } catch (_) {
                // If duration cannot be read, block upload to be safe
                setFileError(t("errors.videoDurationUnreadable"));
                return;
            }
            setFile(videoFile);
            
            // Create preview URL for video
            const previewUrl = URL.createObjectURL(videoFile);
            setVideoPreviewUrl(previewUrl);
        } else if (form.media_type === "audio") {
            if (isEditing) {
                // When editing, only process the first file
                const audioFile = files[0];
                
                if (!audioFile.type.match("audio/mp3|audio/mpeg")) {
                    setFileError(t("errors.audioOnlyMp3"));
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
                        setFileError(t("errors.audioOnlyMp3"));
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
    const handleAudioChange = (e: any) => {
        setAudioError("");
        const file = e.target.files[0];
        if (file && !file.type.match("audio/mp3|audio/mpeg")) {
            setAudioError(t("errors.audioOnlyMp3"));
            return;
        }
        setAudio(file);
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({owner_id: "", media_type: "", json_path: ""});
        setFileError("");
        setAudioError("");
        setConvertProgress(0);
        setUploadProgress(0);
        setConvertStatus("");
        
        try {
            // Validate JSON if editable
            const isEditing = !!media?.id;
            if (form.media_type === "image" && form.is_editable && !jsonFile && !form.json_path) {
                setValidationErrors(prev => ({ ...prev, json_path: t("errors.mustSelectJson") }));
                setLoading(false);
                return;
            }

            // Ensure owner_id is set
            const ownerId = form.owner_id || currentUser?.id;
            
            if (isEditing) {
                // Build payload for update
                let file_path = media?.file_path;
                const newFile = file ? (Array.isArray(file) ? file[0] : (file as File)) : null;

                if (newFile) {
                    // If video, ensure duration and convert before upload
                    let fileToUpload: File = newFile;
                    if (form.media_type === "video") {
                        try {
                            const duration = await getVideoDuration(newFile);
                            if (duration > 60) {
                                setFileError(t("errors.videoDurationMax"));
                                setLoading(false);
                                return;
                            }
                        } catch {
                            setFileError(t("errors.videoDurationUnreadable"));
                            setLoading(false);
                            return;
                        }
                        setConvertStatus(t("status.convertingVideo"));
                        fileToUpload = await transcodeToH264Compatible(newFile, { videoProfile: "main" }, (p) => setConvertProgress(p));
                        setConvertStatus(t("status.conversionFinished"));
                    }
                    const existingStoragePath = getStoragePathFromDownloadURL(media?.file_path);
                    try {
                        if (existingStoragePath) {
                            if (media?.file_path) {
                                try { await deleteFileByDownloadURL(media.file_path); } catch {}
                            }
                            // Overwrite same path -> URL usually remains valid
                            const uploaded = await uploadFileToStorageWithProgress(fileToUpload, `media/${form.media_type}`, (p) => setUploadProgress(p));
                            file_path = uploaded.downloadURL || media?.file_path;
                        } else {
                            // If we can't detect Firebase path, upload a new one
                            const uploaded = await uploadFileToStorageWithProgress(fileToUpload, `media/${form.media_type}`, (p) => setUploadProgress(p));
                            file_path = uploaded.downloadURL;
                            // Best effort: try to delete old if it was Firebase URL
                            if (media?.file_path) {
                                try { await deleteFileByDownloadURL(media.file_path); } catch {}
                            }
                        }
                    } catch (e) {
                        // If overwrite fails, fall back to new upload and delete old file
                        const uploaded = await uploadFileToStorageWithProgress(fileToUpload, `media/${form.media_type}`, (p) => setUploadProgress(p));
                        const oldPath = media?.file_path;
                        file_path = uploaded.downloadURL;
                        if (oldPath) {
                            try { await deleteFileByDownloadURL(oldPath); } catch {}
                        }
                    }
                } else if (form.is_editable) {
                    // Si es editable, intentamos regenerar la imagen a partir del JSON si este cambió
                    if (jsonFile) {
                        try {
                            const imageBlob = await generateImageFromJson(jsonFile);
                            const fileName = jsonFile.name.replace(/\.json$/i, "") + ".jpg";
                            const imageFile = new File([imageBlob], fileName, { type: "image/jpeg" });

                            let uploadedImage;
                            const existingImagePath = getStoragePathFromDownloadURL(media?.file_path);
                            if (existingImagePath) {
                                uploadedImage = await uploadFileToExactPathWithProgress(imageFile, existingImagePath, (p) => setUploadImgProgress(p));
                            } else {
                                uploadedImage = await uploadFileToStorageWithProgress(imageFile, `media/image`, (p) => setUploadImgProgress(p));
                            }
                            file_path = uploadedImage.downloadURL;

                            // Borrar la imagen anterior SOLO si la URL cambió
                            if (media?.file_path && existingImagePath !== getStoragePathFromDownloadURL(file_path)) {
                                try { await deleteFileByDownloadURL(media.file_path); } catch {}
                            }
                        } catch (err) {
                            console.error("Error generating image from JSON:", err);
                        }
                    } else if (!file_path) {
                        file_path = "EXAMPLE_IMG";
                    }
                }

                let json_path = form.json_path;

                if (form.media_type === "image" && form.is_editable && jsonFile) {
                    let uploadedJson;
                    const existingJsonPath = getStoragePathFromDownloadURL(media?.json_path);

                    if (existingJsonPath) {
                        console.log("Existing JSON path:", existingJsonPath);
                        uploadedJson = await uploadFileToExactPathWithProgress(jsonFile, existingJsonPath, (p) => setUploadJsonProgress(p));
                    } else {
                        console.log("Uploading new JSON path:", jsonFile);
                        uploadedJson = await uploadFileToStorageWithProgress(jsonFile, `media/json`, (p) => setUploadJsonProgress(p));
                    }
                    json_path = uploadedJson.downloadURL;

                    // Borrar el JSON anterior SOLO si la URL cambió
                    if (media?.json_path && existingJsonPath !== getStoragePathFromDownloadURL(json_path)) {
                        try { await deleteFileByDownloadURL(media.json_path); } catch {}
                    }
                }


                const payload: any = {
                    media_type: form.media_type,
                    owner_id: ownerId,
                    file_path,
                    is_editable: form.media_type === "image" ? form.is_editable : false,
                    json_path: form.media_type === "image" && form.is_editable ? json_path : null,
                };

                await updateMedia(media.id, payload);
                setMessage(t("messages.itemUpdated"));
            } else {
                // When creating, upload to Firebase and send only references
                if (!file && !form.is_editable) {
                    setFileError(t("errors.mustSelectFile"));
                    setLoading(false);
                    return;
                }

                if (form.media_type === "image" && form.is_editable) {
                    // Para imágenes editables, generamos la imagen a partir del JSON si se proporciona
                    let file_path = "";
                    let jsonPath = null;

                    if (jsonFile) {
                        try {
                            // 1. Generar imagen del JSON
                            const imageBlob = await generateImageFromJson(jsonFile);
                            const fileName = jsonFile.name.replace(/\.json$/i, "") + ".jpg";
                            const imageFile = new File([imageBlob], fileName, { type: "image/jpeg" });
                            const uploadedImage = await uploadFileToStorageWithProgress(imageFile, `media/image`, (p) => setUploadImgProgress(p));
                            file_path = uploadedImage.downloadURL;

                            console.log("Uploaded image:", uploadedImage);

                            // 2. Subir JSON
                            const uploadedJson = await uploadFileToStorageWithProgress(jsonFile, `media/json`, (p) => setUploadJsonProgress(p));
                            jsonPath = uploadedJson.downloadURL;

                            console.log("Uploaded JSON:", uploadedJson);
                        } catch (err) {
                            console.error("Error processing editable image:", err);
                        }
                    }

                    await createMedia({
                        media_type: "image",
                        owner_id: ownerId,
                        file_path: file_path,
                        is_editable: true,
                        json_path: jsonPath,
                    });
                } else if (form.media_type === "image" && Array.isArray(file)) {
                    // Multiple images: create one media per file
                    for (let i = 0; i < file.length; i++) {
                        const f = file[i];
                        const uploaded = await uploadFileToStorageWithProgress(f, `media/image`, (p) => setUploadImgProgress(p));

                        await createMedia({
                            media_type: "image",
                            owner_id: ownerId,
                            file_path: uploaded.downloadURL,
                            is_editable: false,
                            json_path: null,
                        });
                    }
                } else {
                    const toUpload = Array.isArray(file) ? file[0] : (file as File);
                    const mediaType = form.media_type;
                    let fileToUpload: File = toUpload;
                    if (mediaType === "video") {
                        try {
                            const duration = await getVideoDuration(toUpload);
                            if (duration > 60) {
                                setFileError(t("errors.videoDurationMax"));
                                setLoading(false);
                                return;
                            }
                        } catch {
                            setFileError(t("errors.videoDurationUnreadable"));
                            setLoading(false);
                            return;
                        }
                        setConvertStatus(t("status.convertingVideo"));
                        fileToUpload = await transcodeToH264Compatible(toUpload, { videoProfile: "main" }, (p) => setConvertProgress(p));
                        setConvertStatus(t("status.conversionFinished"));
                    }
                    const uploaded = await uploadFileToStorageWithProgress(fileToUpload, `media/${mediaType}`, (p) => setUploadProgress(p));

                    let jsonPath = null;
                    if (mediaType === "image" && form.is_editable && jsonFile) {
                        const uploadedJson = await uploadFileToStorageWithProgress(jsonFile, `media/json`, (p) => setUploadProgress(p));
                        jsonPath = uploadedJson.downloadURL;
                    }

                    await createMedia({
                        media_type: mediaType,
                        owner_id: ownerId,
                        file_path: uploaded.downloadURL,
                        is_editable: mediaType === "image" ? form.is_editable : false,
                        json_path: jsonPath,
                    });
                }
                setMessage(t("messages.itemCreated"));
            }
            
            router.push(`/media-library`);
        } catch (err: any) {
            if (err.response && err.response.data) {
                setValidationErrors(err.response.data.errors || {});
            } else {
                setError(t("errors.saveItem"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>{t("labels.type")}</Label>
                <div className="relative">
                    <Select
                        defaultValue={form.media_type}
                        onChange={handleTypeChange}
                        options={typeOptions}
                        className="w-full"
                        error={validationErrors.media_type !== ""}
                        hint={validationErrors.media_type}
                        disabled={media}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon/>
                    </span>
                </div>
            </div>
            
            {isAdmin && (
                <div className="mb-5">
                    <Label>{t("labels.ownerRequired")}</Label>
                    <div className="relative">
                        <Select
                            placeholder={tSelect("placeholder")}
                            defaultValue={form.owner_id}
                            onChange={(value) => setForm({ ...form, owner_id: value })}
                            options={users.map(user => ({ value: user.id, label: user.name || user.email }))}
                            className="w-full"
                            error={validationErrors.owner_id !== ""}
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
                    <Label>{t("labels.ownerReadonly")}</Label>
                    <div className="p-2 border rounded bg-gray-50">
                        {currentUser.name || currentUser.email} ({t("owner.you")})
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        {t("owner.notAdminHint")}
                    </div>
                </div>
            )}
            
            {isAdmin && form.media_type === "image" && (
                <div className="mb-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="mb-0">{t("labels.isEditable")}</Label>
                            <div className="text-xs text-gray-500">
                                {t("hints.adminOnlyEditable", { default: "Solo administradores pueden marcar imágenes como editables." })}
                            </div>
                        </div>
                        <Switch
                            id={1}
                            label=""
                            defaultChecked={form.is_editable}
                            onChange={(checked) => handleIsEditableChange(checked)}
                        />
                    </div>

                    {form.is_editable && !media && (
                        <div>
                            <Label>{t("labels.jsonFile")}*</Label>
                            <FileInput
                                name="jsonFile"
                                accept=".json,application/json"
                                onChange={handleFileChange}
                                error={!!validationErrors.json_path}
                                hint={validationErrors.json_path}
                                required={true}
                            />
                        </div>
                    )}

                    {form.is_editable && media && (
                        <div>
                            <Label>{t("labels.jsonFile")}*</Label>
                            <FileInput
                                name="jsonFile"
                                accept=".json,application/json"
                                onChange={handleFileChange}
                                error={!!validationErrors.json_path}
                                hint={validationErrors.json_path}
                                required={!form.json_path}
                            />
                            {form.json_path && (
                                <div className="mt-1 text-xs text-gray-500 truncate">
                                    {t("hints.keepJson", { default: "Deja este campo vacío si no quieres cambiar el archivo JSON." })}
                                    <div className="mt-1 text-blue-600 truncate">{form.json_path}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className={`mb-5 ${form.is_editable ? 'hidden' : ''}`}>
                <Label>
                    {form.media_type === "image"
                        ? (media ? t("labels.imageSingle") : t("labels.imageMultiple"))
                        : form.media_type === "video"
                            ? t("labels.video")
                            : t("labels.audio")} 
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
                    error={!!fileError}
                    hint={fileError}
                    required={!media && !form.is_editable} // Only required when creating new media and NOT editable
                />
                {media && (
                    <div className="mt-1 text-xs text-gray-500">
                        {form.media_type === "image"
                            ? t("hints.keepImage")
                            : form.media_type === "video"
                                ? t("hints.keepVideo")
                                : t("hints.keepAudio")}
                    </div>
                )}
            </div>
            
            {form.media_type === "video" && videoPreviewUrl && (
                <div className="mb-5">
                    <Label>{t("labels.videoPreview")}</Label>
                    <div className="mt-2 border rounded overflow-hidden">
                        <video 
                            src={videoPreviewUrl} 
                            controls 
                            className="w-full h-auto max-h-[300px]"
                        />
                    </div>
                    {(loading && convertProgress > 0) && (
                        <div className="mt-3">
                            <div className="text-sm text-gray-700">{convertStatus || t("status.convertingVideo")}</div>
                            <div className="w-full bg-gray-200 rounded h-2 mt-1">
                                <div className="bg-blue-600 h-2 rounded" style={{ width: `${convertProgress}%` }} />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{convertProgress}%</div>
                        </div>
                    )}
                    {(loading && uploadProgress > 0) && (
                        <div className="mt-3">
                            <div className="text-sm text-gray-700">{t("status.uploadingVideo")}</div>
                        <div className="w-full bg-gray-200 rounded h-2 mt-1">
                            <div className="bg-green-600 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{ Math.round(uploadProgress)}%</div>
                        </div>
                    )}
                </div>
            )}
            
            {form.media_type === "audio" && audioPreviewUrls.size > 0 && (
                <div className="mb-5">
                    <Label>{media ? t("labels.audioPreviewSingle") : t("labels.audioPreviewMultiple")}</Label>
                    <div className="mt-2 space-y-4">
                        {Array.from(audioPreviewUrls.entries()).map(([index, previewUrl]) => (
                            <div key={index} className="p-3 border rounded-md">
                                <div className="flex flex-col gap-2">
                                    <div className="font-medium">{t("labels.audioNumber", { n: index + 1 })}</div>
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
                    error={!!audioError}
                    hint={audioError}
                />
            </div>
            
            {form.media_type === "image" && (file || imagePreviewUrls.size > 0) && (
                    <div className="mb-5">
                    <Label>{media ? t("labels.imageSectionSingle") : t("labels.imageSectionMultiple")}</Label>
                    <div className="mt-3 space-y-4">
                        {media ? (
                            // Single image preview for editing
                            <div className="p-3 border rounded-md">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Image preview */}
                                    <div className="w-full">
                                        <div className="border rounded overflow-hidden">
                                            <Image
                                                src={imagePreviewUrls.get(0) || ''}
                                                alt={t("labels.imageAlt")}
                                                className="w-full h-auto object-contain"
                                                style={{ maxHeight: '250px' }}
                                                width={config.thumbnailSizes.width}
                                                height={config.thumbnailSizes.height}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Multiple image previews for creating
                            <div className="grid grid-cols-1 gap-4">
                                {Array.from(imagePreviewUrls.entries()).map(([index, previewUrl]) => (
                                    <div key={index} className="p-3 border rounded-md">
                                        <div className="flex flex-col gap-4">
                                            {/* Image preview */}
                                            <div className="flex gap-4">
                                                <div className="w-24 h-24 flex-shrink-0 border rounded overflow-hidden">
                                                    <Image
                                                        src={previewUrl}
                                                        alt={t("labels.imageAltNumber", { n: index + 1 })}
                                                        className="w-full h-full object-cover"
                                                        width={100}
                                                        height={100}
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="font-medium text-sm mb-1">{t("labels.imageNumber", { n: index + 1 })}</div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {(file as File[])[index]?.name}
                                                    </div>
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

            {form.media_type === "image" && form.is_editable && (
                <>
                    {(loading && uploadImgProgress > 0) && (
                        <div className="mt-3">
                            <div className="text-sm text-gray-700">{convertStatus || t("status.uploadingImg")}</div>
                            <div className="w-full bg-gray-200 rounded h-2 mt-1">
                                <div className="bg-blue-600 h-2 rounded" style={{ width: `${convertProgress}%` }} />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{convertProgress}%</div>
                        </div>
                    )}
                    {(loading && uploadJsonProgress > 0) && (
                        <div className="mt-3">
                            <div className="text-sm text-gray-700">{t("status.uploadingJson")}</div>
                            <div className="w-full bg-gray-200 rounded h-2 mt-1">
                                <div className="bg-green-600 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{ Math.round(uploadProgress)}%</div>
                        </div>
                    )}
                </>
                                <div key={index} className="p-3 border rounded-md">
                                    <div className="flex flex-row gap-4">
                                        {/* Image preview */}
                                        <div className="w-full">
                                            <div className="border rounded overflow-hidden">
                                                <Image
                                                    src={previewUrl}
                                                    alt={t("labels.imageAltNumber", { n: index + 1 })}
                                                    className="w-full h-auto object-contain"
                                                    width={config.thumbnailSizes.width}
                                                    height={config.thumbnailSizes.height}
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
                    {tCommon("cancel")}
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                    { media ? tCommon("saveChanges") : tCommon("create") }
                </Button>
            </div>
        </Form>
    );
};

export default MediaForm;