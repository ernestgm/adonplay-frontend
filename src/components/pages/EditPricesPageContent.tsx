"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {useError} from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import {getMedia, updateMedia} from "@/server/api/media";
import {useT} from "@/i18n/I18nProvider";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {useMessage} from "@/context/MessageContext";
import {uploadFileToStorage, deleteFileByDownloadURL, uploadFileToStorageWithProgress} from "@/utils/firebaseStorage";

const EditPricesPageContent = () => {
    const params = useParams();
    const router = useRouter();
    const mid = params.mid;
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState<any>(null);
    const [jsonContent, setJsonContent] = useState<any>(null);
    const [loadingJson, setLoadingJson] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [uploadProgress, setUploadProgress] = useState<number>(0);


    const tStates = useT("common.table.states");
    const tCommon = useT("common.buttons");
    const tForm = useT("forms.mediaForm");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getMedia(mid);
                setMedia(data);
                
                if (data.json_path) {
                    setLoadingJson(true);
                    try {
                        const response = await fetch(data.json_path);
                        if (response.ok) {
                            const json = await response.json();
                            setJsonContent(json);
                            extractTextFields(json);
                        } else {
                            console.error("Failed to fetch JSON content");
                        }
                    } catch (err) {
                        console.error("Error fetching JSON content:", err);
                    } finally {
                        setLoadingJson(false);
                    }
                }
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al obtener media");
            } finally {
                setLoading(false);
            }
        };

        if (mid) {
            fetchData();
        }
    }, [mid, setError]);

    const extractTextFields = (json: any) => {
        const values: Record<string, string> = {};
        
        // El JSON proporcionado tiene una estructura donde los elementos están en un array si es una lista
        // o son objetos directos. Vamos a buscar recursivamente cualquier objeto que tenga "type": "text"
        
        const search = (obj: any, path: string = "") => {
            if (!obj || typeof obj !== 'object') return;

            if (obj.type === "text" && typeof obj.text === 'string') {
                values[path || "root"] = obj.text;
                return;
            }

            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    search(item, path ? `${path}[${index}]` : `[${index}]`);
                });
            } else {
                for (const key in obj) {
                    search(obj[key], path ? `${path}.${key}` : key);
                }
            }
        };

        search(json);
        setFormValues(values);
    };

    const handleInputChange = (path: string, value: string) => {
        setFormValues(prev => ({ ...prev, [path]: value }));
    };

    const updateJsonWithFormValues = (json: any, values: Record<string, string>) => {
        const newJson = JSON.parse(JSON.stringify(json));

        const update = (obj: any, path: string = "") => {
            if (!obj || typeof obj !== 'object') return;

            if (obj.type === "text" && values.hasOwnProperty(path || "root")) {
                obj.text = values[path || "root"];
                return;
            }

            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    update(item, path ? `${path}[${index}]` : `[${index}]`);
                });
            } else {
                for (const key in obj) {
                    update(obj[key], path ? `${path}.${key}` : key);
                }
            }
        };

        update(newJson);
        return newJson;
    };

    const handleSave = async () => {
        if (!media || !jsonContent) return;

        setSaving(true);
        try {
            const updatedJson = updateJsonWithFormValues(jsonContent, formValues);
            const jsonString = JSON.stringify(updatedJson, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const file = new File([blob], `media_${media.id}.json`, { type: 'application/json' });

            // Subir nuevo JSON
            const uploaded = await uploadFileToStorageWithProgress(file, `media/json`,(p) => setUploadProgress(p));
            
            // Actualizar media en el backend
            await updateMedia(media.id, {
                ...media,
                json_path: uploaded.downloadURL
            });

            // Borrar el anterior si existía y es diferente (opcional, pero limpio)
            if (media.json_path && media.json_path !== uploaded.downloadURL) {
                try {
                    await deleteFileByDownloadURL(media.json_path);
                } catch (e) {
                    console.error("Failed to delete old JSON file", e);
                }
            }

            setJsonContent(updatedJson);
            setMedia({ ...media, json_path: uploaded.downloadURL });
            setMessage(tForm("messages.itemUpdated"));
            router.push(`/media-library`);
        } catch (err: any) {
            setError(err.data?.message || err.message || "Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        router.push(`/media-library`);
    };

    if (loading) {
        return <div className="p-4">{tStates("loading")}</div>;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle={tForm("labels.editPrices")} onBack={handleBack}/>
            
            <div className="p-6 bg-white rounded shadow mt-4">
                {(saving && uploadProgress > 0) && (
                    <div className="mt-3">
                        <div className="text-sm text-gray-700">{tForm("status.uploadingVideo")}</div>
                        <div className="w-full bg-gray-200 rounded h-2 mt-1">
                            <div className="bg-green-600 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{ Math.round(uploadProgress)}%</div>
                    </div>
                )}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{tForm("labels.jsonFields")}</h3>
                    {Object.keys(formValues).length > 0 && (
                        <Button onClick={handleSave} loading={saving}>
                            {tCommon("saveChanges")}
                        </Button>
                    )}
                </div>
                
                {loadingJson ? (
                    <div>{tStates("loading")}</div>
                ) : Object.keys(formValues).length > 0 ? (
                    <div className="space-y-4 flex flex-col">
                        {Object.entries(formValues).map(([path, value], index) => (
                            <div key={path}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {`Texto ${index + 1}`}
                                </label>
                                <Input
                                    value={value}
                                    onChange={(e) => handleInputChange(path, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic">
                        {media?.json_path ? "No se encontraron campos de texto editables en el JSON" : "No hay archivo JSON asociado"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditPricesPageContent;
