// GPS station data from the Icelandic Meteorological Office
export interface GpsStation {
    id: number
    marker: string
    name: string
    information_url: string
    rinex_url: string
    coordinates: {
        lat: number
        lon: number
        altitude: number
    }
    date_from: string
    date_to: string | null
    agency: {
        name: string
    }
}

// GPS stations data from the Icelandic Meteorological Office
export const GPS_STATIONS: GpsStation[] = [
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 20,
        marker: "AKUR",
        name: "Akureyri",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=AKUR",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=AKUR",
        coordinates: {
            altitude: 134.21,
            lon: -18.1225,
            lat: 65.6854,
        },
        date_to: null,
        date_from: "2001-07-31T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 25,
        marker: "STOR",
        name: "Stórólfshvoll",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=STOR",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=STOR",
        coordinates: {
            altitude: 124.84,
            lon: -20.2121,
            lat: 63.7527,
        },
        date_to: null,
        date_from: "2001-06-09T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 26,
        marker: "HAMR",
        name: "Hamragarðaheiði",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HAMR",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HAMR",
        coordinates: {
            altitude: 160.39,
            lon: -19.9857,
            lat: 63.6224,
        },
        date_to: null,
        date_from: "1992-08-07T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 27,
        marker: "AUST",
        name: "Austmannsbunga",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=AUST",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=AUST",
        coordinates: {
            altitude: 1438.36,
            lon: -19.0806,
            lat: 63.6744,
        },
        date_to: null,
        date_from: "1993-06-08T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 11,
        marker: "FJOC",
        name: "Fjórðungsalda",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=FJOC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=FJOC",
        coordinates: {
            altitude: 1034.95,
            lon: -18.0061,
            lat: 64.8749,
        },
        date_to: null,
        date_from: "2007-09-03T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 17,
        marker: "JOKU",
        name: "Jökulheimar",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=JOKU",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=JOKU",
        coordinates: {
            altitude: 740.69,
            lon: -18.24,
            lat: 64.3096,
        },
        date_to: null,
        date_from: "2006-03-01T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 33,
        marker: "HAUD",
        name: "Haukadalur",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HAUD",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HAUD",
        coordinates: {
            altitude: 166.59,
            lon: -19.9644,
            lat: 63.9685,
        },
        date_to: null,
        date_from: "2006-11-20T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 31,
        marker: "FIM2",
        name: "Fimmvörðuháls",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=FIM2",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=FIM2",
        coordinates: {
            altitude: 961.82,
            lon: -19.4338,
            lat: 63.6101,
        },
        date_to: null,
        date_from: "2010-03-19T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 34,
        marker: "SODU",
        name: "Söðulfell",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=SODU",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=SODU",
        coordinates: {
            altitude: 788.08,
            lon: -19.5858,
            lat: 63.9626,
        },
        date_to: null,
        date_from: "2011-07-05T21:18:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 12,
        marker: "KISA",
        name: "Kista",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=KISA",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=KISA",
        coordinates: {
            altitude: 1631.72,
            lon: -17.5621,
            lat: 64.6742,
        },
        date_to: null,
        date_from: "2015-07-09T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 10,
        marker: "SKRO",
        name: "Skrokkalda",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=SKRO",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=SKRO",
        coordinates: {
            altitude: 982.49,
            lon: -18.3782,
            lat: 64.5568,
        },
        date_to: null,
        date_from: "2000-01-01T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 18,
        marker: "GFUM",
        name: "Grímsfjall",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=GFUM",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=GFUM",
        coordinates: {
            altitude: 1790.8,
            lon: -17.2666,
            lat: 64.4068,
        },
        date_to: null,
        date_from: "2004-09-28T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 2,
        marker: "VMEY",
        name: "Vestmannaeyjar",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=VMEY",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=VMEY",
        coordinates: {
            altitude: 135.28,
            lon: -20.2936,
            lat: 63.427,
        },
        date_to: null,
        date_from: "2000-07-26T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 15,
        marker: "HAFS",
        name: "Hamarinn",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HAFS",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HAFS",
        coordinates: {
            altitude: 1619.5,
            lon: -17.822,
            lat: 64.4803,
        },
        date_to: null,
        date_from: "2008-05-29T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 13,
        marker: "GSIG",
        name: "Gengissigid",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=GSIG",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=GSIG",
        coordinates: {
            altitude: 1846.13,
            lon: -16.6775,
            lat: 64.6781,
        },
        date_to: null,
        date_from: "2014-06-04T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 21,
        marker: "TORK",
        name: "Torfajökull-Kaldaklof ",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=TORK",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=TORK",
        coordinates: {
            altitude: 962.33,
            lon: -19.0708,
            lat: 63.9088,
        },
        date_to: null,
        date_from: "2022-04-17T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 5,
        marker: "ISAK",
        name: "Ísakot",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=ISAK",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=ISAK",
        coordinates: {
            altitude: 319.48,
            lon: -19.7472,
            lat: 64.1193,
        },
        date_to: null,
        date_from: "1992-06-13T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 19,
        marker: "TKJ2",
        name: "Tungnakvislarjokulsskrida lower ",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=TKJ2",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=TKJ2",
        coordinates: {
            altitude: 717.6,
            lon: -19.2059,
            lat: 63.3915,
        },
        date_to: null,
        date_from: "2020-06-29T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 32,
        marker: "OFEL",
        name: "Öldufell",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=OFEL",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=OFEL",
        coordinates: {
            altitude: 535.63,
            lon: -18.8409,
            lat: 63.7516,
        },
        date_to: null,
        date_from: "2010-11-22T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 24,
        marker: "HRIC",
        name: "Hrímalda",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HRIC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HRIC",
        coordinates: {
            altitude: 899.48,
            lon: -16.924,
            lat: 64.9504,
        },
        date_to: null,
        date_from: "2014-08-23T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 8,
        marker: "KIDC",
        name: "Kiðagilsdrög",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=KIDC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=KIDC",
        coordinates: {
            altitude: 935.16,
            lon: -17.9424,
            lat: 65.0192,
        },
        date_to: null,
        date_from: "2007-09-01T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 28,
        marker: "KRAC",
        name: "Krafla",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=KRAC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=KRAC",
        coordinates: {
            altitude: 521.92,
            lon: -16.7749,
            lat: 65.6945,
        },
        date_to: null,
        date_from: "2011-11-08T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 30,
        marker: "STE2",
        name: "Steinsholt",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=STE2",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=STE2",
        coordinates: {
            altitude: 290.47,
            lon: -19.6085,
            lat: 63.677,
        },
        date_to: null,
        date_from: "2010-03-18T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 6,
        marker: "DYNC",
        name: "Dyngjuháls",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=DYNC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=DYNC",
        coordinates: {
            altitude: 1208.53,
            lon: -17.3663,
            lat: 64.7906,
        },
        date_to: null,
        date_from: "2008-08-26T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 29,
        marker: "ENTC",
        name: "Enta",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=ENTC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=ENTC",
        coordinates: {
            altitude: 1423.03,
            lon: -19.1822,
            lat: 63.7011,
        },
        date_to: null,
        date_from: "2011-05-29T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 16,
        marker: "RJUC",
        name: "Rjúpnabrekkukvísl",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=RJUC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=RJUC",
        coordinates: {
            altitude: 1052.29,
            lon: -17.5274,
            lat: 64.7431,
        },
        date_to: null,
        date_from: "2015-09-15T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 36,
        marker: "HVOL",
        name: "Láguhvolar",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HVOL",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HVOL",
        coordinates: {
            altitude: 264.73,
            lon: -18.8475,
            lat: 63.5263,
        },
        date_to: null,
        date_from: "1999-10-19T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 4,
        marker: "HUSM",
        name: "Húsmúli",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HUSM",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HUSM",
        coordinates: {
            altitude: 313.29,
            lon: -21.4173,
            lat: 64.0667,
        },
        date_to: null,
        date_from: "2012-04-09T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 23,
        marker: "GONH",
        name: "Gónhóll",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=GONH",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=GONH",
        coordinates: {
            altitude: 347.5,
            lon: -22.2703,
            lat: 63.8855,
        },
        date_to: null,
        date_from: "2021-08-17T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 1,
        marker: "HVEL",
        name: "Hveravellir",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HVEL",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HVEL",
        coordinates: {
            altitude: 710.15,
            lon: -19.5612,
            lat: 64.873,
        },
        date_to: null,
        date_from: "2006-08-10T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 22,
        marker: "TKJS",
        name: "Tungnakvíslarjökulsskriða ",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=TKJS",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=TKJS",
        coordinates: {
            altitude: 900.08,
            lon: -19.202,
            lat: 63.3915,
        },
        date_to: null,
        date_from: "2019-08-16T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 3,
        marker: "RHOF",
        name: "Raufarhöfn",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=RHOF",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=RHOF",
        coordinates: {
            altitude: 76.91,
            lon: -15.9467,
            lat: 66.4611,
        },
        date_to: null,
        date_from: "2001-07-19T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 14,
        marker: "THOC",
        name: "Þorvaldshraun",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=THOC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=THOC",
        coordinates: {
            altitude: 749.99,
            lon: -16.6756,
            lat: 64.9337,
        },
        date_to: null,
        date_from: "2014-08-30T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 35,
        marker: "SKOG",
        name: "Skógá",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=SKOG",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=SKOG",
        coordinates: {
            altitude: 669.65,
            lon: -19.4455,
            lat: 63.5764,
        },
        date_to: "2017-07-03T00:00:00Z",
        date_from: "1992-05-25T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 9,
        marker: "HAUC",
        name: "Haumýrar",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HAUC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HAUC",
        coordinates: {
            altitude: 726.47,
            lon: -18.3448,
            lat: 64.7115,
        },
        date_to: null,
        date_from: "2007-09-02T00:00:00Z",
    },
    {
        agency: {
            name: "Icelandic Meteorological Office",
        },
        id: 7,
        marker: "VONC",
        name: "Vonarskarð",
        information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=VONC",
        rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=VONC",
        coordinates: {
            altitude: 1082.24,
            lon: -17.7544,
            lat: 64.6736,
        },
        date_to: null,
        date_from: "2013-08-23T00:00:00Z",
    },
]