export interface CityMeta {
  flag: string;
  nameDE: string;
  nameEN: string;
}

export const CITY_META: Record<string, CityMeta> = {
  berlin:    { flag: '🇩🇪', nameDE: 'Berlin',    nameEN: 'Berlin'    },
  hamburg:   { flag: '🇩🇪', nameDE: 'Hamburg',   nameEN: 'Hamburg'   },
  muenchen:  { flag: '🇩🇪', nameDE: 'München',   nameEN: 'Munich'    },
  wien:      { flag: '🇦🇹', nameDE: 'Wien',      nameEN: 'Vienna'    },
  zuerich:   { flag: '🇨🇭', nameDE: 'Zürich',    nameEN: 'Zurich'    },
  lissabon:  { flag: '🇵🇹', nameDE: 'Lissabon',  nameEN: 'Lisbon'    },
  porto:     { flag: '🇵🇹', nameDE: 'Porto',     nameEN: 'Porto'     },
  madrid:    { flag: '🇪🇸', nameDE: 'Madrid',    nameEN: 'Madrid'    },
  barcelona: { flag: '🇪🇸', nameDE: 'Barcelona', nameEN: 'Barcelona' },
  valencia:  { flag: '🇪🇸', nameDE: 'Valencia',  nameEN: 'Valencia'  },
  amsterdam: { flag: '🇳🇱', nameDE: 'Amsterdam', nameEN: 'Amsterdam' },
  rotterdam: { flag: '🇳🇱', nameDE: 'Rotterdam', nameEN: 'Rotterdam' },
  dublin:    { flag: '🇮🇪', nameDE: 'Dublin',    nameEN: 'Dublin'    },
  valletta:  { flag: '🇲🇹', nameDE: 'Valletta',  nameEN: 'Valletta'  },
  tallinn:   { flag: '🇪🇪', nameDE: 'Tallinn',   nameEN: 'Tallinn'   },
  prag:      { flag: '🇨🇿', nameDE: 'Prag',      nameEN: 'Prague'    },
  budapest:  { flag: '🇭🇺', nameDE: 'Budapest',  nameEN: 'Budapest'  },
  dubai:     { flag: '🇦🇪', nameDE: 'Dubai',     nameEN: 'Dubai'     },
};

export const TOP_PAIRS: { from: string; to: string }[] = [
  // Berlin (10)
  { from: 'berlin', to: 'lissabon'  },
  { from: 'berlin', to: 'porto'     },
  { from: 'berlin', to: 'madrid'    },
  { from: 'berlin', to: 'barcelona' },
  { from: 'berlin', to: 'amsterdam' },
  { from: 'berlin', to: 'dublin'    },
  { from: 'berlin', to: 'tallinn'   },
  { from: 'berlin', to: 'prag'      },
  { from: 'berlin', to: 'budapest'  },
  { from: 'berlin', to: 'dubai'     },
  // München (8)
  { from: 'muenchen', to: 'lissabon'  },
  { from: 'muenchen', to: 'madrid'    },
  { from: 'muenchen', to: 'barcelona' },
  { from: 'muenchen', to: 'amsterdam' },
  { from: 'muenchen', to: 'dubai'     },
  { from: 'muenchen', to: 'valletta'  },
  { from: 'muenchen', to: 'prag'      },
  { from: 'muenchen', to: 'budapest'  },
  // Hamburg (4)
  { from: 'hamburg', to: 'lissabon'  },
  { from: 'hamburg', to: 'amsterdam' },
  { from: 'hamburg', to: 'dublin'    },
  { from: 'hamburg', to: 'tallinn'   },
  // Wien (4)
  { from: 'wien', to: 'lissabon'  },
  { from: 'wien', to: 'barcelona' },
  { from: 'wien', to: 'dubai'     },
  { from: 'wien', to: 'prag'      },
  // Zürich (3) + Berlin fill (1)
  { from: 'zuerich', to: 'lissabon' },
  { from: 'zuerich', to: 'dublin'   },
  { from: 'zuerich', to: 'dubai'    },
  { from: 'berlin',  to: 'valletta' },
];
