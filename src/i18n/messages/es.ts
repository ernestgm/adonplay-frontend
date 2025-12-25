const es = {
  mediaForm: {
    labels: {
      type: "Tipo *",
      ownerRequired: "Propietario *",
      ownerReadonly: "Propietario",
      videoPreview: "Vista previa del video",
    },
    owner: {
      you: "Tú",
      notAdminHint: "Como no eres administrador, automáticamente serás el propietario del contenido.",
    },
    errors: {
      imageOnlyJpg: "Solo se permiten imágenes JPG",
      audioOnlyMp3: "Solo se permiten audios MP3",
      singleVideoOnly: "Solo se puede subir un video",
      videoOnlyMp4: "Solo se permite video MP4",
      videoDurationMax: "La duración del video debe ser menor o igual a 1 minuto",
      videoDurationUnreadable: "No se pudo validar la duración del video",
      mustSelectFile: "Debes seleccionar un archivo",
      fetchUsers: "Error al obtener usuarios",
      saveItem: "Error al guardar el item",
    },
    status: {
      convertingVideo: "Convirtiendo video...",
      conversionFinished: "Conversión finalizada",
      uploadingVideo: "Subiendo video...",
    },
    messages: {
      itemUpdated: "Item actualizado correctamente",
      itemCreated: "Item creado correctamente",
    },
  },
  util: {
    video: {
      readDurationError: "No se pudo leer la duración del video",
    },
  },
};

export default es;
