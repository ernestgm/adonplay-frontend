"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import { useError } from "@/context/ErrorContext";
import { useMessage } from "@/context/MessageContext";
import { createSlideMedias, updateSlideMedias } from "@/server/api/slidesMedia";
import { fetchMedia } from "@/server/api/media";
import { fetchQrCode } from "@/server/api/qrcodes";
import { getDataUserAuth } from "@/server/api/auth";
import config from "@/config/globalConfig";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import { ChevronDownIcon } from "@/icons";
import ComponentCard from "@/components/common/ComponentCard";
import PositionExample from "@/components/common/PositionExample";
import FileInput from "@/components/form/input/FileInput";
import { QRCodeCanvas } from "qrcode.react";
import handleDownloadQr from "@/utils/qrCode";
import mediaUrl from "@/utils/files";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Checkbox from "@/components/form/input/Checkbox";
import { MdSearch, MdAudioFile, MdVideoFile, MdImage } from "react-icons/md";
import Pagination from "@/components/tables/Pagination";
import filterItems from "@/utils/filterItems";

// Base URL for media files
const FTP_BASE_URL = process.env.FTP_BASE_URL || "http://adonplayftp.geniusdevelops.com/";

const typeOptions = [
    { value: "image", label: "Imagen" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
];

const descriptionPositions = config.positions;
const textSizes = config.text_sizes;
const qrPositions = descriptionPositions;

interface MediaFormProps {
    media?: any;
    slideId: string;
}

const SlideMediaForm: React.FC<MediaFormProps> = ({ media, slideId }) => {
    const [form, setForm] = useState({
        slide_id: slideId,
        media_id: media?.media_id || "",
        duration: media?.duration || "5",
        audio_media_id: media?.audio_media_id || "",
        qr_id: media?.qr_id || "",
        description: media?.description || "",
        text_size: media?.text_size || "md",
        description_position: media?.description_position || "bc",
    });

    // State for media selection
    const [allMedia, setAllMedia] = useState([]);
    const [selectedMediaId, setSelectedMediaId] = useState(media?.media_id || "");
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedAudioId, setSelectedAudioId] = useState(media?.audio_media_id || "");
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [mediaSearchTerm, setMediaSearchTerm] = useState("");
    const [audioSearchTerm, setAudioSearchTerm] = useState("");
    const [currentMediaPage, setCurrentMediaPage] = useState(1);
    const [currentAudioPage, setCurrentAudioPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [showMediaSelector, setShowMediaSelector] = useState(false);
    const [showAudioSelector, setShowAudioSelector] = useState(false);
    const [uploadNewMedia, setUploadNewMedia] = useState(false);
    
    // State for QR codes
    const [qrCodes, setQrCodes] = useState([]);
    const [selectedQrId, setSelectedQrId] = useState(media?.qr_id || "");
    const [selectedQr, setSelectedQr] = useState(null);
    const [qrSearchTerm, setQrSearchTerm] = useState("");
    const [showQrSelector, setShowQrSelector] = useState(false);

    // State for file upload
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const router = useRouter();

    // Fetch all media and QR codes when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {

                // Fetch media
                const mediaData = await fetchMedia();
                setAllMedia(mediaData);
                
                // Fetch QR codes
                const qrData = await fetchQrCode();
                
                setQrCodes(qrData);
                
                // Set selected QR if it exists
                if (media?.qr_id) {
                    const qr = qrData.find(q => q.id === parseInt(media.qr_id));
                    setSelectedQr(qr);
                }
            } catch (err) {
                setError(err.data?.message || err.message || "Error al cargar datos");
            }
        };
        fetchData();
    }, []);

    // Set selected media and audio when media_id or audio_media_id changes
    useEffect(() => {
        if (selectedMediaId && allMedia.length > 0) {
            const media = allMedia.find(m => m.id === parseInt(selectedMediaId));
            setSelectedMedia(media);
            
            // Set preview URL based on media type
            if (media) {
                if (media.media_type === "image") {
                    setImagePreviewUrl(mediaUrl(media.file_path));
                    setVideoPreviewUrl(null);
                    setAudioPreviewUrl(null);
                } else if (media.media_type === "video") {
                    setVideoPreviewUrl(mediaUrl(media.file_path));
                    setImagePreviewUrl(null);
                    setAudioPreviewUrl(null);
                } else if (media.media_type === "audio") {
                    setAudioPreviewUrl(mediaUrl(media.file_path));
                    setImagePreviewUrl(null);
                    setVideoPreviewUrl(null);
                }
            }
        }

        if (selectedAudioId && allMedia.length > 0) {
            const audio = allMedia.find(m => m.id === parseInt(selectedAudioId));
            setSelectedAudio(audio);
        }
    }, [selectedMediaId, selectedAudioId, allMedia]);

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreviewUrl && !imagePreviewUrl.startsWith('http')) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
            if (videoPreviewUrl && !videoPreviewUrl.startsWith('http')) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
            if (audioPreviewUrl && !audioPreviewUrl.startsWith('http')) {
                URL.revokeObjectURL(audioPreviewUrl);
            }
        };
    }, [imagePreviewUrl, videoPreviewUrl, audioPreviewUrl]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDescriptionChange = (value) => {
        setForm({ ...form, description: value });
    };

    const handlePositionChange = (value) => {
        setForm({ ...form, description_position: value });
    };

    const handleTextSizeChange = (value) => {
        setForm({ ...form, text_size: value });
    };

    const handleQrInfoChange = (value) => {
        setForm({ ...form, qr_id: value });
    };
    
    const handleSelectQr = (qrId) => {
        setSelectedQrId(qrId.toString());
        setForm({ ...form, qr_id: qrId.toString() });
        
        // Find the selected QR code
        const qr = qrCodes.find(q => q.id === parseInt(qrId));
        setSelectedQr(qr);
        
        setShowQrSelector(false);
    };

    const handleFileChange = (e) => {
        setFileError("");
        const files = e.target.files;
        
        if (!files || files.length === 0) return;
        
        // Clean up previous preview URLs
        if (imagePreviewUrl && !imagePreviewUrl.startsWith('http')) {
            URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl(null);
        }
        if (videoPreviewUrl && !videoPreviewUrl.startsWith('http')) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }
        if (audioPreviewUrl && !audioPreviewUrl.startsWith('http')) {
            URL.revokeObjectURL(audioPreviewUrl);
            setAudioPreviewUrl(null);
        }
        
        const file = files[0];
        setFile(file);
        
        // Create preview URL based on file type
        if (file.type.match("image/jpeg")) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(previewUrl);
        } else if (file.type.match("video/mp4")) {
            const previewUrl = URL.createObjectURL(file);
            setVideoPreviewUrl(previewUrl);
        } else if (file.type.match("audio/mp3|audio/mpeg")) {
            const previewUrl = URL.createObjectURL(file);
            setAudioPreviewUrl(previewUrl);
        } else {
            setFileError("Formato de archivo no soportado");
        }
    };

    const handleSelectMedia = (mediaId) => {
        setSelectedMediaId(mediaId.toString());
        setForm({ ...form, media_id: mediaId.toString() });
        setShowMediaSelector(false);
    };

    const handleSelectAudio = (audioId) => {
        setSelectedAudioId(audioId.toString());
        setForm({ ...form, audio_media_id: audioId.toString() });
        setShowAudioSelector(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({});
        setFileError("");
        
        try {
            const formData = new FormData();
            
            // Add form fields
            Object.entries(form).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });
            
            // Add file if uploading new media
            if (uploadNewMedia && file) {
                formData.append("file", file);
            }
            
            // Check if we're editing or creating
            const isEditing = !!media?.id;
            
            if (isEditing) {
                // Update the slide media
                await updateSlideMedias(media.id, formData);
                setMessage("Slide media actualizado correctamente");
            } else {
                // Create new slide media
                await createSlideMedias(formData);
                setMessage("Slide media creado correctamente");
            }
            
            // Redirect back to the slide media management page
            router.push(`/slides/media-management/${slideId}`);
        } catch (err) {
            if (err.response && err.response.data) {
                setValidationErrors(err.response.data.errors || {});
            } else {
                setError("Error al guardar el slide media");
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter media for selectors
    const filteredMedia = filterItems(allMedia, mediaSearchTerm);
    const filteredAudio = allMedia.filter(item => 
        item.media_type === "audio" && 
        (audioSearchTerm === "" || 
         item.file_path.toLowerCase().includes(audioSearchTerm.toLowerCase()))
    );
    
    // Paginate media
    const totalMediaPages = Math.ceil(filteredMedia.length / itemsPerPage);
    const paginatedMedia = filteredMedia.slice(
        (currentMediaPage - 1) * itemsPerPage,
        currentMediaPage * itemsPerPage
    );
    
    // Paginate audio
    const totalAudioPages = Math.ceil(filteredAudio.length / itemsPerPage);
    const paginatedAudio = filteredAudio.slice(
        (currentAudioPage - 1) * itemsPerPage,
        currentAudioPage * itemsPerPage
    );

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>Seleccionar Media *</Label>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button 
                            type="button" 
                            variant={!uploadNewMedia ? "primary" : "outline"} 
                            onClick={() => setUploadNewMedia(false)}
                            className="flex-1"
                        >
                            Seleccionar Existente
                        </Button>
                        <Button 
                            type="button" 
                            variant={uploadNewMedia ? "primary" : "outline"} 
                            onClick={() => setUploadNewMedia(true)}
                            className="flex-1"
                        >
                            Subir Nuevo
                        </Button>
                    </div>
                    
                    {!uploadNewMedia ? (
                        <div>
                            {selectedMedia ? (
                                <div className="p-3 border rounded-md mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 flex-shrink-0">
                                            {selectedMedia.media_type === "image" ? (
                                                <div className="w-full h-full border rounded overflow-hidden">
                                                    <img 
                                                        src={mediaUrl(selectedMedia.file_path)} 
                                                        alt="Selected media" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : selectedMedia.media_type === "video" ? (
                                                <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded">
                                                    <MdVideoFile size={32} className="text-blue-500" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded">
                                                    <MdAudioFile size={32} className="text-blue-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">Media seleccionado</div>
                                            <div className="text-sm text-gray-500">
                                                {selectedMedia.media_type === "image" ? "Imagen" : 
                                                 selectedMedia.media_type === "video" ? "Video" : "Audio"}
                                            </div>
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setShowMediaSelector(true)}
                                        >
                                            Cambiar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setShowMediaSelector(true)}
                                    className="w-full"
                                >
                                    Seleccionar Media
                                </Button>
                            )}
                            
                            {showMediaSelector && (
                                <div className="mt-2 border rounded-md p-3">
                                    <div className="mb-3 flex justify-between items-center">
                                        <h3 className="font-medium">Seleccionar Media</h3>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setShowMediaSelector(false)}
                                        >
                                            Cerrar
                                        </Button>
                                    </div>
                                    <div className="relative mb-3">
                                        <Input
                                            placeholder="Buscar media..."
                                            value={mediaSearchTerm}
                                            onChange={(e) => setMediaSearchTerm(e.target.value)}
                                            type="text"
                                            className="pl-[62px]"
                                        />
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 p-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                            <MdSearch size={20}/>
                                        </span>
                                    </div>
                                    
                                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                        <Table className="min-w-full divide-y divide-gray-200">
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Seleccionar
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</TableCell>
                                                    <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vista Previa</TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="bg-white divide-y divide-gray-200">
                                                {paginatedMedia.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="px-3 py-2 text-center text-sm text-gray-500">
                                                            No hay media disponible
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paginatedMedia.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                <Checkbox
                                                                    checked={selectedMediaId === item.id.toString()}
                                                                    onChange={() => handleSelectMedia(item.id)}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                {item.media_type === "image" ? "Imagen" : 
                                                                 item.media_type === "video" ? "Video" : "Audio"}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                {item.media_type === "image" ? (
                                                                    <div className="w-12 h-12 border rounded overflow-hidden">
                                                                        <img 
                                                                            src={mediaUrl(item.file_path)}
                                                                            alt="Image preview" 
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                ) : item.media_type === "video" ? (
                                                                    <div className="flex items-center">
                                                                        <MdVideoFile size={24} className="text-blue-500 mr-2" />
                                                                        <span>Video</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center">
                                                                        <MdAudioFile size={24} className="text-blue-500 mr-2" />
                                                                        <span>Audio</span>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    
                                    <div className="mt-3 flex justify-center">
                                        <Pagination
                                            currentPage={currentMediaPage}
                                            totalPages={totalMediaPages}
                                            onPageChange={setCurrentMediaPage}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <FileInput
                                name="file"
                                accept=".jpg,.mp4,.mp3"
                                onChange={handleFileChange}
                                error={fileError ? true : false}
                                hint={fileError}
                                required={!media}
                            />
                            
                            {imagePreviewUrl && (
                                <div className="mt-3 p-3 border rounded-md">
                                    <div className="font-medium mb-2">Vista previa de la imagen</div>
                                    <div className="border rounded overflow-hidden">
                                        <img 
                                            src={imagePreviewUrl} 
                                            alt="Image preview" 
                                            className="w-full h-auto max-h-[200px] object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {videoPreviewUrl && (
                                <div className="mt-3 p-3 border rounded-md">
                                    <div className="font-medium mb-2">Vista previa del video</div>
                                    <div className="border rounded overflow-hidden">
                                        <video 
                                            src={videoPreviewUrl} 
                                            controls 
                                            className="w-full h-auto max-h-[200px]"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {audioPreviewUrl && (
                                <div className="mt-3 p-3 border rounded-md">
                                    <div className="font-medium mb-2">Vista previa del audio</div>
                                    <audio 
                                        src={audioPreviewUrl} 
                                        controls 
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {(selectedMedia?.media_type === "image" || imagePreviewUrl) && (
                <div className="mb-5">
                    <Label>Asignar Audio (opcional)</Label>
                    <div className="flex flex-col gap-2">
                        {selectedAudio ? (
                            <div className="p-3 border rounded-md mb-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded">
                                        <MdAudioFile size={24} className="text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">Audio seleccionado</div>
                                        <audio 
                                            src={mediaUrl(selectedAudio.file_path)} 
                                            controls 
                                            className="w-full mt-1"
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowAudioSelector(true)}
                                    >
                                        Cambiar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowAudioSelector(true)}
                                className="w-full"
                            >
                                Seleccionar Audio
                            </Button>
                        )}
                        
                        {showAudioSelector && (
                            <div className="mt-2 border rounded-md p-3">
                                <div className="mb-3 flex justify-between items-center">
                                    <h3 className="font-medium">Seleccionar Audio</h3>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowAudioSelector(false)}
                                    >
                                        Cerrar
                                    </Button>
                                </div>
                                <div className="relative mb-3">
                                    <Input
                                        placeholder="Buscar audio..."
                                        value={audioSearchTerm}
                                        onChange={(e) => setAudioSearchTerm(e.target.value)}
                                        type="text"
                                        className="pl-[62px]"
                                    />
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 p-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        <MdSearch size={20}/>
                                    </span>
                                </div>
                                
                                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                    <Table className="min-w-full divide-y divide-gray-200">
                                        <TableHeader className="bg-gray-50">
                                            <TableRow>
                                                <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Seleccionar
                                                </TableCell>
                                                <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Audio</TableCell>
                                                <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vista Previa</TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="bg-white divide-y divide-gray-200">
                                            {paginatedAudio.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="px-3 py-2 text-center text-sm text-gray-500">
                                                        No hay audios disponibles
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedAudio.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Checkbox
                                                                checked={selectedAudioId === item.id.toString()}
                                                                onChange={() => handleSelectAudio(item.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            Audio
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <audio 
                                                                src={mediaUrl(item.file_path)} 
                                                                controls 
                                                                className="w-full"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                <div className="mt-3 flex justify-center">
                                    <Pagination
                                        currentPage={currentAudioPage}
                                        totalPages={totalAudioPages}
                                        onPageChange={setCurrentAudioPage}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {(selectedMedia?.media_type === "image" || imagePreviewUrl) && !selectedAudio && (
                <div className="mb-5">
                    <Label>Duración (segundos) *</Label>
                    <div className="text-xs text-gray-500 mb-1">
                        Si la imagen tiene un audio asignado, la duración del audio tendrá prioridad.
                    </div>
                    <Input
                        name="duration"
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={handleChange}
                        required
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
            
            {form.description !== "" && (
                <div className="mb-5">
                    <ComponentCard title="Configuración de Descripción">
                        <div className="flex flex-wrap items-center gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                                <div className="flex-1 min-w-0">
                                    <Label>Posición de Descripción</Label>
                                    <div className="relative mb-5">
                                        <Select
                                            value={form.description_position}
                                            onChange={handlePositionChange}
                                            options={descriptionPositions.map(u => ({value: u.value, label: u.label}))}
                                            className="w-full"
                                        />
                                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                            <ChevronDownIcon/>
                                        </span>
                                    </div>
                                    <Label>Tamaño de Texto</Label>
                                    <div className="relative">
                                        <Select
                                            value={form.text_size}
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
                                    <span className="font-medium mb-2">Ejemplo</span>
                                    <PositionExample position={form.description_position}/>
                                </div>
                            </div>
                        </div>
                    </ComponentCard>
                </div>
            )}
            
            <div className="mb-8">
                <Label>Seleccionar QR Code</Label>
                <div className="flex flex-col gap-4">
                    {selectedQr ? (
                        <div className="p-3 border rounded-md mb-2">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 flex-shrink-0">
                                    <QRCodeCanvas
                                        value={selectedQr.info || ""}
                                        size={64}
                                        level="H"
                                        marginSize={1}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">QR seleccionado</div>
                                    <div className="text-sm text-gray-500">{selectedQr.name || "QR Code"}</div>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowQrSelector(true)}
                                >
                                    Cambiar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowQrSelector(true)}
                            className="w-full"
                        >
                            Seleccionar QR Code
                        </Button>
                    )}
                    
                    {showQrSelector && (
                        <div className="mt-2 border rounded-md p-3">
                            <div className="mb-3 flex justify-between items-center">
                                <h3 className="font-medium">Seleccionar QR Code</h3>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowQrSelector(false)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                            <div className="relative mb-3">
                                <Input
                                    placeholder="Buscar QR code..."
                                    value={qrSearchTerm}
                                    onChange={(e) => setQrSearchTerm(e.target.value)}
                                    type="text"
                                    className="pl-[62px]"
                                />
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 p-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    <MdSearch size={20}/>
                                </span>
                            </div>
                            
                            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                <Table className="min-w-full divide-y divide-gray-200">
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Seleccionar
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</TableCell>
                                            <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vista Previa</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="bg-white divide-y divide-gray-200">
                                        {qrCodes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="px-3 py-2 text-center text-sm text-gray-500">
                                                    No hay QR codes disponibles
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            // Filter QR codes by search term
                                            qrCodes
                                                .filter(qr => 
                                                    qrSearchTerm === "" || 
                                                    (qr.name && qr.name.toLowerCase().includes(qrSearchTerm.toLowerCase())) ||
                                                    (qr.info && qr.info.toLowerCase().includes(qrSearchTerm.toLowerCase()))
                                                )
                                                .map((qr) => (
                                                    <TableRow key={qr.id}>
                                                        <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Checkbox
                                                                checked={selectedQrId === qr.id.toString()}
                                                                onChange={() => handleSelectQr(qr.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            {qr.name || "QR Code"}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <QRCodeCanvas
                                                                value={qr.info || ""}
                                                                size={48}
                                                                level="H"
                                                                marginSize={1}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                    
                    {selectedQr && (
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <QRCodeCanvas
                                id="qrcode-canvas"
                                value={selectedQr.info || ""}
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
            
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push(`/slides/media-management/${slideId}`)}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {media ? "Guardar Cambios" : "Crear"}
                </Button>
            </div>
        </Form>
    );
};

export default SlideMediaForm;