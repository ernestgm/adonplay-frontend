const config = {
  itemsPerPageOptions: [10, 20, 50],
  defaultItemsPerPage: 10,
  roleValues: [{
    value: 1,
    label: "Administrator"
  }, {
    value: 2,
    label: "Owner"
  }],
  countries: [
    { code: "US", label: "+1" },
  ],
  positions: [
    { value: "tl", label: "Top Left" },
    { value: "tc", label: "Top Center" },
    { value: "tr", label: "Top Right" },
    { value: "ml", label: "Middle Left" },
    { value: "mc", label: "Middle Center" },
    { value: "mr", label: "Middle Right" },
    { value: "bl", label: "Bottom Left" },
    { value: "bc", label: "Bottom Center" },
    { value: "br", label: "Bottom Right" },
  ],
  text_sizes: [
    { value: "xs", label: "Extra Small" },
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "Extra Large" },
  ]
};

export default config;
