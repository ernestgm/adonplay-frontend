const es = {
    common: {
        select: {
            placeholder: "Selecciona una opción",
        },
        buttons: {
            cancel: "Cancelar",
            saveChanges: "Guardar Cambios",
            create: "Crear",
            activate: "Activar",
            delete: "Eliminar",
        },
        nav: {
            home: "Inicio",
            business: "Administrar Negocios",
            media: "Libreria de Medios",
            slides: "Administrar Slides",
            marquees: "Administrar Marquees",
            qrs: "Administrar QRs",
            devices: "Administrar Dispositivos",
        },
        table: {
            headers: {
                name: "Nombre",
                description: "Descripción",
                owner: "Propietario",
                actions: "Acciones",
                id: "ID",
                email: "Correo",
                phone: "Teléfono",
                status: "Estado",
                role: "Rol",
                user: "Usuario",
                deviceId: "ID del Dispositivo",
                code: "Código",
                slide: "Slide",
                qr: "QR",
                marquee: "Marquee",
                preview: "Vista previa",
                business: "Negocio",
                info: "Info",
                file: "Archivo",
                order: "Orden",
                audio: "Audio",
                video: "Video",
                duration: "Duración",
                slideName: "Nombre del Slide",
                createdAt: "Creado el",
                updatedAt: "Actualizado el",
            },
            actions: {
                edit: "Editar",
                delete: "Eliminar",
                view: "Ver",
                assign: "Asignar",
                activate: "Activar",
                settings: "Configuración",
                mediaManagement: "Gestión de Medios",
                moveUp: "Mover arriba",
                moveDown: "Mover abajo",
            },
            states: {
                loading: "Cargando...",
                empty: "No hay datos para mostrar",
            },
            filters: {
                searchPlaceholder: "Buscar...",
                itemsPerPage: "Ítems por página",
                itemsPerPageOption: "{n} ítems por página",
            },
            pagination: {
                previous: "Anterior",
                next: "Siguiente",
            },
            modals: {
                delete: {
                    title: "Advertencia",
                    message: "¿Estás seguro de que deseas eliminar los elementos seleccionados?",
                },
            },
        },
    },
    util: {
        video: {
            readDurationError: "No se pudo leer la duración del video",
        },
    },
    pages: {
        home: {
            pageTitle: "Inicio",
            cardTitle: "Inicio",
            adminPanel: {
                title: "Panel de Administración",
                subtitle: "Selecciona una herramienta para comenzar a gestionar tu plataforma",
            },
            meta: {
                title: "Inicio | {app}",
                description: "Inicio en {app}",
            },
        },
        activate: {
            pageTitle: "Activar Dispositivos",
            cardTitle: "Dispositivos",
            meta: {
                title: "Activar Dispositivos | {app}",
                description: "Activar Dispositivos en {app}",
            },
        },
        business: {
            pageTitle: "Negocios",
            cardTitle: "Negocios",
            createPageTitle: "Crear Negocio",
            editPageTitle: "Editar Negocio",
            meta: {
                title: "Negocios | {app}",
                description: "Negocios en {app}",
            },
        },
        devices: {
            pageTitle: "Dispositivos",
            cardTitle: "Dispositivos",
            editPageTitle: "Editar Dispositivo",
            createPageTitle: "Crear Dispositivo",
            meta: {
                title: "Dispositivos | {app}",
                description: "Dispositivos en {app}",
            },
        },
        devicesPermissions: {
            pageTitle: "Permisos de Dispositivos",
            cardTitle: "Permisos de Dispositivos",
            meta: {
                title: "Permisos de Dispositivos | {app}",
                description: "Permisos de Dispositivos en {app}",
            },
        },
        marquees: {
            pageTitle: "Marquees",
            cardTitle: "Marquees",
            createPageTitle: "Crear Marquee",
            editPageTitle: "Editar Marquee",
            meta: {
                title: "Marquees | {app}",
                description: "Marquees en {app}",
            },
        },
        qrcodes: {
            pageTitle: "Códigos QR",
            cardTitle: "Códigos QR",
            createPageTitle: "Crear Código QR",
            editPageTitle: "Editar Código QR",
            meta: {
                title: "Códigos QR | {app}",
                description: "Códigos QR en {app}",
            },
        },
        slides: {
            pageTitle: "Slides",
            cardTitle: "Slides",
            createPageTitle: "Crear Slide",
            editPageTitle: "Editar Slide",
            meta: {
                title: "Slides | {app}",
                description: "Slides en {app}",
            },
        },
        users: {
            pageTitle: "Usuarios",
            cardTitle: "Usuarios",
            createPageTitle: "Crear Usuario",
            editPageTitle: "Editar Usuario",
            meta: {
                title: "Usuarios | {app}",
                description: "Usuarios en {app}",
            },
        },
        mediaLibrary: {
            pageTitle: "Biblioteca de Medios",
            cardTitle: "Medios",
            createPageTitle: "Crear Medio",
            editPageTitle: "Editar Medio",
            detailsPageTitle: "Detalles del Medio",
            detailedViewPageTitle: "Detalles del Medio",
            detailsContent: {
                preview: "Vista previa",
                imagePreview: "Vista previa de imagen",
                audio: "Audio",
                information: "Información",
                type: "Tipo",
                owner: "Propietario",
                createdAt: "Creado el",
                updatedAt: "Actualizado el",
            },
            meta: {
                title: "Biblioteca de Medios | {app}",
                description: "Explora y gestiona medios en {app}",
            },
        },
        signIn: {
            pageTitle: "Iniciar Sesión",
            cardTitle: "Iniciar Sesión",
            meta: {
                title: "Iniciar Sesión | {app}",
                description: "Inicia sesión en {app}",
            },
        }
    },
    status: {
        enabled: "Habilitado",
        disabled: "Deshabilitado",
    },
    forms: {
        signIn: {
            labels: {
                email: "Correo electrónico",
                password: "Contraseña",
                signIn: "Entrar",
            },
            placeholders: {
                email: "Correo electrónico",
                password: "Intrduce tu contraseña",
            },
            errors: {
                invalidCredentials: "Correo electrónico o contraseña inválidos",
            },
            tips: {
                heading1: "Inicia sesión con tu correo electrónico y contraseña!",
            }
        },
        activateForm: {
            labels: {
                code: "Código *",
                owner: "Propietario *",
            },
            errors: {
                loadUsers: "Error al cargar usuarios para owner",
            },
        },
        mediaForm: {
            labels: {
                type: "Tipo *",
                ownerRequired: "Propietario *",
                ownerReadonly: "Propietario",
                videoPreview: "Vista previa del video",
                imageSingle: "Imagen JPG",
                imageMultiple: "Imagenes JPG",
                video: "MP4 Video",
                audio: "MP3 Audio",
                audioPreviewSingle: "Vista previa audio",
                audioPreviewMultiple: "Vista previa audios",
                imageSectionSingle: "Imagen",
                imageSectionMultiple: "Imagenes",
                audioNumber: "Audio {n}",
                imageAlt: "Imagen",
                imageAltNumber: "Imagen {n}",
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
                convertingVideo: "Convirtiendo video... No refresque el navegador",
                conversionFinished: "Conversión finalizada",
                uploadingVideo: "Subiendo video... No refresque el navegador",
            },
            messages: {
                itemUpdated: "Item actualizado correctamente",
                itemCreated: "Item creado correctamente",
            },
            hints: {
                keepImage: "Deja este campo vacio si no quieres cambiar la imagen.",
                keepVideo: "Deja este campo vacio si no quieres cambiar la video.",
                keepAudio: "Deja este campo vacio si no quieres cambiar la audio.",
            },
        },
        business: {
            labels: {
                name: "Nombre *",
                description: "Descripción",
                owner: "Propietario *",
            },
            errors: {
                loadOwners: "Error al cargar propietarios",
                saveItem: "Error al guardar negocio",
            },
        },
        devices: {
            labels: {
                deviceId: "ID del Dispositivo:",
                name: "Nombre *",
                user: "Usuario *",
                slides: "Slides",
                qr: "QR",
                marquee: "Marquee",
                presentationMode: "Modo Presentación",
                landscapeMode: "Modo Horizontal",
                portraitMode: "Modo Vertical",
            },
            placeholders: {
                noSlide: "Sin Slide",
                noQr: "Sin QR",
                noMarquee: "Sin Marquee",
            },
            sections: {
                settings: "Configuración",
            },
            errors: {
                loadUsers: "Error al cargar usuarios",
                loadSlides: "Error al cargar slides",
                loadQrs: "Error al cargar QRs",
                loadMarquees: "Error al cargar marquees",
                saveItem: "Error al guardar dispositivo",
            },
        },
        marquees: {
            labels: {
                name: "Nombre *",
                business: "Negocio *",
                message: "Mensaje *",
                backgroundColor: "Color de fondo *",
                textColor: "Color de texto *",
            },
            errors: {
                loadBusinesses: "Error al cargar negocios",
                saveItem: "Error al guardar marquee",
            },
        },
        qrcodes: {
            labels: {
                name: "Nombre *",
                business: "Negocio *",
                info: "Información *",
                position: "Posición del QR",
                example: "Ejemplo",
            },
            buttons: {
                downloadQr: "Descargar QR",
            },
            errors: {
                loadBusinesses: "Error al cargar negocios",
                saveItem: "Error al guardar QR",
            },
        },
        slides: {
            labels: {
                name: "Nombre *",
                description: "Descripción",
                business: "Negocio *",
                descriptionPosition: "Posición de Descripción",
                textSize: "Tamaño de Texto",
                example: "Ejemplo",
            },
            sections: {
                imagesDescriptionSettings: "Configuración de Descripción de Imágenes",
            },
            errors: {
                loadBusinesses: "Error al cargar negocios",
                saveItem: "Error al guardar slide",
            },
        },
        slideMedia: {
            labels: {
                selectMedia: "Seleccionar Media *",
                changeSelection: "Cambiar selección",
                changeSelectionWithCount: "Cambiar selección ({n})",
                noAudio: "Sin audio",
                audioAssigned: "Audio asignado: #{id}",
                assignAudio: "Asignar audio",
                durationSeconds: "Duración (segundos) *",
                description: "Descripción",
                descriptionPosition: "Posición de Descripción",
                textSize: "Tamaño de Texto",
                example: "Ejemplo",
                selectQr: "Seleccionar QR Code",
                selectedQr: "QR seleccionado",
                qrCode: "QR Code",
            },
            sections: {
                descriptionSettings: "Configuración de Descripción",
            },
            hints: {
                durationWithAudio: "Si una imagen tiene un audio asignado, la duración del audio tendrá prioridad.",
            },
            selector: {
                title: "Seleccionar Media",
                close: "Cerrar",
                searchPlaceholder: "Buscar media...",
                headers: {
                    select: "Seleccionar",
                    preview: "Vista previa",
                    type: "Tipo",
                },
                empty: "No hay media disponible",
            },
            qrSelector: {
                buttonSelect: "Seleccionar QR Code",
                title: "Seleccionar QR Code",
                close: "Cerrar",
                searchPlaceholder: "Buscar QR code...",
                headers: {
                    select: "Seleccionar",
                    name: "Nombre",
                    preview: "Vista previa",
                },
                empty: "No hay QR codes disponibles",
                change: "Cambiar",
                remove: "Quitar",
            },
            errors: {
                loadMedia: "Error al cargar media",
                loadQrs: "Error al cargar QRs",
                saveItem: "Error al guardar slide media",
                selectMediaRequired: "Debes seleccionar un media",
                selectAtLeastOne: "Debes seleccionar al menos un media",
            },
            messages: {
                updated: "Slide media actualizado correctamente",
                created: "Slide media creado correctamente",
            },
        },
    },
};

export default es;
