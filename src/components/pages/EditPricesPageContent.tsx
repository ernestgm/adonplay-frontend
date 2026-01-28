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
import {deleteFileByDownloadURL, uploadFileToStorageWithProgress, getStoragePathFromDownloadURL, uploadFileToExactPathWithProgress} from "@/utils/firebaseStorage";
import {PsdJsonEditor} from "@/lib/PsdJsonEditor";
import {PsdJsonRenderer} from "@/lib/PsdJsonRenderer";

const EditPricesPageContent = () => {
    const params = useParams();
    const router = useRouter();
    const mid = params.mid;
    const { setError } = useError();
    const { setMessage } = useMessage();
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState<any>(null);
    const [jsonContent, setJsonContent] = useState<any>(null);
    const [loadingJson, setLoadingJson] = useState(false);
    const [saving, setSaving] = useState(false);

    // Ahora editableLayers contendrá la estructura de árbol (grupos y textos)
    const [editableLayers, setEditableLayers] = useState<any[]>([]);

    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadJsonProgress, setUploadJsonProgress] = useState<number>(0);

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

                            // Inicializamos el editor con la nueva lógica de jerarquía
                            const editor = new PsdJsonEditor(json);
                            // Obtenemos el árbol estructurado
                            setEditableLayers(editor.getHierarchy());
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

        if (mid) fetchData();
    }, [mid, setError]);

    const handleInputChange = (id: number, value: string) => {
        // Función recursiva que mapea y actualiza
        const updateRecursive = (nodes: any[]): any[] => {
            return nodes.map(node => {
                // Verificamos si este es el nodo (usando _originalIdx que viene de la clase)
                if (node._originalIdx === id) {
                    return { ...node, value: value }; // Creamos copia con nuevo valor
                }

                // Si tiene hijos (es un grupo), buscamos dentro
                if (node._children && node._children.length > 0) {
                    return {
                        ...node,
                        _children: updateRecursive(node._children)
                    };
                }

                return node;
            });
        };

        // Actualizamos el estado con el nuevo árbol
        setEditableLayers(prevLayers => updateRecursive([...prevLayers]));
    };

    const handleSave = async () => {
        if (!media || !jsonContent) return;

        setSaving(true);
        setUploadProgress(0);
        try {
            const editor = new PsdJsonEditor(jsonContent);

            // Recorremos el árbol de la UI para aplicar los cambios al objeto de datos
            const applyUpdates = (nodes: any[]) => {
                nodes.forEach(node => {
                    if (node.text || node.type === 'text') {
                        // Usamos el ID original para asegurar que se guarde en la posición correcta
                        const targetId = node._originalIdx !== undefined ? node._originalIdx : node.id;
                        editor.updateTextLayer(targetId, node.value);
                    }
                    const children = node._children || node.children;
                    if (children && children.length > 0) {
                        applyUpdates(children);
                    }
                });
            };

            applyUpdates(editableLayers);
            const updatedJson = editor.getModifiedJson();

            // --- Lógica de Renderizado e Imagen ---
            const canvas = document.createElement("canvas");
            const renderer = new PsdJsonRenderer();
            await renderer.render(canvas, updatedJson);

            const imageBlob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to create blob from canvas"));
                }, "image/jpeg", 0.9);
            });

            const jsonFileName = media.json_path ? getStoragePathFromDownloadURL(media.json_path)?.split('/').pop() || `media_${media.id}.json` : `media_${media.id}.json`;
            const imageFileName = jsonFileName.replace(/\.json$/i, "") + ".jpg";

            const jsonFile = new File([JSON.stringify(updatedJson)], jsonFileName, { type: 'application/json' });
            const imageFile = new File([imageBlob], imageFileName, { type: 'image/jpeg' });

            // --- Subida a Firebase ---
            let uploadedJson;
            const existingJsonPath = getStoragePathFromDownloadURL(media.json_path);
            if (existingJsonPath) {
                uploadedJson = await uploadFileToExactPathWithProgress(jsonFile, existingJsonPath, (p) => setUploadJsonProgress(p * 0.5));
            } else {
                uploadedJson = await uploadFileToStorageWithProgress(jsonFile, `media/json`, (p) => setUploadJsonProgress(p * 0.5));
            }

            let uploadedImage;
            const existingImagePath = getStoragePathFromDownloadURL(media.file_path);
            if (existingImagePath) {
                uploadedImage = await uploadFileToExactPathWithProgress(imageFile, existingImagePath, (p) => setUploadProgress(50 + (p * 0.5)));
            } else {
                uploadedImage = await uploadFileToStorageWithProgress(imageFile, `media/image`, (p) => setUploadProgress(50 + (p * 0.5)));
            }

            // --- Actualización Backend ---
            await updateMedia(media.id, {
                ...media,
                file_path: uploadedImage.downloadURL,
                json_path: uploadedJson.downloadURL
            });

            setMessage(tForm("messages.itemUpdated"));
            router.push(`/media-library`);
        } catch (err: any) {
            setError(err.data?.message || err.message || "Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => router.push(`/media-library`);

    if (loading) return <div className="p-4">{tStates("loading")}</div>;

    return (
        <div>
            <PageBreadcrumb pageTitle={tForm("labels.editPrices")} onBack={handleBack}/>

            <div className="p-6 bg-white rounded shadow mt-4">
                {(saving && uploadProgress > 0) && (
                    <div className="mt-3">
                        <div className="text-sm text-gray-700">{tForm("status.updating")}</div>
                        <div className="w-full bg-gray-200 rounded h-2 mt-1">
                            <div className="bg-green-600 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{ Math.round(uploadProgress)}%</div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{tForm("labels.jsonFields")}</h3>
                    {editableLayers.length > 0 && (
                        <Button onClick={handleSave} loading={saving}>
                            {tCommon("saveChanges")}
                        </Button>
                    )}
                </div>

                {loadingJson ? (
                    <div>{tStates("loading")}</div>
                ) : editableLayers.length > 0 ? (
                    <div className="space-y-6">
                        {editableLayers.map((layer) => (
                            <LayerItem
                                key={layer._originalIdx || layer.id}
                                layer={layer}
                                onInputChange={handleInputChange}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic">
                        {media?.json_path ? "No se encontraron campos de texto editables" : "No hay archivo JSON"}
                    </div>
                )}

                <div className="flex gap-2 justify-end mb-4">
                    {editableLayers.length > 0 && (
                        <Button onClick={handleSave} loading={saving}>
                            {tCommon("saveChanges")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Componente Recursivo para Items de Capa
 */
const LayerItem = ({ layer, onInputChange, depth = 0 }: { layer: any, onInputChange: (id: number, value: string) => void, depth?: number }) => {
    const children = layer._children || layer.children;
    const isGroup = layer.type === 'group' || (children && children.length > 0);

    if (isGroup) {
        return (
            <div className={`border-b-neutral-500 border-2 p-4`}>
                <h4 className="text-base font-bold text-gray-500 mb-2 uppercase">{layer.name}</h4>
                {children.map((child: any) => (
                    <LayerItem
                        key={child._originalIdx}
                        layer={child}
                        onInputChange={onInputChange}
                        depth={depth + 1}
                    />
                ))}
            </div>
        );
    }

    if (layer.text && layer.value !== undefined) {
        // Detectamos si el valor tiene saltos de línea
        const hasNewLines = layer.value && layer.value.includes('\n');

        return (
            <div className="mb-4">
                {hasNewLines ? (
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-sm min-h-[100px] resize-y"
                        value={layer.value || ""}
                        onChange={(e) => onInputChange(layer._originalIdx, e.target.value)}
                        placeholder="Escribe el texto aquí..."
                    />
                ) : (
                    <Input
                        value={layer.value || ""}
                        onChange={(e) => onInputChange(layer._originalIdx, e.target.value)}
                    />
                )}
            </div>
        );
    }

    return null;
};

export default EditPricesPageContent;