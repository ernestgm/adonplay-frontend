const en = {
    common: {
        select: {
            placeholder: "Select an option",
        },
        buttons: {
            cancel: "Cancel",
            saveChanges: "Save Changes",
            create: "Create",
            activate: "Activate",
            delete: "Delete",
        },
        nav: {
            home: "Home",
            business: "Business Management",
            media: "Media Library",
            slides: "Slide Management",
            marquees: "Marquees Management",
            qrs: "Qrs Code Management",
            devices: "Device Management",
        },
        table: {
            headers: {
                name: "Name",
                description: "Description",
                owner: "Owner",
                actions: "Actions",
                id: "ID",
                email: "Email",
                phone: "Phone",
                status: "Status",
                role: "Role",
                user: "User",
                deviceId: "Device ID",
                code: "Code",
                slide: "Slide",
                qr: "QR",
                marquee: "Marquee",
                preview: "Preview",
                business: "Business",
                info: "Info",
                file: "File",
                order: "Order",
                audio: "Audio",
                video: "Video",
                duration: "Duration",
                slideName: "Slide Name",
                createdAt: "Created at",
                updatedAt: "Updated at",
                devicesOn: "Devices Online",
                devicesOff: "Devices Offline",
            },
            actions: {
                edit: "Edit",
                delete: "Delete",
                view: "View",
                assign: "Assign",
                activate: "Activate",
                settings: "Settings",
                mediaManagement: "Media Management",
                moveUp: "Move up",
                moveDown: "Move down",
                monitor: "Monitor",
            },
            states: {
                loading: "Loading...",
                empty: "No data to display",
            },
            filters: {
                searchPlaceholder: "Search...",
                itemsPerPage: "Items per page",
                itemsPerPageOption: "{n} items per page",
            },
            pagination: {
                previous: "Previous",
                next: "Next",
            },
            modals: {
                delete: {
                    title: "Warning",
                    message: "Are you sure you want to delete the selected items?",
                },
            },
        },
    },
    status: {
        enabled: "Enabled",
        disabled: "Disabled",
    },
    util: {
        video: {
            readDurationError: "Could not read the video duration",
        },
        ram: "RAM",
        disk: "Disk",
        cpu: "CPU"
    },
    pages: {
        home: {
            pageTitle: "Home",
            cardTitle: "Home",
            adminPanel: {
                title: "Administration Panel",
                subtitle: "Select a tool to begin managing your platform.",
            },
            meta: {
                title: "Home | {app}",
                description: "This is HomePage in {app}",
            },
        },
        activate: {
            pageTitle: "Activate Devices",
            cardTitle: "Devices",
            meta: {
                title: "Activate Devices | {app}",
                description: "Activate devices in {app}",
            },
        },
        business: {
            pageTitle: "Business",
            cardTitle: "Businesses",
            createPageTitle: "Create Business",
            editPageTitle: "Edit Business",
            meta: {
                title: "Business | {app}",
                description: "Manage businesses in {app}",
            },
        },
        devices: {
            pageTitle: "Devices",
            cardTitle: "Devices",
            editPageTitle: "Edit Device",
            createPageTitle: "Create Device",
            meta: {
                title: "Devices | {app}",
                description: "Manage devices in {app}",
            },
        },
        devicesPermissions: {
            pageTitle: "Devices Permissions",
            cardTitle: "Devices Permissions",
            meta: {
                title: "Devices Permissions | {app}",
                description: "Manage device permissions in {app}",
            },
        },
        marquees: {
            pageTitle: "Marquees",
            cardTitle: "Marquees",
            createPageTitle: "Create Marquee",
            editPageTitle: "Edit Marquee",
            meta: {
                title: "Marquees | {app}",
                description: "Manage marquees in {app}",
            },
        },
        qrcodes: {
            pageTitle: "QR Codes",
            cardTitle: "QR Codes",
            createPageTitle: "Create QR Code",
            editPageTitle: "Edit QR Code",
            meta: {
                title: "QR Codes | {app}",
                description: "Manage QR Codes in {app}",
            },
        },
        slides: {
            pageTitle: "Slides",
            cardTitle: "Slides",
            createPageTitle: "Create Slide",
            editPageTitle: "Edit Slide",
            meta: {
                title: "Slides | {app}",
                description: "Manage slides in {app}",
            },
        },
        users: {
            pageTitle: "Users",
            cardTitle: "Users",
            createPageTitle: "Create User",
            editPageTitle: "Edit User",
            meta: {
                title: "Users | {app}",
                description: "Manage users in {app}",
            },
        },
        mediaLibrary: {
            pageTitle: "Media Library",
            cardTitle: "Media",
            createPageTitle: "Create Media",
            editPageTitle: "Edit Media",
            detailedViewPageTitle: "Detailed View",
            detailsContent: {
                preview: "Preview",
                imagePreview: "Image preview",
                audio: "Audio",
                information: "Information",
                owner: "Owner",
                type: "Type",
                createdAt: "Created at",
                updatedAt: "Updated at",
            },
            meta: {
                title: "Media Library | {app}",
                description: "Browse and manage media in {app}",
            },
        },
        signIn: {
            pageTitle: "Sign In",
            cardTitle: "Sign In",
            meta: {
                title: "Sign In | {app}",
                description: "Sign In to {app}",
            },
        },
        monitorDevices: {
            pageTitle: "Monitor Devices",
            cardTitle: "Monitor Devices",
            viewPageTitle: "Monitor Device",
            meta: {
                title: "Monitor Devices | {app}",
                description: "This is Monitor Devices in {app}",
            },
        },
    },
    forms: {
        signIn: {
            labels: {
                email: "Email *",
                password: "Password *",
                signIn: "Sign In",
            },
            placeholders: {
                email: "Email",
                password: "Enter your password",
            },
            errors: {
                invalidCredentials: "Invalid credentials",
            },
            tips: {
                heading1: "Enter your email and password to sign in!",
            }
        },
        activateForm: {
            labels: {
                code: "Code *",
                owner: "Owner *",
            },
            errors: {
                loadUsers: "Error loading users for owner",
            },
        },
        mediaForm: {
            labels: {
                type: "Type *",
                ownerRequired: "Owner *",
                ownerReadonly: "Owner",
                videoPreview: "Video preview",
                imageSingle: "JPG Image",
                imageMultiple: "JPG Images",
                video: "MP4 Video",
                audio: "MP3 Audio",
                audioPreviewSingle: "Audio preview",
                audioPreviewMultiple: "Audios preview",
                imageSectionSingle: "Image",
                imageSectionMultiple: "Images",
                audioNumber: "Audio {n}",
                imageAlt: "Image",
                imageAltNumber: "Image {n}",
            },
            owner: {
                you: "You",
                notAdminHint: "Since you are not an administrator, you will automatically be the owner of the content.",
            },
            errors: {
                imageOnlyJpg: "Only JPG images are allowed",
                audioOnlyMp3: "Only MP3 audio is allowed",
                singleVideoOnly: "Only one video can be uploaded",
                videoOnlyMp4: "Only MP4 video is allowed",
                videoDurationMax: "Video duration must be less than or equal to 1 minute",
                videoDurationUnreadable: "Could not validate the video duration",
                mustSelectFile: "You must select a file",
                fetchUsers: "Error fetching users",
                saveItem: "Error saving the item",
            },
            status: {
                convertingVideo: "Converting video... Don`t refresh the browser",
                conversionFinished: "Conversion finished",
                uploadingVideo: "Uploading video... Don`t refresh the browser",
            },
            messages: {
                itemUpdated: "Item updated successfully",
                itemCreated: "Item created successfully",
            },
            hints: {
                keepImage: "Leave this field empty if you don't want to change the existing image.",
                keepVideo: "Leave this field empty if you don't want to change the existing video.",
                keepAudio: "Leave this field empty if you don't want to change the existing audio.",
            },
        },
        business: {
            labels: {
                name: "Name *",
                description: "Description",
                owner: "Owner *",
            },
            errors: {
                loadOwners: "Error loading owners",
                saveItem: "Error saving business",
            },
        },
        devices: {
            labels: {
                deviceId: "Device ID:",
                name: "Name *",
                user: "User *",
                slides: "Slides",
                qr: "QR",
                marquee: "Marquee",
                presentationMode: "Presentation Mode",
                landscapeMode: "Landscape Mode",
                portraitMode: "Portrait Mode",
            },
            placeholders: {
                noSlide: "No Slide",
                noQr: "No QR",
                noMarquee: "No Marquee",
            },
            sections: {
                settings: "Settings",
            },
            errors: {
                loadUsers: "Error loading users",
                loadSlides: "Error loading slides",
                loadQrs: "Error loading QRs",
                loadMarquees: "Error loading marquees",
                saveItem: "Error saving device",
            },
        },
        marquees: {
            labels: {
                name: "Name *",
                business: "Business *",
                message: "Message *",
                backgroundColor: "Background color *",
                textColor: "Text color *",
            },
            errors: {
                loadBusinesses: "Error loading businesses",
                saveItem: "Error saving marquee",
            },
        },
        qrcodes: {
            labels: {
                name: "Name *",
                business: "Business *",
                info: "Information *",
                position: "QR Position",
                example: "Example",
            },
            buttons: {
                downloadQr: "Download QR",
            },
            errors: {
                loadBusinesses: "Error loading businesses",
                saveItem: "Error saving QR",
            },
        },
        slides: {
            labels: {
                name: "Name *",
                description: "Description",
                business: "Business *",
                descriptionPosition: "Description Position",
                textSize: "Text Size",
                example: "Example",
            },
            sections: {
                imagesDescriptionSettings: "Images Description Settings",
            },
            errors: {
                loadBusinesses: "Error loading businesses",
                saveItem: "Error saving slide",
            },
        },
        users: {
            labels: {
                name: "Name",
                email: "Email",
                phone: "Phone",
                role: "Role",
                enabled: "Enabled",
                password: "Password",
                confirmPassword: "Confirm Password",
            },
            errors: {
                saveItem: "Error saving user",
            },
        },
        slideMedia: {
            labels: {
                selectMedia: "Select Media *",
                changeSelection: "Change selection",
                changeSelectionWithCount: "Change selection ({n})",
                noAudio: "No audio",
                audioAssigned: "Assigned audio: #{id}",
                assignAudio: "Assign audio",
                durationSeconds: "Duration (seconds) *",
                description: "Description",
                descriptionPosition: "Description Position",
                textSize: "Text Size",
                example: "Example",
                selectQr: "Select QR Code",
                selectedQr: "Selected QR",
                qrCode: "QR Code",
            },
            sections: {
                descriptionSettings: "Description Settings",
            },
            hints: {
                durationWithAudio: "If an image has an assigned audio, the audio duration will take precedence.",
            },
            selector: {
                title: "Select Media",
                close: "Close",
                searchPlaceholder: "Search media...",
                headers: {
                    select: "Select",
                    preview: "Preview",
                    type: "Type",
                },
                empty: "No media available",
            },
            qrSelector: {
                buttonSelect: "Select QR Code",
                title: "Select QR Code",
                close: "Close",
                searchPlaceholder: "Search QR code...",
                headers: {
                    select: "Select",
                    name: "Name",
                    preview: "Preview",
                },
                empty: "No QR codes available",
                change: "Change",
                remove: "Remove",
            },
            errors: {
                loadMedia: "Error loading media",
                loadQrs: "Error loading QRs",
                saveItem: "Error saving slide media",
                selectMediaRequired: "You must select a media",
                selectAtLeastOne: "You must select at least one media",
            },
            messages: {
                updated: "Slide media updated successfully",
                created: "Slide media created successfully",
            },
        },
    },
};

export default en;
