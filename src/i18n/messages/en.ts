const en = {
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
      convertingVideo: "Converting video...",
      conversionFinished: "Conversion finished",
      uploadingVideo: "Uploading video...",
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
  common: {
    buttons: {
      cancel: "Cancel",
      saveChanges: "Save Changes",
      create: "Create",
    },
  },
  util: {
    video: {
      readDurationError: "Could not read the video duration",
    },
  },
};

export default en;
